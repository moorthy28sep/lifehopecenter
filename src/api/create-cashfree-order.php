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

set_error_handler(function ($severity, $message, $file, $line) {
    throw new ErrorException($message, 0, $severity, $file, $line);
});

register_shutdown_function(function () {
    $error = error_get_last();
    if ($error && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR, E_RECOVERABLE_ERROR], true)) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Server error while creating payment order.'
        ]);
    }
});

try {
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
$doctorName = trim($data['doctorName'] ?? 'Care Team');
$appointmentDate = trim($data['appointmentDate'] ?? '');
$appointmentTime = trim($data['appointmentTime'] ?? '');
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
        doctor_name VARCHAR(255) DEFAULT '',
        appointment_date DATE DEFAULT NULL,
        appointment_time VARCHAR(50) DEFAULT '',
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

$columnTypes = [
    'doctor_name' => 'VARCHAR(255) DEFAULT \'\'',
    'appointment_date' => 'DATE DEFAULT NULL',
    'appointment_time' => 'VARCHAR(50) DEFAULT \'\'',
];

foreach ($columnTypes as $column => $columnType) {
    $check = $conn->query("SHOW COLUMNS FROM consultation_bookings LIKE '" . $conn->real_escape_string($column) . "'");
    if ($check && $check->num_rows === 0) {
        $conn->query("ALTER TABLE consultation_bookings ADD COLUMN $column $columnType");
    }
}

$stmt = $conn->prepare(
    "INSERT INTO consultation_bookings (
        customer_name,
        email,
        phone,
        selected_service,
        doctor_name,
        appointment_date,
        appointment_time,
        notes,
        amount_paid,
        payment_status,
        booking_date_time
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
);

if (!$stmt) {
    echo json_encode([
        'success' => false,
        'message' => $conn->error
    ]);
    exit();
}

$stmt->bind_param(
    'ssssssssdss',
    $customerName,
    $customerEmail,
    $customerPhone,
    $selectedService,
    $doctorName,
    $appointmentDate,
    $appointmentTime,
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

if (empty(CASHFREE_APP_ID) || empty(CASHFREE_SECRET_KEY)) {
    echo json_encode([
        'success' => false,
        'message' => 'Cashfree credentials are not configured on the server.'
    ]);
    exit();
}

$scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (!empty($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https') ? 'https://' : 'http://';
$baseUrl = $scheme . ($_SERVER['HTTP_HOST'] ?? 'lifehopewellness.com');

$orderPayload = [
    'order_id' => 'LFH-' . $bookingId . '-' . time(),
    'order_amount' => (float) $consultationFee,
    'order_currency' => 'INR',
    'order_note' => 'Consultation Booking',
    'customer_details' => [
        'customer_id' => (string) $bookingId,
        'customer_name' => $customerName,
        'customer_email' => $customerEmail,
        'customer_phone' => $customerPhone,
    ],
    'order_meta' => [
        'return_url' => $baseUrl . '/booking-confirmation.html?booking_id=' . urlencode((string) $bookingId),
        'notify_url' => $baseUrl . '/api/cashfree/webhook.php'
    ],
    'order_expiry_time' => gmdate('Y-m-d\TH:i:s\Z', strtotime('+30 minutes')),
];

$apiBase = rtrim(CASHFREE_API_BASE, '/');
$apiBase = preg_replace('#/(pg(/orders)?|pg/v[0-9]+/orders|orders)$#', '', $apiBase);
$endpoint = $apiBase . '/pg/orders';

$response = null;
$httpCode = 0;
$curlError = '';

$ch = curl_init($endpoint);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'x-client-id: ' . CASHFREE_APP_ID,
    'x-client-secret: ' . CASHFREE_SECRET_KEY,
    'Content-Type: application/json',
    'Accept: application/json',
    'x-api-version: 2025-01-01',
    'x-request-id: ' . uniqid('cf-order-', true),
    'x-idempotency-key: ' . bin2hex(random_bytes(16))
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

$cashfreeOrderId = $orderResult['order_id'] ?? null;
$paymentSessionId = $orderResult['payment_session_id'] ?? $orderResult['payment_session_id'] ?? null;
$appId = CASHFREE_APP_ID;
$amount = $consultationFee;

if ($httpCode < 200 || $httpCode >= 300 || empty($orderResult['order_id']) || empty($orderResult['payment_session_id'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Cashfree order creation failed.',
        'details' => $orderResult ?: ['message' => 'No response body returned from Cashfree.']
    ]);
    exit();
}

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
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Unable to create payment order.',
        'details' => $e->getMessage()
    ]);
}
