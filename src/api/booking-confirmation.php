<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'db.php';

$bookingId = isset($_GET['booking_id']) ? (int) $_GET['booking_id'] : 0;

if ($bookingId <= 0) {
    echo json_encode(["success" => false, "message" => "Missing booking id"]);
    exit();
}

$stmt = $conn->prepare("SELECT id, customer_name, email, phone, selected_service, amount_paid, payment_status, booking_date_time FROM consultation_bookings WHERE id = ?");
$stmt->bind_param("i", $bookingId);
$stmt->execute();
$result = $stmt->get_result();
$booking = $result->fetch_assoc();
$stmt->close();
$conn->close();

echo json_encode([
    "success" => true,
    "booking" => $booking
]);
