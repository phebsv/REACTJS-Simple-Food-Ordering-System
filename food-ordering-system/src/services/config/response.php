<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

function respond(int $status, string $message, $data = null): void {
    http_response_code($status);
    $body = ['status' => $status, 'message' => $message];
    if ($data !== null) $body['data'] = $data;
    echo json_encode($body, JSON_PRETTY_PRINT);
    exit();
}

function respond_ok($data = null, string $message = 'Success'): void {
    respond(200, $message, $data);
}

function respond_created($data = null, string $message = 'Created'): void {
    respond(201, $message, $data);
}

function respond_error(string $message, int $status = 400): void {
    respond($status, $message);
}

function get_body(): array {
    $raw = file_get_contents('php://input');
    return json_decode($raw, true) ?? [];
}