# 🎮 BulletType - Türkçe Yazma Oyunu

Retro arcade tarzında, Türkçe klavye hızını geliştiren eğlenceli bir typing oyunu. Phaser 3 ve Firebase ile geliştirilmiştir.

<!-- EKRAN GÖRÜNTÜSÜ: Ana menü ekranı -->

## 🌐 Demo

🎮 **[Canlı Demo](https://bullettype.vercel.app)** _(Vercel'e deploy edildikten sonra linki güncelleyin)_

> **Not**: Demo için giriş yapmanız gerekmez, "MİSAFİR OLARAK DEVAM ET" butonunu kullanabilirsiniz.

## ✨ Özellikler

### 🎯 Oyun Mekanikleri
- **Türkçe Karakter Desteği**: Ç, Ğ, İ, Ö, Ş, Ü karakterleri tam destek
- **Seviye Sistemi**: Artan zorluk seviyeleri
- **Skor Sistemi**: Her harf ve kelime için puan kazanma
- **Can Sistemi**: 3 can ile oyun deneyimi
- **Kelime Geçişi**: Tek tuşla kelimeler arası geçiş

### 🎨 Görsel ve Ses
- **Retro Arcade Tasarım**: CRT monitör estetiği, neon renkler
- **6 Farklı Uçak**: Seçilebilir uçak modelleri
- **Scrolling Background**: Hareket eden savaş alanı arka planı
- **Parçacık Efektleri**: Ateş, patlama ve mermi izleri
- **9 Müzik Parçası**: Rastgele çalan retro müzikler
- **Ses Efektleri**: Ateş, patlama ve hasar sesleri

### 🔐 Kullanıcı Sistemi
- **Firebase Authentication**: Kullanıcı adı ve şifre ile giriş
- **Anonim Giriş**: Misafir olarak oynama seçeneği
- **Skor Kaydetme**: En yüksek skorun otomatik kaydı
- **Leaderboard**: Top 10 sıralaması ve kişisel sıralama
- **Çıkış Yapma**: Güvenli oturum kapatma

### ⚙️ Ayarlar
- **Müzik Kontrolü**: Ses seviyesi, önceki/sonraki parça, sessiz
- **Efekt Kontrolü**: Ses efektleri seviyesi ve sessiz
- **Uçak Seçimi**: 6 farklı uçak modeli
- **Duraklama**: ESC ile oyunu durdurma

### 🎮 Oyun Kontrolleri
- **Yazma**: Klavye ile kelime yazma
- **ESC**: Oyunu duraklat/devam ettir
- **ENTER**: Duraklatma menüsünden ana menüye dön
- **Konami Code**: Gizli God Mode (↑↑↓↓←→←→BA)

<!-- EKRAN GÖRÜNTÜSÜ: Oyun ekranı -->

## 🚀 Kurulum

### Gereksinimler
- Node.js (v16 veya üzeri)
- npm veya yarn
- Firebase hesabı

### Adımlar

1. **Repoyu klonlayın**
```bash
git clone https://github.com/[kullanici-adi]/bullettype.git
cd bullettype
```

2. **Bağımlılıkları yükleyin**
```bash
npm install
```

3. **Environment variables ayarlayın**

`.env.example` dosyasını `.env` olarak kopyalayın:

```bash
cp .env.example .env
```

`.env` dosyasını düzenleyip kendi Firebase bilgilerinizi ekleyin:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

4. **Firebase Console ayarları**

Firebase Console'da şu ayarları yapın:
- **Authentication** > **Sign-in method** > **Email/Password**: Enabled
- **Authentication** > **Sign-in method** > **Anonymous**: Enabled
- **Firestore Database** > **Rules**: `firestore.rules` dosyasındaki kuralları yayınlayın

5. **Geliştirme sunucusunu başlatın**
```bash
npm run dev
```

6. **Tarayıcıda açın**
```
http://localhost:5173
```

## 🎯 Nasıl Oynanır?

1. **Giriş Yapın**: Kullanıcı adı ve şifre ile kayıt olun veya misafir olarak devam edin
2. **Uçak Seçin**: Ayarlar menüsünden favori uçağınızı seçin
3. **Oyunu Başlatın**: START butonuna tıklayın
4. **Kelimeleri Yazın**: Ekranda düşen kelimeleri klavye ile yazın
5. **Skor Kazanın**: Her harf ve kelime için puan toplayın
6. **Seviye Atlayın**: Yeterli puan toplayarak yeni seviyelere geçin

<!-- EKRAN GÖRÜNTÜSÜ: Leaderboard -->

## 🏆 Skor Sistemi

- **Harf Başına**: 1 puan
- **Kelime Tamamlama**: 5 puan bonus
- **Seviye Atlama**: Her 100 puanda yeni seviye
- **En Yüksek Skor**: Sadece en yüksek skorunuz kaydedilir

## 🎨 Uçak Modelleri

1. **Classic** - Klasik savaş uçağı
2. **Bit-Striker** - Piksel sanatı tarzı
3. **Sky Warden** - Gökyüzü koruyucusu
4. **Nebula Ghost** - Hayalet uçak
5. **Apex Sentinel** - Gelişmiş savaşçı
6. **Stormbringer** - Fırtına getiren

<!-- EKRAN GÖRÜNTÜSÜ: Ayarlar menüsü -->

## 🛠️ Teknolojiler

- **Phaser 3**: Oyun motoru
- **TypeScript**: Tip güvenli geliştirme
- **Vite**: Hızlı build aracı
- **Firebase**: Backend servisleri
  - Authentication: Kullanıcı yönetimi
  - Firestore: Veritabanı
- **HTML5 Canvas**: Oyun render

## 📁 Proje Yapısı

```
bullettype/
├── src/
│   ├── audio/              # Ses yönetimi
│   │   └── SoundManager.ts
│   ├── config/             # Yapılandırma dosyaları
│   │   ├── FirebaseConfig.ts
│   │   ├── GameConfig.ts
│   │   ├── PlaneConfig.ts
│   │   └── WordDatabase.ts
│   ├── effects/            # Görsel efektler
│   │   └── ParticleEffects.ts
│   ├── objects/            # Oyun nesneleri
│   │   ├── FallingWord.ts
│   │   └── Plane.ts
│   ├── scenes/             # Oyun sahneleri
│   │   ├── LoginScene.ts
│   │   ├── MenuScene.ts
│   │   ├── GameScene.ts
│   │   └── GameOverScene.ts
│   ├── services/           # Backend servisleri
│   │   └── FirebaseService.ts
│   ├── ui/                 # Kullanıcı arayüzü
│   │   ├── LeaderboardPanel.ts
│   │   └── SettingsMenu.ts
│   └── main.ts             # Giriş noktası
├── public/
│   └── sounds/             # Ses dosyaları
├── images/                 # Görseller
│   ├── ucaklar/           # Uçak görselleri
│   ├── asteroid.png
│   ├── evren.png
│   └── savas.png
├── firestore.rules         # Firestore güvenlik kuralları
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 🔒 Firestore Güvenlik Kuralları

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /scores/{userId} {
      allow read: if true;
      allow create, update: if request.auth != null 
                            && request.auth.uid == userId
                            && request.resource.data.userId == userId;
      allow delete: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🔐 Güvenlik Notları

### Environment Variables
- `.env` dosyası **asla** Git'e commit edilmemelidir
- `.env.example` dosyası şablon olarak kullanılmalıdır
- Production ortamında environment variables'ları hosting platformunuzda ayarlayın

### Firebase Güvenliği
- Firebase API Key'ler public olabilir (client-side kullanım için)
- Asıl güvenlik Firestore Rules ile sağlanır
- Authentication kurallarını mutlaka aktif edin
- Firestore Rules'u production'a geçmeden önce test edin

### .gitignore
Şu dosyalar Git'e eklenmemelidir:
- `.env`
- `.env.local`
- `.env.*.local`
- `node_modules/`
- `dist/`

## 🐛 Sorun Giderme

### Firebase Bağlantı Hatası
- Firebase Console'da Authentication ve Firestore'un etkin olduğundan emin olun
- `.env` dosyasındaki bilgileri kontrol edin
- Tarayıcı konsolunda hata mesajlarını inceleyin

### Ses Çalmıyor
- Tarayıcı ses izinlerini kontrol edin
- Ses dosyalarının `public/sounds/` klasöründe olduğundan emin olun
- Sayfa yüklenirken kullanıcı etkileşimi gerekebilir (autoplay politikası)

### Leaderboard Yüklenmiyor
- İnternet bağlantınızı kontrol edin
- Firestore kurallarının doğru yayınlandığından emin olun
- Tarayıcı cache'ini temizleyin

Detaylı sorun giderme için `SETUP.md` dosyasına bakın.

## 🎮 Gelecek Özellikler

- [ ] Çok oyunculu mod
- [ ] Günlük/haftalık turnuvalar
- [ ] Başarım sistemi
- [ ] Özel kelime listeleri
- [ ] Mobil destek
- [ ] Farklı oyun modları (zaman yarışı, sonsuz mod)
- [ ] Tema seçenekleri

## 🚀 Deployment

### Vercel'e Deploy Etme (Önerilen)

1. **Vercel hesabı oluşturun**: [vercel.com](https://vercel.com)
2. **GitHub reposunu bağlayın**: Dashboard > New Project > Import
3. **Environment Variables ekleyin**:
   ```
   VITE_FIREBASE_API_KEY=your_value
   VITE_FIREBASE_AUTH_DOMAIN=your_value
   VITE_FIREBASE_PROJECT_ID=your_value
   VITE_FIREBASE_STORAGE_BUCKET=your_value
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_value
   VITE_FIREBASE_APP_ID=your_value
   VITE_FIREBASE_MEASUREMENT_ID=your_value
   ```
4. **Deploy** butonuna tıklayın
5. **Firebase Console'da domain ekleyin**: Authentication > Settings > Authorized domains

### Diğer Platformlar

- **Netlify**: Benzer şekilde environment variables ekleyin
- **Firebase Hosting**: `firebase deploy` komutu ile

Detaylı deployment talimatları için `SETUP.md` dosyasına bakın.

## 🐛 Sorun Giderme

### Firebase Bağlantı Hatası
- Firebase Console'da Authentication ve Firestore'un etkin olduğundan emin olun
- `.env` dosyasındaki bilgileri kontrol edin
- Tarayıcı konsolunda hata mesajlarını inceleyin

### Ses Çalmıyor
- Tarayıcı ses izinlerini kontrol edin
- Sayfa yüklenirken kullanıcı etkileşimi gerekebilir (autoplay politikası)

### Leaderboard Yüklenmiyor
- İnternet bağlantınızı kontrol edin
- Firestore kurallarının doğru yayınlandığından emin olun
- Tarayıcı cache'ini temizleyin

Detaylı sorun giderme için `SETUP.md` dosyasına bakın.

## 🤝 Katkıda Bulunma

Katkılarınızı bekliyoruz! Lütfen şu adımları izleyin:

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📝 Lisans

Bu proje kişisel bir projedir ve şu anda herhangi bir açık kaynak lisansı altında değildir. 

Projeyi:
- ✅ İnceleyebilir ve öğrenme amaçlı kullanabilirsiniz
- ✅ Fork'layıp kendi versiyonunuzu geliştirebilirsiniz
- ❌ Ticari amaçla kullanamazsınız
- ❌ Kaynak belirtmeden yeniden dağıtamazsınız

Ticari kullanım veya işbirliği için lütfen iletişime geçin.

## 👨‍💻 Geliştirici

[Adınız] - [GitHub Profiliniz]

## 🙏 Teşekkürler

- **Phaser 3** - Harika oyun motoru
- **Firebase** - Backend servisleri
- **Freesound.org** - Ses efektleri
- Tüm katkıda bulunanlara teşekkürler!

## 📧 İletişim

Sorularınız veya önerileriniz için
- GitHub Issues: [Proje Issues Sayfası]
- Email: [email@example.com]

---

⭐ Projeyi beğendiyseniz yıldız vermeyi unutmayın!

<!-- EKRAN GÖRÜNTüSÜ: Game Over ekranı -->
