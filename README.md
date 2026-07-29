# Evently

منصة متكاملة للإعلان عن الفعاليات، نشرها، والبحث عنها، وحجز/شراء تذاكرها. تدعم اللغتين العربية والإنجليزية (RTL/LTR).

## البنية التقنية

- **الواجهة الخلفية**: ASP.NET Core 10 Web API + Entity Framework Core + PostgreSQL + JWT Auth + Stripe
- **الواجهة الأمامية**: React 19 + TypeScript + Vite + Tailwind CSS + react-i18next

## المميزات

- تسجيل حساب / تسجيل دخول (JWT)
- نشر فعالية جديدة (عنوان، وصف، تصنيف، موقع، تواريخ، سعر، عدد التذاكر، صورة)
- تعديل وحذف الفعاليات التي نشرها المستخدم فقط (صلاحيات على مستوى الـ API)
- بحث وفلترة كاملة (نص حر، تصنيف، موقع، نطاق تاريخ، نطاق سعر، ترتيب)
- حجز الفعاليات المجانية مباشرة، ودفع الفعاليات المدفوعة عبر Stripe Checkout (وضع اختبار)
- إلغاء الحجز مع استرجاع التذاكر تلقائياً
- صفحة "فعالياتي" لإدارة الفعاليات المنشورة، وصفحة "تذاكري" لعرض الحجوزات
- لوحة تحكم Admin: إحصائيات عامة، وإدارة كل الفعاليات/المستخدمين/الحجوزات
- تبديل فوري بين العربية والإنجليزية مع تغيير اتجاه الصفحة RTL/LTR

## التشغيل محلياً

### المتطلبات
- .NET SDK 10
- Node.js 20+
- PostgreSQL (تم اختباره على PostgreSQL 17)
- حساب Stripe مجاني (وضع الاختبار) إن رغبت بتفعيل الدفع الفعلي

### 1) الواجهة الخلفية

```bash
cd server/Evently.Api
```

أنشئ ملف `appsettings.Development.json` (هذا الملف مُستثنى من git عبر `.gitignore` لحماية أسرارك) بالشكل التالي:

```json
{
  "ConnectionStrings": {
    "Default": "Host=localhost;Port=5432;Database=evently;Username=postgres;Password=YOUR_PASSWORD"
  },
  "Jwt": {
    "Key": "REPLACE_WITH_A_LONG_RANDOM_SECRET_AT_LEAST_32_CHARS",
    "Issuer": "EventlyApi",
    "Audience": "EventlyClient",
    "ExpiryMinutes": "1440"
  },
  "Stripe": {
    "SecretKey": "sk_test_...",
    "PublishableKey": "pk_test_...",
    "ClientUrl": "http://localhost:5173"
  }
}
```

مفاتيح Stripe التجريبية مجانية من [dashboard.stripe.com/test/apikeys](https://dashboard.stripe.com/test/apikeys). إن تركتها فارغة، يعمل الموقع بشكل طبيعي وتبقى الفعاليات المدفوعة فقط معطّلة الحجز.

ثم شغّل:

```bash
dotnet ef database update
dotnet run --launch-profile http
```

عند أول تشغيل يتم زرع حساب مدير (`admin@evently.com` / `Admin@123`) و20 فعالية تجريبية تلقائياً. الـ API يعمل افتراضياً على `http://localhost:5292`، وتوثيق Swagger متاح على `/swagger` في بيئة التطوير.

### 2) الواجهة الأمامية

```bash
cd client
npm install
npm run dev
```

الموقع يعمل على `http://localhost:5173`.

> إذا اخترت تشغيل الـ API على منفذ مختلف، حدّث `VITE_API_URL` في ملف `.env` داخل مجلد `client`، أو عدّل القيمة الافتراضية في `src/lib/api.ts`.

## ملاحظات أمان قبل النشر للإنتاج

- غيّر `Jwt:Key` إلى مفتاح سري جديد ولا تشاركه، واستبدل مفاتيح Stripe التجريبية بمفاتيح الإنتاج الحقيقية عبر متغيرات بيئة أو Secret Manager (وليس داخل أي ملف appsettings مرفوع لأي مكان).
- غيّر كلمة مرور حساب المدير الافتراضي فور أول تسجيل دخول.
- فعّل HTTPS وقيّد CORS على نطاق الإنتاج الفعلي بدلاً من `localhost`.
