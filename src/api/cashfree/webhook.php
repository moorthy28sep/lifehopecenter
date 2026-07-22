<?php

header('Content-Type: application/json');

require_once '../db.php';
require_once '../config.php';

$payload = @file_get_contents('php://input');
$signature = trim($_SERVER['HTTP_X_WEBHOOK_SIGNATURE'] ?? $_SERVER['HTTP_X_CASHFREE_SIGNATURE'] ?? $_SERVER['HTTP_X_SIGNATURE'] ?? '');

if ($payload === false || $payload === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing webhook payload.']);
    exit();
}

if (empty(CASHFREE_WEBHOOK_SECRET)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Webhook secret is not configured.']);
    exit();
}

if ($signature === '') {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Missing webhook signature.']);
    exit();
}

$expectedSignature = hash_hmac('sha256', $payload, CASHFREE_WEBHOOK_SECRET);
if (!hash_equals($expectedSignature, $signature)) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Invalid webhook signature.']);
    exit();
}

$data = json_decode($payload, true);
if (!$data) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid JSON payload.']);
    exit();
}

$orderId = $data['order_id'] ?? $data['data']['order_id'] ?? $data['payload']['order_id'] ?? null;
$paymentId = $data['payment_id'] ?? $data['data']['payment_id'] ?? $data['payload']['payment_id'] ?? null;
$orderStatus = strtoupper($data['order_status'] ?? $data['data']['order_status'] ?? $data['payload']['order_status'] ?? '');
$txStatus = strtoupper($data['tx_status'] ?? $data['data']['tx_status'] ?? $data['payload']['tx_status'] ?? '');

$bookingId = 0;
if (!empty($data['customer_details']['customer_id'])) {
    $bookingId = intval($data['customer_details']['customer_id']);
} elseif (!empty($data['data']['customer_details']['customer_id'])) {
    $bookingId = intval($data['data']['customer_details']['customer_id']);
} elseif (!empty($data['payload']['customer_details']['customer_id'])) {
    $bookingId = intval($data['payload']['customer_details']['customer_id']);
}

if (!$bookingId && $orderId) {
    $lookup = $conn->prepare('SELECT id FROM consultation_bookings WHERE cashfree_order_id = ? LIMIT 1');
    $lookup->bind_param('s', $orderId);
    $lookup->execute();
    $result = $lookup->get_result();
    $found = $result->fetch_assoc();
    $lookup->close();
    $bookingId = $found['id'] ?? 0;
}

if (!$bookingId) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Booking not found.']);
    exit();
}

$paidStatuses = ['SUCCESS', 'TXN_SUCCESS', 'CAPTURED', 'PAID'];
if (in_array($orderStatus, $paidStatuses, true) || in_array($txStatus, $paidStatuses, true)) {
    $amountPaid = 1000.00;
    $paymentStatus = 'paid';
    $stmt = $conn->prepare(
        'UPDATE consultation_bookings SET payment_status = ?, payment_id = ?, cashfree_payment_id = ?, amount_paid = ? WHERE id = ?'
    );
    $stmt->bind_param('ssdsi', $paymentStatus, $paymentId, $paymentId, $amountPaid, $bookingId);
    $stmt->execute();
    $stmt->close();

    echo json_encode(['success' => true]);
    $conn->close();
    exit();
}

echo json_encode(['success' => true, 'message' => 'Webhook received. No status update required.']);
$conn->close();
