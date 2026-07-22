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

if (!$data || empty($data['booking_id']) || empty($data['order_id']) || empty($data['payment_id'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request.'
    ]);
    exit();
}

$bookingId = intval($data['booking_id']);
$orderId = trim($data['order_id']);
$paymentId = trim($data['payment_id']);
$txStatus = strtoupper(trim($data['tx_status'] ?? 'SUCCESS'));
$amountPaid = isset($data['amount']) ? floatval($data['amount']) : 1000.00;

$paidStatuses = ['SUCCESS', 'TXN_SUCCESS', 'CAPTURED', 'PAID'];
if (!in_array($txStatus, $paidStatuses, true)) {
    echo json_encode([
        'success' => false,
        'message' => 'Payment was not successful.'
    ]);
    exit();
}

$stmt = $conn->prepare(
    'UPDATE consultation_bookings SET payment_id = ?, cashfree_payment_id = ?, amount_paid = ?, payment_status = ? WHERE id = ?'
);

if (!$stmt) {
    echo json_encode([
        'success' => false,
        'message' => $conn->error
    ]);
    exit();
}

$paymentStatus = 'paid';
$stmt->bind_param('ssdsi', $paymentId, $paymentId, $amountPaid, $paymentStatus, $bookingId);

if (!$stmt->execute()) {
    echo json_encode([
        'success' => false,
        'message' => $stmt->error
    ]);
    exit();
}

$stmt->close();

echo json_encode([
    'success' => true,
    'message' => 'Payment verified successfully.',
    'booking_id' => $bookingId,
    'redirect_url' => 'booking-confirmation.html?booking_id=' . $bookingId
]);

$conn->close();
