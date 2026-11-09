# تفصيلة — الموقع + الباك اند (PHP)

## شو اللي بالمشروع
- **الموقع** نفسه (index.html + css + js) بدون أي تغيير بالتصميم. التعديل الوحيد: سطر `<script src="js/api.js">` قبل `app.js`.
- **api/config.php** يرجّع التصاميم والباقات ورقم واتساب (مع ETag وكاش، يعني سريع جداً).
- **api/lead.php** يسجّل كل طلب يضغط عليه الزائر "أرسل طلبك" (الاسم/التصميم/الباقة). بيرد فوراً 204 وبيكمل الحفظ بعد ما يقطع الاتصال، فالزائر ما بيستنى شي.
- **admin/** لوحة محمية بكلمة سر: جدول الطلبات + تصدير CSV + تعديل التصاميم/الباقات/رقم واتساب.
- **الموقع ما بيعتمد على الباك اند**: البيانات الأصلية موجودة داخل index.html. لو الـ PHP وقع، الموقع وزر واتساب بيشتغلوا عادي.

## ملاحظة مهمة عن Cloudflare و GitHub
Cloudflare (Pages/Workers/CDN) و GitHub Pages **ما بشغّلوا PHP**. عندك خيارين:

**الخيار 1 (الأبسط، موصى فيه):** ارفع المشروع كله على استضافة PHP (cPanel/VPS/أي استضافة PHP 7.4+)، وخلّي الدومين ورا Cloudflare (السحابة البرتقالية). Cloudflare بيكاشي الملفات الثابتة وبيحمي الموقع، والـ PHP بيشتغل على سيرفرك. GitHub بتستخدمه للنسخ والنشر (git pull أو GitHub Actions).

**الخيار 2:** الواجهة على GitHub Pages / Cloudflare Pages، والـ PHP على استضافة ثانية (مثلاً `api.yourdomain.com`). بهالحالة:
1. بـ index.html قبل `js/api.js` ضيف: `<script>window.TAFSEELA_API='https://api.yourdomain.com/api'</script>`
2. بـ storage/config.local.php حط دومين الواجهة بـ `allowed_origins`.

## التركيب (خيار 1)
1. ارفع كل الملفات لجذر الموقع.
2. انسخ `storage/config.local.example.php` إلى `storage/config.local.php` وحط:
   - `admin_hash`: ولّده بـ `php -r "echo password_hash('كلمتك', PASSWORD_DEFAULT);"`
   - `salt`: أي نص عشوائي طويل.
3. صلاحيات الكتابة (PHP لازم يكتب): مجلد `storage/` وملف `api/data.json` ومجلد `api/` (للحفظ الآمن من اللوحة).
4. افتح `/admin/` وسجّل دخول.

## إعدادات Cloudflare (اختيارية لكنها بتسرّع)
- Rules → Cache Rules: لـ `/api/config.php` اختار *Eligible for cache* (ملفات .php ما بتنكاش افتراضياً). الهيدرز جاهزة.
- SSL/TLS: Full (strict). فعّل Brotli و Early Hints.
- لا تكاشي `/api/lead.php` ولا `/admin/`.

## nginx بدل Apache
ملفات `.htaccess` ما بتشتغل على nginx. أضف:
```
location ~ ^/(storage|\.git)/ { deny all; }
location ~* \.(css|js|svg|png|jpg|webp|woff2)$ { expires 1h; }
gzip on; gzip_types text/css application/javascript application/json image/svg+xml;
```
(ملف الطلبات `storage/leads.php` أصلاً محمي بحد ذاته لأنه بيبدأ بـ `<?php exit; ?>`.)

## الأمان
- ما بيتحفظ IP خام، بس بصمة مشفّرة قصيرة.
- حد أقصى 5 طلبات/10 دقائق لكل زائر (غيّره من config.local.php).
- كلمة السر مشفّرة، جلسة آمنة، حماية CSRF، وتحديد محاولات الدخول.
- لا ترفع `storage/config.local.php` ولا `storage/leads.php` على GitHub (موجودين بـ .gitignore).

## تسريع (بدون أي تغيير بالتصميم)
- الصورة الكبيرة اللي كانت مدفونة جوا `app.js` (حوالي 165KB) انفصلت لملف `img/invite.jpg` بنفس الجودة تماماً. صار `app.js` أخف بـ 30% وبينكاش لحاله.
- Preload للـ `app.js` والصورة، و preconnect للخطوط و cdnjs (اللي منه بتنحمّل مكتبات الأنيميشن).
- كاش ذكي + Early Hints من `.htaccess`.
- بـ Cloudflare فعّل: Brotli، HTTP/3، Early Hints، Always Use HTTPS. **لا تفعّل Rocket Loader** (بيكسر الأنيميشن).
