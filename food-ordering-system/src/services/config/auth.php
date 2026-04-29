<?php

define('SECRET_KEY', 'quickbite_secret_2024');

function generate_token(int $id, string $role): string {
    $payload = base64_encode(json_encode([
        'id'   => $id,
        'role' => $role,
        'exp'  => time() + (60 * 60 * 24)
    ]));
    $signature = hash_hmac('sha256', $payload, SECRET_KEY);
    return $payload . '.' . $signature;
}

function verify_token(string $token): ?array {
    $parts = explode('.', $token);
    if (count($parts) !== 2) return null;

    [$payload, $signature] = $parts;
    $expected = hash_hmac('sha256', $payload, SECRET_KEY);
    if (!hash_equals($expected, $signature)) return null;

    $data = json_decode(base64_decode($payload), true);
    if (!$data || $data['exp'] < time()) return null;

    return $data;
}

function get_auth_user(): ?array {
    $headers = getallheaders();
    $auth = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    if (!str_starts_with($auth, 'Bearer ')) return null;
    $token = substr($auth, 7);
    return verify_token($token);
}

function require_auth(): array {
    $user = get_auth_user();
    if (!$user) {
        respond_error('Unauthorized. Please log in.', 401);
    }
    return $user;
}

function require_admin(): array {
    $user = get_auth_user();
    if (!$user || $user['role'] !== 'admin') {
        respond_error('Forbidden. Admins only.', 403);
    }
    return $user;
}