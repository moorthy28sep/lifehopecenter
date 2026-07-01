<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'db.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!$data || empty($data['name']) || empty($data['email']) || empty($data['phone'])) {
    echo json_encode([
        "success" => false,
        "message" => "Please provide your name, email and phone number."
    ]);
    exit();
}

$conn->query(
    "CREATE TABLE IF NOT EXISTS consultation_bookings (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        customer_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        selected_service VARCHAR(255) DEFAULT '',
        notes TEXT DEFAULT NULL,
        payment_id VARCHAR(255) DEFAULT NULL,
        amount_paid DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        payment_status VARCHAR(50) NOT NULL DEFAULT 'pending',
        booking_date_time DATETIME NOT NULL,
        checkout_session_id VARCHAR(255) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
);

$consultationFee = 1000;
$service = isset($data['selectedService']) ? $data['selectedService'] : 'Consultation';
$notes = isset($data['notes']) ? $data['notes'] : '';
$bookingDateTime = date('Y-m-d H:i:s');
$paymentStatus = 'pending';

$stmt = $conn->prepare(
    "INSERT INTO consultation_bookings
    (
        customer_name,
        email,
        phone,
        selected_service,
        notes,
        amount_paid,
        payment_status,
        booking_date_time
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
);

if (!$stmt) {
    echo json_encode([
        "success" => false,
        "message" => $conn->error
    ]);
    exit();
}

$stmt->bind_param("sssssdss", $data['name'], $data['email'], $data['phone'], $service, $notes, $consultationFee, $paymentStatus, $bookingDateTime);

if (!$stmt->execute()) {
    echo json_encode([
        "success" => false,
        "message" => $stmt->error
    ]);
    exit();
}

$bookingId = $stmt->insert_id;
$stmt->close();

$baseUrl = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https://' : 'http://';
$baseUrl .= $_SERVER['HTTP_HOST'] ?? 'lifehopewellness.com';
$successUrl = $baseUrl . '/booking-confirmation.html?booking_id=' . urlencode($bookingId) . '&session_id={CHECKOUT_SESSION_ID}';
$cancelUrl = $baseUrl . '/';

$stripeSecretKey = STRIPE_SECRET_KEY;

if ($stripeSecretKey) {
    $stripePayload = [
        'mode' => 'payment',
        'line_items' => [[
            'price_data' => [
                'currency' => 'inr',
                'product_data' => [
                    'name' => 'Consultation Booking'
                ],
                'unit_amount' => 100000
            ],
            'quantity' => 1
        ]],
        'success_url' => $successUrl,
        'cancel_url' => $cancelUrl,
        'customer_email' => $data['email'],
        'metadata' => [
            'booking_id' => (string) $bookingId,
            'selected_service' => $service
        ]
    ];

    $ch = curl_init('https://api.stripe.com/v1/checkout/sessions');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($stripePayload));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $stripeSecretKey,
        'Content-Type: application/x-www-form-urlencoded'
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    $stripeSession = json_decode($response, true);

    if ($httpCode >= 200 && $httpCode < 300 && !empty($stripeSession['url'])) {
        $updateStmt = $conn->prepare("UPDATE consultation_bookings SET checkout_session_id = ? WHERE id = ?");
        $updateStmt->bind_param("si", $stripeSession['id'], $bookingId);
        $updateStmt->execute();
        $updateStmt->close();

        echo json_encode([
            "success" => true,
            "url" => $stripeSession['url'],
            "booking_id" => $bookingId,
            "amount" => $consultationFee,
            "message" => "Booking created. Please complete payment to confirm your consultation."
        ]);
        $conn->close();
        exit();
    }
}

$successUrl = $baseUrl . '/booking-confirmation.html?booking_id=' . urlencode($bookingId);

echo json_encode([
    "success" => true,
    "url" => $successUrl,
    "booking_id" => $bookingId,
    "amount" => $consultationFee,
    "message" => "Booking created. Please complete payment to confirm your consultation."
]);

$conn->close();
