# Fizyo · Hasta ve seans takibi

İnternet veya harici hizmet gerektirmeyen Türkçe hasta takip uygulaması.

## Başlatma

Python 3 ve modern bir tarayıcı yeterlidir. Depo dizininde `python3 -m http.server 3000 --bind 127.0.0.1` çalıştırın, tarayıcıda `http://localhost:3000` açın. Sunucu yalnızca yerel dosyaları sunar; internet gerekmez. Aynı adresi ve tarayıcı profilini kullanın. İlk açılıştan sonra service worker dosyaları çevrimdışı önbelleğe alır.

Hasta bilgileri, doktor, geliş amacı, tanı, ilaçlar, kronik hastalıklar, ameliyatlar ve tedavi planı kaydedilir. 3–8 hafta paket ve haftalık 1–7 seans tanımlanır. Son iki seansta, seanslar tamamlanınca veya paket süresi dolunca uygulama içinde uyarı gösterilir. Kapalı uygulama işletim sistemi bildirimi göndermez. Süre dolduğunda seans eklemek için paket düzenlenir. Seanslar not ve tarihle kaydedilebilir, hatalı seans geri alınabilir.

Veriler bu tarayıcının yerel depolamasındadır; sunucuya gönderilmez. Gizli mod kullanmayın. Tarayıcı verileri silinirse kayıtlar kaybolabilir. Düzenli olarak “Yedek indir” kullanın. Geri yükleme mevcut kayıtları değiştirir ve onay ister. Yedekler şifrelenmemiş hasta bilgileri içerir; erişimi kısıtlı, güvenli yerde saklayın. Uygulamanın kullanıcı girişi ve veri şifrelemesi yoktur; gerçek hasta kullanımında cihaz erişimi ve sağlık verisi koruma gereksinimlerini değerlendirin.

## Doğrulama

`npm test` paket hesaplamalarını, uyarı koşullarını ve yedek doğrulamasını test eder. Uygulama bağımlılık kurulumu veya derleme gerektirmez.

## Windows 10 / 11 masaüstü sürümü

`release/Fizyo-Takip-Windows-1.0.0.zip` Windows x64 uygulama paketidir. ZIP dosyasını **Tümünü ayıkla** ile bir klasöre çıkarın. Klasör içindeki **Fizyo Takip.exe** dosyasını açın. EXE yanındaki dosyalarla birlikte kalmalıdır; yalnızca EXE dosyasını taşımayın. İsterseniz EXE üzerine sağ tıklayıp masaüstü kısayolu oluşturun. Uygulama ayrı pencerede açılır; Python, Node.js veya internet gerektirmez.

İmza sertifikası eklenmediği için Windows yayıncıyı doğrulayamayabilir. Windows çalıştırma testi bu Linux ortamında yapılamadı. NSIS kurulum oluşturma denemesi Wine bulunmadığı için tamamlanamadı; ZIP sürümü kurulum gerektirmez.

Kayıtlar Windows kullanıcısının `%APPDATA%/Fizyo Takip` alanında saklanır. Önceki tarayıcı kayıtları kendiliğinden taşınmaz: tarayıcı sürümünde **Yedek indir**, masaüstü sürümünde **Yedekten geri yükle** kullanın. Güncelleme veya kaldırma öncesi yedek alın.

Geliştirici için: `npm ci` ardından `npm run desktop` masaüstü sürümünü başlatır. `npm run build:windows` Windows x64 ZIP paketini üretir. `npm run build:installer` NSIS kurulumunu üretir; Windows veya Wine gerektirir. Paket üretimi araçları indirirken internet kullanır; uygulamanın çalışması internet gerektirmez. `npm run build:html` tek dosyalık sürümü kaynaklardan günceller.
