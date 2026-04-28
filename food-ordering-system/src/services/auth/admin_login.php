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

$admins = db_read('admins');
$admin  = db_find($admins, 'email', $email);

if (!$admin || $admin['password'] !== hash('sha256', $password)) {
    respond_error('Invalid admin credentials.', 401);
}

$token = generate_token($admin['admin_id'], 'admin');

unset($admin['password']);
respond_ok([
    'token' => $token,
    'admin' => $admin,
], 'Admin login successful.');