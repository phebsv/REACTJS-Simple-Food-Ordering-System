<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/response.php';
require_once __DIR__ . '/../config/auth.php';

require_admin();

$method      = $_SERVER['REQUEST_METHOD'];
$orders      = db_read('orders');
$order_items = db_read('order_items');
$menu_items  = db_read('menu_items');
$customers   = db_read('customers');

$valid_statuses = ['Pending', 'Preparing', 'Ready', 'Delivered'];

if ($method === 'GET') {
    if (isset($_GET['id'])) {
        $order = db_find($orders, 'order_id', (int) $_GET['id']);
        if (!$order) respond_error('Order not found.', 404);

        $customer = db_find($customers, 'customer_id', $order['customer_id']);
        $items    = array_map(function ($oi) use ($menu_items) {
            $menu = db_find($menu_items, 'menu_id', $oi['menu_id']);
            return [
                'order_item_id' => $oi['order_item_id'],
                'food_name'     => $menu['food_name'] ?? 'Unknown',
                'quantity'      => $oi['quantity'],
                'price'         => $oi['price'],
                'subtotal'      => $oi['price'] * $oi['quantity'],
            ];
        }, db_where($order_items, 'order_id', $order['order_id']));

        respond_ok([
            'order'    => $order,
            'customer' => ['name' => $customer['name'] ?? '', 'email' => $customer['email'] ?? ''],
            'items'    => $items,
        ]);
    }

    $result = array_map(function ($order) use ($customers) {
        $customer = db_find($customers, 'customer_id', $order['customer_id']);
        $order['customer_name'] = $customer['name'] ?? 'Unknown';
        return $order;
    }, $orders);

    respond_ok($result);
}

if ($method === 'PUT') {
    $body     = get_body();
    $order_id = (int) ($body['order_id']     ?? 0);
    $status   = trim($body['order_status'] ?? '');

    if (!$order_id || !$status) respond_error('order_id and order_status are required.');
    if (!in_array($status, $valid_statuses)) {
        respond_error('Invalid status. Must be: ' . implode(', ', $valid_statuses));
    }

    $updated = false;
    foreach ($orders as &$order) {
        if ($order['order_id'] === $order_id) {
            $order['order_status'] = $status;
            $updated = true;
            $result  = $order;
            break;
        }
    }

    if (!$updated) respond_error('Order not found.', 404);
    db_write('orders', $orders);
    respond_ok($result, 'Order status updated to ' . $status . '.');
}

respond_error('Method not allowed.', 405);