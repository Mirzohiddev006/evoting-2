# EVote - Elektron ovoz berish tizimi frontend qismi

React va TypeScript asosida yaratilgan elektron ovoz berish tizimining tayyor frontend qismi.

## Texnologiyalar
- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS v4**: yordamchi klasslar orqali uslublash va mavzu uchun CSS o'zgaruvchilari
- **React Router v7**: zarur paytda yuklanadigan sahifalar va rolga asoslangan himoyalar
- **@tanstack/react-query**: server ma'lumotlari va jonli natijalarni davriy yangilash
- **Zustand**: autentifikatsiya va mavzu holatini saqlash
- **React Hook Form** + **Zod**: forma validatsiyasi
- **Recharts**: doira, ustunli va maydon diagrammalar
- **jsPDF**: natijalarni PDF ko'rinishida eksport qilish
- **react-hot-toast**: bildirishnomalar
- **lucide-react**: ikonlar

## Loyiha tuzilmasi
```text
src/
  api/          # axios client va auth/so'rovnoma/ovoz/foydalanuvchi API'lari
  components/
    ui/          # Button, Input, Card, Badge, Modal, Skeleton...
    shared/      # Navbar, PollCard, MetricCard, RouteGuards
  lib/           # yordamchi funksiyalar
  pages/
    auth/        # Kirish, ro'yxatdan o'tish
    user/        # Bosh sahifa, so'rovnoma, natijalar, profil
    admin/       # Admin panel, so'rovnomalar, forma, foydalanuvchilar, statistika
  store/         # authStore (Zustand), themeStore
  types/         # TypeScript interfeyslari
```

## Demo hisoblar
| Rol   | Email             | Parol              |
|-------|-------------------|--------------------|
| Admin | alice@example.com | istalgan 6+ belgi  |
| Foydalanuvchi | bob@example.com | istalgan 6+ belgi |

## Imkoniyatlar
- **Auth**: JWT orqali kirish/ro'yxatdan o'tish, admin va foydalanuvchi route guardlari
- **Bosh sahifa**: faol so'rovnomalar ro'yxati, qidiruv va holat bo'yicha filtr
- **Ovoz berish**: bitta variantga ovoz berish, takroriy ovozni cheklash
- **Jonli natijalar**: har 10 soniyada avtomatik yangilanish, doira va ustunli diagrammalar
- **Admin panel**: so'rovnomalarni yaratish, tahrirlash, boshlash, to'xtatish va o'chirish
- **Foydalanuvchilar**: foydalanuvchilarni ko'rish, rollarni boshqarish, o'chirish
- **PDF eksport**: natijalarni jsPDF orqali PDF faylga chiqarish
- **Qorong'i/yorug' mavzu**: tanlangan mavzu saqlanadi
- **Moslashuvchan dizayn**: mobil qurilmalar uchun qulay

## Ishlab chiqish
```bash
npm install
npm run dev
```

## Production uchun yig'ish
```bash
npm run build
```

## Backend bilan ulash
`src/api/*.api.ts` fayllarida `apiClient` orqali real backend endpointlari ishlatiladi. JWT token qo'shish va 401 javobida tokenni yangilash allaqachon sozlangan.
