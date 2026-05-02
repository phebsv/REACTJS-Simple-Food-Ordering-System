<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/response.php';
require_once __DIR__ . '/../config/auth.php';

$user   = require_auth();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $orders      = db_read('orders');
    $order_items = db_read('order_items');
    $menu_items  = db_read('menu_items');

    if (isset($_GET['id'])) {
        $order = db_find($orders, 'order_id', (int) $_GET['id']);
        if (!$order || $order['customer_id'] !== $user['id']) {
            respond_error('Order not found.', 404);
        }
        $items = array_map(function ($oi) use ($menu_items) {
            $menu = db_find($menu_items, 'menu_id', $oi['menu_id']);
            return [
                'order_item_id' => $oi['order_item_id'],
                'food_name'     => $menu['food_name'] ?? 'Unknown',
                'quantity'      => $oi['quantity'],
                'price'         => $oi['price'],
                'subtotal'      => $oi['price'] * $oi['quantity'],
            ];
        }, db_where($order_items, 'order_id', $order['order_id']));

        respond_ok(['order' => $order, 'items' => $items]);
    }

    $my_orders = db_where($orders, 'customer_id', $user['id']);
    respond_ok($my_orders);
}

if ($method === 'POST') {
    $carts = db_read('carts');
    $cart  = db_find($carts, 'customer_id', $user['id']);
    if (!$cart) respond_error('Cart not found.', 404);

    $cart_items = db_read('cart_items');
    $my_cart    = db_where($cart_items, 'cart_id', $cart['cart_id']);
    if (empty($my_cart)) respond_error('Your cart is empty.');

    $menu_items  = db_read('menu_items');
    $orders      = db_read('orders');
    $order_items = db_read('order_items');

    $total = 0;
    $snapshot = [];
    foreach ($my_cart as $ci) {
        $menu = db_find($menu_items, 'menu_id', $ci['menu_id']);
        if (!$menu || !$menu['availability_status']) {
            respond_error("Item ID {$ci['menu_id']} is no longer available.");
        }
        $total += $menu['price'] * $ci['quantity'];
        $snapshot[] = [
            'menu_id'  => $ci['menu_id'],
            'quantity' => $ci['quantity'],
            'price'    => $menu['price'],
        ];
    }

    $order_id = db_next_id($orders, 'order_id');
    $new_order = [
        'order_id'     => $order_id,
        'customer_id'  => $user['id'],
        'order_date'   => date('Y-m-d H:i:s'),
        'total_amount' => $total,
        'order_status' => 'Pending',
    ];
    $orders[] = $new_order;
    db_write('orders', $orders);

    foreach ($snapshot as $item) {
        $order_items[] = [
            'order_item_id' => db_next_id($order_items, 'order_item_id'),
            'order_id'      => $order_id,
            'menu_id'       => $item['menu_id'],
            'quantity'      => $item['quantity'],
            'price'         => $item['price'],
        ];
    }
    db_write('order_items', $order_items);

    $remaining = array_values(array_filter(
        $cart_items,
        fn($ci) => $ci['cart_id'] !== $cart['cart_id']
    ));
    db_write('cart_items', $remaining);

    respond_created($new_order, 'Order placed successfully.');
}

respond_error('Method not allowed.', 405);