# AIMROOM — CS2 Training Tracker

İki veya daha fazla oyuncunun birbirine günlük CS2 antrenman görevi atayabildiği, görevleri tamamlayabildiği ve ekran görüntüsü kanıtı yükleyebildiği özel panel.

## Özellikler
- Kullanıcı adı + parola ile giriş
- Gün bazlı görev ekranı
- Birbirine görev atama
- Aim / DM / Surf / Utility / Diğer görev türleri
- Hedef ve birim (1000 adet, 2 saat, 30 dakika vb.)
- Checkbox ile tamamlama
- DM/antrenman ekran görüntüsü yükleme
- Günlük tamamlanma yüzdesi
- Tüm görevler bitince tebrik ekranı
- Responsive mobil/masaüstü arayüz
- GitHub → Vercel deploy uyumlu

## 1. Supabase kur
1. https://supabase.com üzerinden yeni proje oluştur.
2. SQL Editor'ı aç.
3. `supabase/setup.sql` dosyasının tamamını çalıştır.
4. Authentication > Users > Add user ile iki oyuncuyu ekle.

Uygulamada kullanıcı adı ile giriş yapılabilmesi için e-postaları şu formatta ver:
- `jahner@training.local`
- `arkadas@training.local`

Parolaları istediğin gibi belirleyebilirsin.

5. Authentication > Users ekranından iki kullanıcının UUID değerlerini al.
6. SQL Editor'da aşağıdaki sorguyu kendi UUID'lerinle çalıştır:

```sql
insert into public.profiles (id, username, display_name) values
('JAHNER-UUID', 'jahner', 'Jahner'),
('ARKADAS-UUID', 'arkadas', 'Arkadaş');
```

## 2. Environment değişkenleri
Supabase Dashboard > Project Settings / Connect bölümünden Project URL ve Publishable Key değerlerini al.

`.env.example` dosyasını `.env.local` olarak kopyala:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxx
```

## 3. Lokal çalıştır
```bash
npm install
npm run dev
```

## 4. Vercel'e yayınla
1. Projeyi GitHub repository'sine yükle.
2. Vercel > Add New > Project.
3. GitHub repository'yi seç.
4. Framework otomatik olarak Next.js algılanır.
5. Vercel Project Settings > Environment Variables bölümüne şu iki değeri ekle:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
6. Deploy.

Her GitHub push işleminden sonra Vercel otomatik yeni sürümü yayınlar.

## Not
Bu sürüm Supabase Auth kullanır. Parolalar uygulama kodunun veya GitHub repository'sinin içinde tutulmaz.
