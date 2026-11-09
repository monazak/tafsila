<?php
declare(strict_types=1);

const STORAGE   = __DIR__ . '/../storage';
const DATA_FILE = __DIR__ . '/data.json';
const LEADS     = STORAGE . '/leads.php';  
  ?> فما ينعرض حتى لو السيرفر غلط

function cfg(): array {
    static $c = null;
    if ($c !== null) return $c;
    $c = [
        'allowed_origins'  => [],     // دومينات إضافية مسموح تكلم الـ API (لو الواجهة على GitHub Pages مثلاً)
        'trust_cloudflare' => true,   // اقرأ IP الزائر من CF-Connecting-IP
        'admin_hash'       => '',     // password_hash() — فاضي = لوحة الإدارة مقفلة
        'salt'             => 'change-me',
        'rate_max'         => 5,      // أقصى عدد طلبات
        'rate_window'      => 600,    // خلال كم ثانية
    ];
    $f = STORAGE . '/config.local.php';
    if (is_file($f)) {
        $o = require $f;
        if (is_array($o)) $c = array_replace($c, $o);
    }
    return $c;
}

function client_ip(): string {
    if (cfg()['trust_cloudflare'] && !empty($_SERVER['HTTP_CF_CONNECTING_IP'])) {
        return (string)$_SERVER['HTTP_CF_CONNECTING_IP'];
    }
    return (string)($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0');
}

function origin_ok(): bool {
    $o = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($o === '') return true;                       // طلب من نفس الموقع أو من beacon بدون Origin
    $host = parse_url($o, PHP_URL_HOST);
    if ($host && strcasecmp($host, (string)($_SERVER['HTTP_HOST'] ?? '')) === 0) return true;
    return in_array($o, cfg()['allowed_origins'], true);
}

function cors(): void {
    $o = $_SERVER['HTTP_ORIGIN'] ?? '';
    header('Vary: Origin');
    if ($o !== '' && origin_ok()) {
        header('Access-Control-Allow-Origin: ' . $o);
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type');
        header('Access-Control-Max-Age: 86400');
    }
}

function rate_ok(string $key, int $max, int $window): bool {
    $c   = cfg();
    $dir = STORAGE . '/rl';
    if (!is_dir($dir)) @mkdir($dir, 0750, true);
    $f   = $dir . '/' . substr(hash('sha256', $key . $c['salt']), 0, 32);
    $now = time();
    $ts  = [];
    if (is_file($f)) {
        foreach (explode(',', (string)@file_get_contents($f)) as $t) {
            $t = (int)$t;
            if ($t > $now - $window) $ts[] = $t;
        }
    }
    if (count($ts) >= $max) return false;
    $ts[] = $now;
    @file_put_contents($f, implode(',', $ts), LOCK_EX);
    if (random_int(1, 100) === 1) {                   // تنظيف عشوائي للملفات القديمة
        foreach (glob($dir . '/*') ?: [] as $old) {
            if (@filemtime($old) < $now - 86400) @unlink($old);
        }
    }
    return true;
}

function store_lead(array $row): void {
    $fh = @fopen(LEADS, 'ab');
    if (!$fh) return;
    flock($fh, LOCK_EX);
    $st = fstat($fh);
    if (($st['size'] ?? 0) === 0) fwrite($fh, "<?php http_response_code(404); exit; ?>\n");
    fwrite($fh, json_encode($row, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . "\n");
    flock($fh, LOCK_UN);
    fclose($fh);
}

function read_leads(int $n = 300, int $maxBytes = 2097152): array {
    if (!is_file(LEADS)) return [];
    $size = (int)filesize(LEADS);
    $fh = fopen(LEADS, 'rb');
    if (!$fh) return [];
    $chunk = min($size, $maxBytes);
    fseek($fh, $size - $chunk);
    $buf = (string)fread($fh, $chunk);
    fclose($fh);
    $lines = explode("\n", $buf);
    if ($chunk < $size) array_shift($lines);          // أول سطر ممكن يكون مقطوع
    $out = [];
    for ($i = count($lines) - 1; $i >= 0 && count($out) < $n; $i--) {
        $l = trim($lines[$i]);
        if ($l === '' || $l[0] === '<') continue;
        $r = json_decode($l, true);
        if (is_array($r)) $out[] = $r;
    }
    return $out;
}

function validate_data($d): ?string {
    if (!is_array($d)) return 'JSON غير صالح';
    if (!isset($d['wa']) || !is_string($d['wa']) || !preg_match('/^\d{8,15}$/', $d['wa'])) return 'رقم واتساب (wa) لازم يكون أرقام فقط مع رمز الدولة';
    if (!isset($d['designs']) || !is_array($d['designs'])) return 'designs لازم تكون مصفوفة';
    if (!isset($d['packages']) || !is_array($d['packages']) || !$d['packages']) return 'packages لازم تكون مصفوفة وفيها باقة وحدة على الأقل';
    $cats = ['wedding', 'ishhar', 'grad', 'bday'];
    foreach ($d['designs'] as $i => $x) {
        $k = '#' . ($i + 1);
        if (!is_array($x)) return "تصميم $k غير صالح";
        if (!isset($x['n']) || !is_string($x['n']) || $x['n'] === '') return "تصميم $k: الاسم (n) مطلوب";
        if (!isset($x['c']) || !in_array($x['c'], $cats, true)) return "تصميم $k: التصنيف (c) لازم يكون واحد من " . implode(', ', $cats);
        foreach (['c1', 'c2'] as $col) {
            if (!isset($x[$col]) || !is_string($x[$col]) || !preg_match('/^#[0-9a-fA-F]{6}$/', $x[$col])) return "تصميم $k: اللون ($col) لازم يكون مثل #d9c29a";
        }
        if (isset($x['l']) && (!is_string($x['l']) || !preg_match('~^https://~i', $x['l']))) return "تصميم $k: الرابط (l) لازم يبدأ بـ https://";
    }
    foreach ($d['packages'] as $i => $p) {
        $k = '#' . ($i + 1);
        if (!is_array($p) || !isset($p['n'], $p['p'], $p['f']) || !is_string($p['n']) || !is_string($p['p']) || !is_string($p['f'])) return "باقة $k: لازم n و p و f (نصوص)";
    }
    return null;
}
