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

$result = $conn->query("SELECT id, customer_name, email, phone, selected_service, notes, payment_id, amount_paid, payment_status, booking_date_time, created_at FROM consultation_bookings ORDER BY created_at DESC");

$rows = [];
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $rows[] = $row;
    }
}

$conn->close();
echo json_encode(["success" => true, "bookings" => $rows]);
