<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/response.php';
require_once __DIR__ . '/../config/auth.php';

$user   = require_auth();
$method = $_SERVER['REQUEST_METHOD'];

$carts      = db_read('carts');
$cart       = db_find($carts, 'customer_id', $user['id']);
if (!$cart) respond_error('Cart not found.', 404);

$cart_items = db_read('cart_items');
$menu_items = db_read('menu_items');

if ($method === 'GET') {
    $my_items = db_where($cart_items, 'cart_id', $cart['cart_id']);

    $result = array_map(function ($ci) use ($menu_items) {
        $menu = db_find($menu_items, 'menu_id', $ci['menu_id']);
        return [
            'cart_item_id' => $ci['cart_item_id'],
            'menu_id'      => $ci['menu_id'],
            'food_name'    => $menu['food_name'] ?? 'Unknown',
            'price'        => $menu['price']     ?? 0,
            'quantity'     => $ci['quantity'],
            'subtotal'     => ($menu['price'] ?? 0) * $ci['quantity'],
        ];
    }, $my_items);

    $total = array_sum(array_column($result, 'subtotal'));
    respond_ok(['items' => $result, 'total' => $total]);
}

if ($method === 'POST') {
    $body    = get_body();
    $menu_id = (int) ($body['menu_id']  ?? 0);
    $qty     = (int) ($body['quantity'] ?? 1);

    if (!$menu_id || $qty < 1) respond_error('menu_id and quantity (>=1) are required.');

    $menu = db_find($menu_items, 'menu_id', $menu_id);
    if (!$menu || !$menu['availability_status']) respond_error('Menu item not available.', 404);

    // If item already in cart, increase quantity
    foreach ($cart_items as &$ci) {
        if ($ci['cart_id'] === $cart['cart_id'] && $ci['menu_id'] === $menu_id) {
            $ci['quantity'] += $qty;
            db_write('cart_items', $cart_items);
            respond_ok($ci, 'Quantity updated.');
        }
    }

    $new = [
        'cart_item_id' => db_next_id($cart_items, 'cart_item_id'),
        'cart_id'      => $cart['cart_id'],
        'menu_id'      => $menu_id,
        'quantity'     => $qty,
    ];
    $cart_items[] = $new;
    db_write('cart_items', $cart_items);
    respond_created($new, 'Item added to cart.');
}

if ($method === 'PUT') {
    $body         = get_body();
    $cart_item_id = (int) ($body['cart_item_id'] ?? 0);
    $qty          = (int) ($body['quantity']     ?? 0);

    if (!$cart_item_id || $qty < 1) respond_error('cart_item_id and quantity (>=1) are required.');

    foreach ($cart_items as &$ci) {
        if ($ci['cart_item_id'] === $cart_item_id && $ci['cart_id'] === $cart['cart_id']) {
            $ci['quantity'] = $qty;
            db_write('cart_items', $cart_items);
            respond_ok($ci, 'Quantity updated.');
        }
    }
    respond_error('Cart item not found.', 404);
}

if ($method === 'DELETE') {
    $cart_item_id = (int) ($_GET['item_id'] ?? 0);
    if (!$cart_item_id) respond_error('item_id is required.');

    $filtered = array_values(array_filter(
        $cart_items,
        fn($ci) => !($ci['cart_item_id'] === $cart_item_id && $ci['cart_id'] === $cart['cart_id'])
    ));

    if (count($filtered) === count($cart_items)) respond_error('Cart item not found.', 404);

    db_write('cart_items', $filtered);
    respond_ok(null, 'Item removed from cart.');
}

respond_error('Method not allowed.', 405);