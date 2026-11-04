# İstanbul’da Mobil İnternet Performansı

Power BI ile İstanbul’un 39 ilçesinde mobil internet performansının ilçe, yaka ve dönem bazında incelenmesi.

## Kapsam

- Ocak 2025–Eylül 2026: 7 çeyrek, 39 ilçe ve 273 ilçe–dönem kaydı.
- Test sayısına göre ağırlıklı indirme hızı, yükleme hızı ve gecikme.
- İlçe sıralaması, Anadolu–Avrupa yakalarının dönemsel karşılaştırması ve hız–gecikme dağılımı.
- İlçe ve yıl filtreleriyle etkileşimli tek sayfalık rapor.

## Kullanım

`istanbul_mobil_internet_analizi.pbix` dosyasını indirip Microsoft Power BI Desktop ile açın. GitHub PBIX raporunu doğrudan görüntülemez. Yenileme için kaynak CSV dosyasının yolunun kendi bilgisayarınıza göre düzenlenmesi gerekebilir.

## Veri modeli

`Ilceler` ve `donemler` boyutları, `MobilPerformans` tablosuna bire çok ilişkilerle bağlıdır. Boyut tabloları Power Query’de ana tablodan referans alınarak oluşturulmuştur.

## Yöntem ve sınırlar

İlçe eşleştirmesi, konumsal hücre merkezlerinin OpenStreetMap tabanlı ilçe sınırları içinde bulunmasına göre yapılmıştır. Ortalamalar test sayısıyla ağırlıklandırılmıştır. Veriler test yapılan konumları temsil eder; tüm kullanıcıları temsil ettiği varsayılmaz. Veri doğrudan sinyal gücü, baz istasyonu sayısı veya operatör karşılaştırması içermez. 2026 yalnızca ilk üç çeyreği kapsar; yıllık karşılaştırmalarda aynı dönemler seçilmelidir.

## Kaynak ve lisans

- [Speedtest by Ookla Global Fixed and Mobile Network Performance Maps](https://github.com/teamookla/ookla-open-data), 2025 Q1–2026 Q3; erişim 3 Kasım 2026. Veri lisansı: [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/). İlçe bazında özetleme ve birim dönüşümü uygulanmıştır. Ookla verilerinden türetilen içerik aynı lisans koşullarına tabidir.
- [İstanbul ilçe sınırları](https://github.com/sahircansurmeli/istanbul-geojson): © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright), ODbL 1.0.

Bu proje bağımsız bir öğrenci çalışmasıdır.
