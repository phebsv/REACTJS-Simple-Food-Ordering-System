<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/response.php';
require_once __DIR__ . '/../config/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond_error('Method not allowed.', 405);
}

$body     = get_body();
$email    = trim($body['email']    ?? '');
$password = trim($body['password'] ?? '');

if (!$email || !$password) {
    respond_error('Email and password are required.');
}

$customers = db_read('customers');
$customer  = db_find($customers, 'email', $email);

if (!$customer || $customer['password'] !== hash('sha256', $password)) {
    respond_error('Invalid email or password.', 401);
}

$token = generate_token($customer['customer_id'], 'customer');

unset($customer['password']);
respond_ok([
    'token'    => $token,
    'customer' => $customer,
], 'Login successful.');