<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/response.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $items = db_read('menu_items');

    if (isset($_GET['id'])) {
        $item = db_find($items, 'menu_id', (int) $_GET['id']);
        if (!$item) respond_error('Menu item not found.', 404);
        respond_ok($item);
    }

    if (isset($_GET['category'])) {
        $items = db_where($items, 'category', $_GET['category']);
    }

    $available = array_values(array_filter($items, fn($i) => $i['availability_status']));
    respond_ok($available);
}

respond_error('Method not allowed.', 405);