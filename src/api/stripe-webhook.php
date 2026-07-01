<?php

header('Content-Type: application/json');

require_once 'db.php';

$payload = @file_get_contents('php://input');
$signature = $_SERVER['HTTP_STRIPE_SIGNATURE'] ?? '';
$endpointSecret = STRIPE_WEBHOOK_SECRET;

if (!$endpointSecret || !$signature || !$payload) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Missing Stripe webhook data"]);
    exit();
}

$expectedSignature = hash_hmac('sha256', $payload, $endpointSecret);
if (!hash_equals($expectedSignature, $signature)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid Stripe signature"]);
    exit();
}

$event = json_decode($payload, true);
if (!$event || !isset($event['type'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid event payload"]);
    exit();
}

if ($event['type'] === 'checkout.session.completed') {
    $session = $event['data']['object'];
    $bookingId = isset($session['metadata']['booking_id']) ? (int) $session['metadata']['booking_id'] : 0;
    $paymentId = $session['payment_intent'] ?? null;
    $amount = isset($session['amount_total']) ? (float) $session['amount_total'] / 100 : 1000;

    if ($bookingId > 0) {
        $stmt = $conn->prepare("UPDATE consultation_bookings SET payment_id = ?, amount_paid = ?, payment_status = 'paid' WHERE id = ?");
        $stmt->bind_param("sdi", $paymentId, $amount, $bookingId);
        $stmt->execute();
        $stmt->close();
    }
}

echo json_encode(["success" => true]);
$conn->close();
