<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/response.php';
require_once __DIR__ . '/../config/auth.php';

require_admin();

$method = $_SERVER['REQUEST_METHOD'];
$items  = db_read('menu_items');

if ($method === 'GET') {
    respond_ok($items);
}

if ($method === 'POST') {
    $body = get_body();

    $food_name = trim($body['food_name']    ?? '');
    $price     = (float) ($body['price']   ?? 0);
    $category  = trim($body['category']    ?? '');

    if (!$food_name || !$price || !$category) {
        respond_error('food_name, price, and category are required.');
    }

    $new_item = [
        'menu_id'             => db_next_id($items, 'menu_id'),
        'food_name'           => $food_name,
        'description'         => trim($body['description'] ?? ''),
        'price'               => $price,
        'category'            => $category,
        'availability_status' => (bool) ($body['availability_status'] ?? true),
    ];

    $items[] = $new_item;
    db_write('menu_items', $items);
    respond_created($new_item, 'Menu item added.');
}

if ($method === 'PUT') {
    $body    = get_body();
    $menu_id = (int) ($body['menu_id'] ?? 0);
    if (!$menu_id) respond_error('menu_id is required.');

    $updated = false;
    foreach ($items as &$item) {
        if ($item['menu_id'] === $menu_id) {
            if (isset($body['food_name']))           $item['food_name']           = trim($body['food_name']);
            if (isset($body['description']))         $item['description']         = trim($body['description']);
            if (isset($body['price']))               $item['price']               = (float) $body['price'];
            if (isset($body['category']))            $item['category']            = trim($body['category']);
            if (isset($body['availability_status'])) $item['availability_status'] = (bool) $body['availability_status'];
            $updated = true;
            $result  = $item;
            break;
        }
    }

    if (!$updated) respond_error('Menu item not found.', 404);
    db_write('menu_items', $items);
    respond_ok($result, 'Menu item updated.');
}

if ($method === 'DELETE') {
    $menu_id = (int) ($_GET['id'] ?? 0);
    if (!$menu_id) respond_error('id is required.');

    $filtered = array_values(array_filter($items, fn($i) => $i['menu_id'] !== $menu_id));
    if (count($filtered) === count($items)) respond_error('Menu item not found.', 404);

    db_write('menu_items', $filtered);
    respond_ok(null, 'Menu item deleted.');
}

respond_error('Method not allowed.', 405);