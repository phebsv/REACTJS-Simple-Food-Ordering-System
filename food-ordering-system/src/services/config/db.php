<?php

define('DATA_PATH', __DIR__ . '/../data/');

function db_read(string $table): array {
    $file = DATA_PATH . $table . '.json';
    if (!file_exists($file)) return [];
    $contents = file_get_contents($file);
    return json_decode($contents, true) ?? [];
}

function db_write(string $table, array $data): void {
    $file = DATA_PATH . $table . '.json';
    file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT));
}

function db_next_id(array $records, string $id_field): int {
    if (empty($records)) return 1;
    return max(array_column($records, $id_field)) + 1;
}

function db_find(array $records, string $field, $value): ?array {
    foreach ($records as $record) {
        if ($record[$field] == $value) return $record;
    }
    return null;
}

function db_where(array $records, string $field, $value): array {
    return array_values(array_filter($records, fn($r) => $r[$field] == $value));
}