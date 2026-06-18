<?php

$host = "localhost";

$dbname = "u866750606_lifehope_db";
$username = "u866750606_lifehope_user";
$password = "Lifehope2026";

$conn = new mysqli(
    $host,
    $username,
    $password,
    $dbname
);

if ($conn->connect_error) {
    die("Database connection failed: " . $conn->connect_error);
}