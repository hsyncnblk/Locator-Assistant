# Gizlilik Politikası: Müfettiş-ül Element Chrome Uzantısı

Bu Gizlilik Politikası, Müfettiş-ül Element Chrome Uzantısı'nın ("Uygulama") geliştiricisi tarafından yönetilmektedir. Uygulama, otomasyon geliştiricilerine web sayfalarındaki elementler için güvenilir locator'lar oluşturma amacına hizmet eden tek amaçlı bir araçtır.

---

## 1. Toplanan Bilgiler ve Veri Kullanımı

Müfettiş-ül Element Uzantısı, kullanıcı gizliliğine mutlak saygı göstermek üzere tasarlanmıştır.

### A. Veri Toplanmaz

* **Kişisel Kimlik Bilgileri (PII):** Uygulama, kullanıcı adı, e-posta adresi, konum bilgisi veya IP adresi gibi kullanıcıyı kişisel olarak tanımlayan hiçbir bilgi **TOPLAMAZ**.
* **Gezinme Geçmişi:** Uygulama, ziyaret ettiğiniz web siteleri veya gezinme geçmişiniz hakkında hiçbir veriyi kaydetmez, izlemez veya iletmez.
* **Analiz/Telemetri:** Uygulama, herhangi bir üçüncü taraf analiz hizmeti (Google Analytics, vb.) **KULLANMAZ** ve performans/kullanım verisi **TOPLAMAZ**.

### B. Yerel Depolama (Local Storage) Kullanımı

Uygulama, çalışması için gereken minimal ayarları kullanıcı cihazında yerel olarak depolar. Bu veriler cihazınızdan harici bir sunucuya **ASLA** iletilmez.

| Veri Adı | Amaç | İletim |
| :--- | :--- | :--- |
| `currentFramework` | Kullanıcının seçtiği otomasyon framework'ünü (örneğin 'selenium-pf' veya 'playwright') hatırlamak için. | Harici Sunucuya İletilmez |
| `isPickingActive` | Side Panel (Yan Panel) açık/kapalı durumunu kaydetmek ve Panel kapalıyken sayfa üzerindeki seçim modunu pasifleştirmek için. | Harici Sunucuya İletilmez |

---

## 2. İzinlerin Gerekçesi

Uygulama, Tek Amaç İlkesi'ne bağlı kalır. Talep edilen izinler, sadece locator bulma ve üretme temel işlevini yerine getirmek için zorunludur.

* `sidePanel`: Uzantının ana arayüzünü tarayıcının yan çubuğunda göstermek için.
* `scripting`: Elementleri vurgulama ve tıklama olaylarını yakalama işlevi için `content.js` betiğini aktif sekmedeki sayfalara enjekte etmek için.
* `activeTab`: `scripting` operasyonlarının sadece kullanıcının o an etkileşimde olduğu sekmede gerçekleşmesini sağlamak için.
* `storage`: Kullanıcının seçtiği framework'ü ve `isPickingActive` durumunu cihazda güvenli bir şekilde depolamak için.
* `host_permissions` (`<all_urls>`): Müfettiş-ül Element'in tüm web sitelerinde (test ortamları dahil) element bulma temel işlevini yerine getirmesi için gereklidir.

---

## 3. Politika Değişiklikleri

Bu Gizlilik Politikası zaman zaman güncellenebilir. Herhangi bir değişiklik, uzantının yeni sürümü Chrome Web Mağazası'nda yayınlanmadan önce bu GitHub sayfasında ilan edilecektir.

---

## 4. İletişim

Gizlilik Politikası hakkında sorularınız varsa, lütfen [E-posta Adresiniz] üzerinden geliştirici ile iletişime geçin.

***

**Yürürlük Tarihi:** 9 Aralık 2025
