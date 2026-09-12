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

$result = $conn->query("
    SELECT *
    FROM contact_requests
    ORDER BY created_at DESC
");

if (!$result) {
    echo json_encode([
        "success" => false,
        "message" => $conn->error
    ]);
    exit();
}

$contacts = [];

while ($row = $result->fetch_assoc()) {
    $contacts[] = $row;
}

echo json_encode([
    "success" => true,
    "contacts" => $contacts
]);

$conn->close();
?>