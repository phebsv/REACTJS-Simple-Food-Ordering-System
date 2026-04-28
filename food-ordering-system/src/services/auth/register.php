<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/response.php';
require_once __DIR__ . '/../config/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond_error('Method not allowed.', 405);
}

$body = get_body();

$name    = trim($body['name']    ?? '');
$email   = trim($body['email']   ?? '');
$password = trim($body['password'] ?? '');
$phone   = trim($body['phone']   ?? '');
$address = trim($body['address'] ?? '');

// Validation
if (!$name || !$email || !$password) {
    respond_error('Name, email, and password are required.');
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond_error('Invalid email format.');
}
if (strlen($password) < 6) {
    respond_error('Password must be at least 6 characters.');
}

$customers = db_read('customers');

if (db_find($customers, 'email', $email)) {
    respond_error('Email already registered.');
}

$new_customer = [
    'customer_id' => db_next_id($customers, 'customer_id'),
    'name'        => $name,
    'email'       => $email,
    'password'    => hash('sha256', $password),
    'phone'       => $phone,
    'address'     => $address,
    'created_at'  => date('Y-m-d H:i:s'),
];

$customers[] = $new_customer;
db_write('customers', $customers);

$carts = db_read('carts');
$carts[] = [
    'cart_id'     => db_next_id($carts, 'cart_id'),
    'customer_id' => $new_customer['customer_id'],
    'created_at'  => date('Y-m-d H:i:s'),
];
db_write('carts', $carts);

unset($new_customer['password']);
respond_created($new_customer, 'Account created successfully.');