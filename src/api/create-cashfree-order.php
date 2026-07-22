<?php

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'db.php';
require_once 'config.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!$data || empty($data['name']) || empty($data['email']) || empty($data['phone'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Name, email, and phone are required.'
    ]);
    exit();
}

$customerName = trim($data['name']);
$customerEmail = trim($data['email']);
$customerPhone = trim($data['phone']);
$selectedService = trim($data['selectedService'] ?? 'Consultation Booking');
$notes = trim($data['notes'] ?? '');
$consultationFee = 1000.00;
$bookingDateTime = date('Y-m-d H:i:s');
$paymentStatus = 'pending';

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
        cashfree_order_id VARCHAR(255) DEFAULT NULL,
        cashfree_payment_id VARCHAR(255) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
);

$stmt = $conn->prepare(
    "INSERT INTO consultation_bookings (
        customer_name,
        email,
        phone,
        selected_service,
        notes,
        amount_paid,
        payment_status,
        booking_date_time
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
);

if (!$stmt) {
    echo json_encode([
        'success' => false,
        'message' => $conn->error
    ]);
    exit();
}

$stmt->bind_param(
    'ssssdsss',
    $customerName,
    $customerEmail,
    $customerPhone,
    $selectedService,
    $notes,
    $consultationFee,
    $paymentStatus,
    $bookingDateTime
);

if (!$stmt->execute()) {
    echo json_encode([
        'success' => false,
        'message' => $stmt->error
    ]);
    exit();
}

$bookingId = $stmt->insert_id;
$stmt->close();

$baseProtocol = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https://' : 'http://';
$baseUrl = $baseProtocol . ($_SERVER['HTTP_HOST'] ?? 'lifehopewellness.com');

$orderPayload = [
    'order_amount' => $consultationFee,
    'order_currency' => 'INR',
    'order_note' => 'Consultation Booking',
    'customer_details' => [
        'customer_id' => (string) $bookingId,
        'customer_name' => $customerName,
        'customer_email' => $customerEmail,
        'customer_phone' => $customerPhone,
    ],
    'order_meta' => [
        'return_url' => $baseUrl . '/booking-confirmation.html?booking_id=' . urlencode($bookingId),
        'notify_url' => $baseUrl . '/api/cashfree/webhook.php'
    ]
];

$ch = curl_init(CASHFREE_API_BASE . '/pg/v2/orders');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'x-client-id: ' . CASHFREE_APP_ID,
    'x-client-secret: ' . CASHFREE_SECRET_KEY,
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($orderPayload));

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($response === false) {
    echo json_encode([
        'success' => false,
        'message' => 'Cashfree API request failed: ' . $curlError
    ]);
    exit();
}

$orderResult = json_decode($response, true);

if ($httpCode < 200 || $httpCode >= 300 || empty($orderResult['status']) || strtolower($orderResult['status']) !== 'ok') {
    echo json_encode([
        'success' => false,
        'message' => 'Cashfree order creation failed.',
        'details' => $orderResult
    ]);
    exit();
}

$cashfreeOrderId = $orderResult['order_id'] ?? null;
$paymentSessionId = $orderResult['payment_session_id'] ?? null;
$appId = CASHFREE_APP_ID;
$amount = $consultationFee;

if (!$cashfreeOrderId || !$paymentSessionId) {
    echo json_encode([
        'success' => false,
        'message' => 'Cashfree returned an invalid order response.',
        'details' => $orderResult
    ]);
    exit();
}

$updateStmt = $conn->prepare('UPDATE consultation_bookings SET cashfree_order_id = ? WHERE id = ?');
$updateStmt->bind_param('si', $cashfreeOrderId, $bookingId);
$updateStmt->execute();
$updateStmt->close();

echo json_encode([
    'success' => true,
    'booking_id' => $bookingId,
    'order_id' => $cashfreeOrderId,
    'payment_session_id' => $paymentSessionId,
    'amount' => $amount,
    'app_id' => $appId,
    'customer_name' => $customerName,
    'email' => $customerEmail,
    'phone' => $customerPhone,
    'message' => 'Cashfree order created. Redirecting to payment checkout.'
]);

$conn->close();
'    