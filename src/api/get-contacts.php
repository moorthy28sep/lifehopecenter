<?php

header("Content-Type: application/json");

include 'db.php';

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