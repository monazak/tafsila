<?php
declare(strict_types=1);
require __DIR__ . '/_lib.php';
cors();

$m = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($m === 'OPTIONS') { http_response_code(204); exit; }
if ($m !== 'POST')    { http_response_code(405); exit; }
if (!origin_ok())     { http_response_code(403); exit; }

$body = (string)file_get_contents('php://input', false, null, 0, 4096);
$j    = json_decode($body, true);
if (!is_array($j) || !isset($j['text']) || !is_string($j['text'])) { http_response_code(400); exit; }

ignore_user_abort(true);
http_response_code(204);
header('Cache-Control: no-store');
if (function_exists('fastcgi_finish_request')) {
    fastcgi_finish_request();
} else {
    header('Connection: close');
    header('Content-Length: 0');
    flush();
}

$c  = cfg();
$ip = client_ip();
if (!rate_ok('lead|' . $ip, (int)$c['rate_max'], (int)$c['rate_window'])) exit;

$text = mb_substr(trim($j['text']), 0, 1000);
$row  = ['t' => gmdate('c'), 'name' => '', 'design' => '', 'package' => '', 'notes' => '', 'text' => $text,
         'ip' => substr(hash('sha256', $ip . $c['salt']), 0, 12),
         'ua' => mb_substr((string)($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 120)];

foreach (preg_split('/\R/u', $text) ?: [] as $line) {
    if (preg_match('/أنا\s+(.+)$/u', $line, $mm) && $row['name'] === '')   $row['name']    = trim($mm[1]);
    elseif (preg_match('/^اخترت التصميم:\s*(.+)$/u', $line, $mm))           $row['design']  = trim($mm[1]);
    elseif (preg_match('/^الباقة:\s*(.+)$/u', $line, $mm))                  $row['package'] = trim($mm[1]);
    elseif (preg_match('/^التعديلات المطلوبة:\s*(.+)$/u', $line, $mm))      $row['notes']   = trim($mm[1]);
}

store_lead($row);
