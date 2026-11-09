<?php
declare(strict_types=1);
require __DIR__ . '/../api/_lib.php';

$https = !empty($_SERVER['HTTPS']) || ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https';
session_set_cookie_params(['httponly' => true, 'samesite' => 'Strict', 'secure' => $https, 'path' => '/']);
session_name('tf_admin');
session_start();
header('X-Robots-Tag: noindex, nofollow');
header('Cache-Control: no-store');
header('X-Frame-Options: DENY');

function h($s): string { return htmlspecialchars((string)$s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); }
function csrf(): string { return $_SESSION['csrf'] ??= bin2hex(random_bytes(16)); }
function csrf_ok(): bool { return isset($_POST['csrf']) && hash_equals(csrf(), (string)$_POST['csrf']); }

$c = cfg();
$msg = '';
$err = '';

if ($c['admin_hash'] === '') {
    http_response_code(503);
    echo '<!doctype html><meta charset="utf-8"><body dir="rtl" style="font-family:sans-serif;padding:2rem">لوحة الإدارة مقفلة. حطّ admin_hash في storage/config.local.php (شوف README).';
    exit;
}

if (isset($_POST['login'])) {
    if (!csrf_ok()) {
        $err = 'انتهت الجلسة، جرّب مرة ثانية';
    } elseif (!rate_ok('login|' . client_ip(), 8, 900)) {
        $err = 'محاولات كثيرة، استنى شوي';
    } elseif (password_verify((string)($_POST['pw'] ?? ''), (string)$c['admin_hash'])) {
        session_regenerate_id(true);
        $_SESSION['ok'] = true;
        header('Location: ./');
        exit;
    } else {
        usleep(600000);
        $err = 'كلمة السر غلط';
    }
}

$in = !empty($_SESSION['ok']);

if ($in && isset($_POST['logout']) && csrf_ok()) {
    $_SESSION = [];
    session_destroy();
    header('Location: ./');
    exit;
}

if ($in && isset($_GET['export'])) {
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="leads-' . date('Y-m-d') . '.csv"');
    echo "\xEF\xBB\xBF";
    $o = fopen('php://output', 'w');
    fputcsv($o, ['الوقت (UTC)', 'الاسم', 'التصميم', 'الباقة', 'التعديلات', 'النص الكامل']);
    foreach (read_leads(100000, 50 * 1048576) as $r) {
        fputcsv($o, [$r['t'] ?? '', $r['name'] ?? '', $r['design'] ?? '', $r['package'] ?? '', $r['notes'] ?? '', $r['text'] ?? '']);
    }
    exit;
}

$json = null;
if ($in && isset($_POST['save'])) {
    $json = (string)($_POST['json'] ?? '');
    if (!csrf_ok()) {
        $err = 'انتهت الجلسة، حدّث الصفحة';
    } else {
        $d = json_decode($json, true);
        $e = validate_data($d);
        if ($e !== null) {
            $err = $e;
        } else {
            $tmp = DATA_FILE . '.tmp';
            $pretty = json_encode($d, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
            if (@file_put_contents($tmp, $pretty, LOCK_EX) !== false && @rename($tmp, DATA_FILE)) {
                $msg = 'انحفظ ✔ — الزوار بياخدوا التحديث خلال دقائق';
                $json = null;
            } else {
                $err = 'ما قدرت أكتب api/data.json — تأكد من صلاحيات الكتابة';
            }
        }
    }
}
?>
<!doctype html>
<html lang="ar" dir="rtl"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>لوحة الإدارة</title>
<style>
body{font-family:system-ui,Segoe UI,Tahoma,sans-serif;background:#faf4ec;color:#2e1f22;margin:0;padding:20px}
main{max-width:980px;margin:auto}h1,h2{margin:.4em 0}
.card{background:#fff;border-radius:14px;padding:16px;margin:14px 0;box-shadow:0 1px 6px #0001}
input,textarea,button{font:inherit}input[type=password]{padding:10px;border:1px solid #ccc;border-radius:8px}
button,.btn{background:#6b1a2a;color:#fff;border:0;border-radius:8px;padding:10px 16px;cursor:pointer;text-decoration:none;display:inline-block}
textarea{width:100%;min-height:320px;direction:ltr;font-family:ui-monospace,monospace;font-size:13px;box-sizing:border-box;padding:10px;border:1px solid #ccc;border-radius:8px}
table{width:100%;border-collapse:collapse;font-size:14px}th,td{padding:8px;border-bottom:1px solid #eee;text-align:right;vertical-align:top}
.wrap{overflow-x:auto}.ok{color:#2f7a3d}.bad{color:#b3261e}
</style></head><body><main>
<?php if (!$in): ?>
  <div class="card" style="max-width:360px;margin:12vh auto">
    <h1>دخول الإدارة</h1>
    <?php if ($err): ?><p class="bad"><?= h($err) ?></p><?php endif; ?>
    <form method="post">
      <input type="hidden" name="csrf" value="<?= h(csrf()) ?>">
      <p><input type="password" name="pw" placeholder="كلمة السر" autofocus required style="width:100%;box-sizing:border-box"></p>
      <button name="login" value="1">دخول</button>
    </form>
  </div>
<?php else:
  $leads = read_leads(300);
  $current = $json ?? (string)@file_get_contents(DATA_FILE);
?>
  <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
    <h1>لوحة الإدارة</h1>
    <form method="post"><input type="hidden" name="csrf" value="<?= h(csrf()) ?>"><button name="logout" value="1">خروج</button></form>
  </div>
  <?php if ($msg): ?><p class="ok"><?= h($msg) ?></p><?php endif; ?>
  <?php if ($err): ?><p class="bad"><?= h($err) ?></p><?php endif; ?>

  <div class="card">
    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
      <h2>الطلبات (آخر <?= count($leads) ?>)</h2>
      <a class="btn" href="?export=1">تصدير CSV</a>
    </div>
    <div class="wrap"><table>
      <tr><th>الوقت</th><th>الاسم</th><th>التصميم</th><th>الباقة</th><th>التعديلات</th></tr>
      <?php foreach ($leads as $r): ?>
        <tr><td dir="ltr"><?= h(str_replace(['T', '+00:00'], [' ', ''], $r['t'] ?? '')) ?></td><td><?= h($r['name'] ?? '') ?></td><td><?= h($r['design'] ?? '') ?></td><td><?= h($r['package'] ?? '') ?></td><td><?= h($r['notes'] ?? '') ?></td></tr>
      <?php endforeach; if (!$leads): ?><tr><td colspan="5">ما في طلبات لسا</td></tr><?php endif; ?>
    </table></div>
  </div>

  <div class="card">
    <h2>التصاميم والباقات ورقم واتساب</h2>
    <p>عدّل الـ JSON وانحفظ. الأقسام: <code>wa</code> رقم واتساب مع رمز الدولة بدون +، <code>designs</code>، <code>packages</code>. التصنيفات: wedding / ishhar / grad / bday.</p>
    <form method="post">
      <input type="hidden" name="csrf" value="<?= h(csrf()) ?>">
      <textarea name="json" spellcheck="false"><?= h($current) ?></textarea>
      <p><button name="save" value="1">حفظ</button></p>
    </form>
  </div>
<?php endif; ?>
</main></body></html>
