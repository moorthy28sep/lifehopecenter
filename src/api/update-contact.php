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

$stmt = $conn->prepare("
    UPDATE contact_requests
    SET
        name = ?,
        phone = ?,
        email = ?,
        preferred_service = ?,
        health_concern = ?
    WHERE id = ?
");

$stmt->bind_param(
    "sssssi",
    $data['name'],
    $data['phone'],
    $data['email'],
    $data['preferredService'],
    $data['healthConcern'],
    $data['id']
);

if ($stmt->execute()) {
    echo json_encode([
        "success" => true
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => $stmt->error
    ]);
}
?>