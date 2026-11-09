<?php
declare(strict_types=1);
require __DIR__ . '/_lib.php';
cors();

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') { http_response_code(204); exit; }

$raw = @file_get_contents(DATA_FILE);
if ($raw === false || $raw === '') { http_response_code(500); exit; }

$v    = (string)filemtime(DATA_FILE);
$etag = '"' . $v . '-' . strlen($raw) . '"';
header('ETag: ' . $etag);
header('Cache-Control: public, max-age=300, stale-while-revalidate=86400');

if (($_SERVER['HTTP_IF_NONE_MATCH'] ?? '') === $etag) { http_response_code(304); exit; }

header('Content-Type: application/json; charset=utf-8');
echo '{"v":"' . $v . '","data":' . $raw . '}';
