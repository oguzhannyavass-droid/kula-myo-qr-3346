document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    let eventId = urlParams.get('eventId') || 'etkinlik_1';

    // ==========================================
    // 1. ÖĞRENCİ QR OKUTTUĞUNDA AÇILAN EKRAN
    // ==========================================
    if (token) {
        document.body.innerHTML = `
            <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #0d2b52; font-family: 'Inter', sans-serif; color: #fff; padding: 1rem;">
                <div style="background: #113663; padding: 2.5rem; border-radius: 1rem; box-shadow: 0 10px 25px rgba(0,0,0,0.3); width: 100%; max-width: 450px; border: 1px solid rgba(255,255,255,0.1);">
                    <h2 style="margin-bottom: 0.5rem; font-size: 1.5rem; text-align: center; color: #fff;">Kula MYO Yoklama</h2>
                    <p style="text-align: center; color: #a6e6db; margin-bottom: 1.5rem; font-size: 0.9rem;">Lütfen giriş yapın veya kayıt olun.</p>
                    
                    <div style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem;">
                        <button id="tabLoginBtn" style="flex: 1; padding: 0.5rem; border-radius: 0.5rem; border: none; background: #a6e6db; color: #0d2b52; font-weight: bold; cursor: pointer;">Giriş Yap</button>
                        <button id="tabRegisterBtn" style="flex: 1; padding: 0.5rem; border-radius: 0.5rem; border: 1px solid rgba(255,255,255,0.2); background: transparent; color: #fff; font-weight: bold; cursor: pointer;">Kayıt Ol</button>
                    </div>

                    <form id="loginForm" style="display: flex; flex-direction: column; gap: 1rem;">
                        <input type="text" id="logNo" placeholder="Öğrenci Numarası" required style="padding: 0.75rem; border-radius: 0.5rem; border: 1px solid rgba(255,255,255,0.2); background: rgba(0,0,0,0.2); color: #fff; outline: none;">
                        <input type="password" id="logPw" placeholder="Şifre" required style="padding: 0.75rem; border-radius: 0.5rem; border: 1px solid rgba(255,255,255,0.2); background: rgba(0,0,0,0.2); color: #fff; outline: none;">
                        <button type="submit" style="padding: 0.75rem; border-radius: 0.5rem; border: none; background: #a6e6db; color: #0d2b52; font-weight: bold; cursor: pointer; margin-top: 0.5rem;">Yoklamaya Katıl</button>
                    </form>

                    <form id="registerForm" style="display: none; flex-direction: column; gap: 1rem;">
                        <input type="text" id="regNo" placeholder="Öğrenci Numarası" required style="padding: 0.75rem; border-radius: 0.5rem; border: 1px solid rgba(255,255,255,0.2); background: rgba(0,0,0,0.2); color: #fff; outline: none;">
                        <input type="text" id="regName" placeholder="Ad Soyad" required style="padding: 0.75rem; border-radius: 0.5rem; border: 1px solid rgba(255,255,255,0.2); background: rgba(0,0,0,0.2); color: #fff; outline: none;">
                        <input type="text" id="regBolum" placeholder="Bölüm" required style="padding: 0.75rem; border-radius: 0.5rem; border: 1px solid rgba(255,255,255,0.2); background: rgba(0,0,0,0.2); color: #fff; outline: none;">
                        <input type="password" id="regPw" placeholder="Şifre Belirle" required style="padding: 0.75rem; border-radius: 0.5rem; border: 1px solid rgba(255,255,255,0.2); background: rgba(0,0,0,0.2); color: #fff; outline: none;">
                        <button type="submit" style="padding: 0.75rem; border-radius: 0.5rem; border: none; background: #a6e6db; color: #0d2b52; font-weight: bold; cursor: pointer; margin-top: 0.5rem;">Kayıt Ol</button>
                    </form>
                </div>
            </div>
        `;

        const tabLoginBtn = document.getElementById('tabLoginBtn');
        const tabRegisterBtn = document.getElementById('tabRegisterBtn');
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');

        tabLoginBtn.addEventListener('click', () => {
            loginForm.style.display = 'flex';
            registerForm.style.display = 'none';
            tabLoginBtn.style.background = '#a6e6db'; tabLoginBtn.style.color = '#0d2b52';
            tabRegisterBtn.style.background = 'transparent'; tabRegisterBtn.style.color = '#fff';
        });

        tabRegisterBtn.addEventListener('click', () => {
            registerForm.style.display = 'flex';
            loginForm.style.display = 'none';
            tabRegisterBtn.style.background = '#a6e6db'; tabRegisterBtn.style.color = '#0d2b52';
            tabLoginBtn.style.background = 'transparent'; tabLoginBtn.style.color = '#fff';
        });

        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ogrenci_no: document.getElementById('regNo').value,
                    ogrenci_ad_soyad: document.getElementById('regName').value,
                    bolum: document.getElementById('regBolum').value,
                    sifre: document.getElementById('regPw').value
                })
            });
            const result = await res.json();
            alert(result.message);
            if (result.success) tabLoginBtn.click();
        });

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const ogrenciNo = document.getElementById('logNo').value;
            const sifre = document.getElementById('logPw').value;

            const res = await fetch('/api/login-and-attend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ogrenci_no: ogrenciNo, sifre, eventId, submittedToken: token })
            });
            const result = await res.json();
            if (result.success) {
                document.body.innerHTML = `
                    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #0d2b52; color: #fff; text-align: center; padding: 1rem;">
                        <div style="background: #113663; padding: 2.5rem; border-radius: 1rem; max-width: 400px; width: 100%;">
                            <h2 style="color: #a6e6db; margin-bottom: 1rem;">Yoklama Başarılı!</h2>
                            <p style="margin-bottom: 1.5rem;">${result.message}</p>
                            <button id="viewProfileBtn" style="padding: 0.75rem 1.5rem; background: #a6e6db; color: #0d2b52; border: none; border-radius: 0.5rem; font-weight: bold; cursor: pointer;">Profilimi & Katıldığım Etkinlikleri Gör</button>
                        </div>
                    </div>
                `;

                document.getElementById('viewProfileBtn').addEventListener('click', async () => {
                    const profRes = await fetch(`/api/student-profile?ogrenci_no=${ogrenciNo}`);
                    const profResult = await profRes.json();
                    if (profResult.success) {
                        let historyRows = profResult.history.map(h => `<tr><td style="padding:0.4rem;">${h.etkinlik_id}</td><td style="padding:0.4rem;">${new Date(h.katilim_tarihi).toLocaleString('tr-TR')}</td></tr>`).join('');
                        
                        document.body.innerHTML = `
                            <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #0d2b52; color: #fff; padding: 1rem;">
                                <div style="background: #113663; padding: 2rem; border-radius: 1rem; max-width: 500px; width: 100%;">
                                    <h3 style="color: #a6e6db; margin-top:0;">Öğrenci Profili</h3>
                                    <form id="updateProfileForm" style="display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.5rem;">
                                        <label style="font-size:0.85rem; color:#a6e6db;">Ad Soyad:</label>
                                        <input type="text" id="updName" value="${profResult.student.ogrenci_ad_soyad}" required style="padding:0.5rem; background:rgba(0,0,0,0.2); color:#fff; border:1px solid rgba(255,255,255,0.2); border-radius:0.4rem;">
                                        <label style="font-size:0.85rem; color:#a6e6db;">Bölüm:</label>
                                        <input type="text" id="updBolum" value="${profResult.student.bolum}" required style="padding:0.5rem; background:rgba(0,0,0,0.2); color:#fff; border:1px solid rgba(255,255,255,0.2); border-radius:0.4rem;">
                                        <label style="font-size:0.85rem; color:#a6e6db;">Yeni Şifre:</label>
                                        <input type="password" id="updPw" value="${profResult.student.sifre}" required style="padding:0.5rem; background:rgba(0,0,0,0.2); color:#fff; border:1px solid rgba(255,255,255,0.2); border-radius:0.4rem;">
                                        <button type="submit" style="padding:0.5rem; background:#a6e6db; color:#0d2b52; border:none; border-radius:0.4rem; font-weight:bold; cursor:pointer;">Bilgilerimi Güncelle</button>
                                    </form>
                                    <h4 style="color: #a6e6db; margin-bottom:0.5rem;">Katıldığım Etkinlikler (${profResult.history.length})</h4>
                                    <div style="max-height: 150px; overflow-y: auto;">
                                        <table style="width:100%; border-collapse:collapse; font-size:0.85rem;">
                                            <tr style="border-bottom:1px solid rgba(255,255,255,0.2); color:#a6e6db;"><th style="text-align:left; padding:0.4rem;">Etkinlik</th><th style="text-align:left; padding:0.4rem;">Tarih</th></tr>
                                            ${historyRows || '<tr><td colspan="2" style="padding:0.5rem; text-align:center;">Henüz katılım yok.</td></tr>'}
                                        </table>
                                    </div>
                                </div>
                            </div>
                        `;

                        document.getElementById('updateProfileForm').addEventListener('submit', async (e) => {
                            e.preventDefault();
                            const uRes = await fetch('/api/update-profile', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    ogrenci_no: ogrenciNo,
                                    ogrenci_ad_soyad: document.getElementById('updName').value,
                                    bolum: document.getElementById('updBolum').value,
                                    sifre: document.getElementById('updPw').value
                                })
                            });
                            const uResJson = await uRes.json();
                            alert(uResJson.message);
                        });
                    }
                });
            } else {
                alert("Hata: " + result.message);
            }
        });
    } 
    // ==========================================
    // 2. ANA SAYFA VE YÖNETİCİ EKRANI
    // ==========================================
    else {
        // Duyuruları Ana Sayfaya Yükleme
        async function setupHomepageAnnouncements() {
            try {
                const res = await fetch('/api/get-announcements');
                const result = await res.json();
                
                const annSection = document.getElementById('mainAnnouncementsBox');
                if (!annSection) return;

                if (result.success && result.data.length > 0) {
                    annSection.innerHTML = `
                        <div style="display: grid; gap: 1.2rem; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));">
                            ${result.data.map(ann => `
                                <div style="background: #113663; padding: 1.5rem; border-radius: 0.75rem; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 4px 6px rgba(0,0,0,0.2);">
                                    <h3 style="margin: 0 0 0.5rem 0; color: #fff; font-size: 1.3rem;">${ann.baslik}</h3>
                                    <p style="margin: 0 0 1rem 0; color: rgba(255,255,255,0.85); font-size: 1rem; line-height: 1.5;">${ann.icerik}</p>
                                    <span style="font-size: 0.85rem; color: #a6e6db;">Yayın Tarihi: ${new Date(ann.created_at).toLocaleDateString('tr-TR')}</span>
                                </div>
                            `).join('')}
                        </div>
                    `;
                } else {
                    annSection.innerHTML = `<p style="color: rgba(255,255,255,0.7);">Şu an aktif bir duyuru bulunmuyor.</p>`;
                }
            } catch (err) {
                console.error("Duyurular yüklenemedi:", err);
            }
        }
        setupHomepageAnnouncements();

        // QR Kod Üretici Fonksiyonu (Akıllı Tahtalar İçin)
        async function refreshQRCode(targetContainerId, targetEventId) {
            const qrContainer = document.getElementById(targetContainerId);
            if (!qrContainer) return;
            try {
                const response = await fetch(`/api/get-qr-token?eventId=${targetEventId}`);
                const data = await response.json();
                const checkInUrl = `${window.location.origin}/?eventId=${data.eventId}&token=${data.token}`;
                
                qrContainer.innerHTML = "";
                new QRCode(qrContainer, {
                    text: checkInUrl,
                    width: 200,
                    height: 200,
                    colorDark: "#0d2b52", 
                    colorLight: "#ffffff",
                });
            } catch (error) {
                console.error("QR güncellenemedi:", error);
            }
        }

        // Yönetici Paneli Yükleme ve Sekme Sistemi
        window.loadAdminDashboard = async function() {
            const panelWrapper = document.getElementById('adminPanelWrapper');
            if (!panelWrapper) return;

            try {
                const evRes = await fetch('/api/get-events');
                const evResult = await evRes.json();
                const annRes = await fetch('/api/get-announcements');
                const annResult = await annRes.json();

                let eventOptions = evResult.success ? evResult.data.map(ev => `<option value="${ev.etkinlik_id}">${ev.etkinlik_adi} (${ev.yer || 'Yer yok'})</option>`).join('') : '';

                panelWrapper.innerHTML = `
                    <div style="background: #113663; padding: 1.5rem; border-radius: 1rem; color: #fff;">
                        <!-- 3 SEKMELİ YÖNETİM MENÜSÜ -->
                        <div style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 1rem; flex-wrap: wrap;">
                            <button id="adminTabManage" style="padding: 0.5rem 1rem; background: #a6e6db; color: #0d2b52; border: none; border-radius: 0.5rem; font-weight: bold; cursor: pointer;">Etkinlikler & Duyurular</button>
                            <button id="adminTabNew" style="padding: 0.5rem 1rem; background: transparent; color: #fff; border: 1px solid rgba(255,255,255,0.2); border-radius: 0.5rem; font-weight: bold; cursor: pointer;">Yeni Etkinlik & QR Başlat</button>
                            <button id="adminTabManual" style="padding: 0.5rem 1rem; background: transparent; color: #fff; border: 1px solid rgba(255,255,255,0.2); border-radius: 0.5rem; font-weight: bold; cursor: pointer;">Manuel Listeye Ekle</button>
                        </div>

                        <!-- SEKME 1: ETKİNLİKLER & DUYURULAR -->
                        <div id="sectionManage" style="display: flex; flex-direction: column; gap: 1.5rem;">
                            <!-- Etkinlik Listesi ve CSV -->
                            <div>
                                <h4 style="color: #a6e6db; margin-bottom: 0.5rem;">Mevcut Etkinlikler & Katılım Listeleri</h4>
                                <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap;">
                                    <select id="adminEventSelect" style="flex:1; padding:0.5rem; background:rgba(0,0,0,0.3); color:#fff; border:1px solid rgba(255,255,255,0.2); border-radius:0.4rem; min-width: 200px;">
                                        ${eventOptions}
                                    </select>
                                    <button id="loadAttListBtn" style="padding:0.5rem 1rem; background:#a6e6db; color:#0d2b52; border:none; border-radius:0.4rem; font-weight:bold; cursor:pointer;">Katılanları Gör / CSV İndir</button>
                                    <button onclick="editEvent()" style="padding:0.5rem 1rem; background:#ffb74d; color:#0d2b52; border:none; border-radius:0.4rem; font-weight:bold; cursor:pointer;">Düzenle</button>
                                    <button id="deleteEventBtn" style="padding:0.5rem 1rem; background:#ff4d4d; color:#fff; border:none; border-radius:0.4rem; font-weight:bold; cursor:pointer;">Sil</button>
                                </div>
                                <div id="adminAttendanceContainer"></div>
                            </div>

                            <!-- Duyuru Yönetimi -->
                            <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 1rem;">
                                <h4 style="color: #a6e6db; margin-bottom: 0.5rem;">Duyuru Yönetimi & Yeni Duyuru Ekle</h4>
                                <form id="announcementForm" style="display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem;">
                                    <input type="text" id="annTitle" placeholder="Duyuru Başlığı" required style="padding:0.5rem; background:rgba(0,0,0,0.2); color:#fff; border:1px solid rgba(255,255,255,0.2); border-radius:0.4rem;">
                                    <textarea id="annContent" placeholder="Duyuru İçeriği" required style="padding:0.5rem; background:rgba(0,0,0,0.2); color:#fff; border:1px solid rgba(255,255,255,0.2); border-radius:0.4rem; height:60px;"></textarea>
                                    <button type="submit" style="padding:0.5rem; background:#a6e6db; color:#0d2b52; border:none; border-radius:0.4rem; font-weight:bold; cursor:pointer;">Duyuru Yayınla</button>
                                </form>
                                <div style="max-height: 150px; overflow-y: auto;">
                                    <table style="width:100%; border-collapse:collapse; font-size:0.85rem;">
                                        ${annResult.success ? annResult.data.map(a => `
                                        <tr style="border-bottom:1px solid rgba(255,255,255,0.1);">
                                            <td style="padding:0.4rem;">${a.baslik}</td>
                                            <td style="padding:0.4rem; text-align:right;">
                                                <button onclick="editAnnouncement(${a.id}, '${a.baslik}', '${a.icerik}')" style="background:#ffb74d; color:#0d2b52; border:none; padding:0.2rem 0.5rem; border-radius:0.3rem; cursor:pointer; margin-right:5px;">Düzenle</button>
                                                <button onclick="deleteAnnouncement(${a.id})" style="background:#ff4d4d; color:#fff; border:none; padding:0.2rem 0.5rem; border-radius:0.3rem; cursor:pointer;">Sil</button>
                                            </td>
                                        </tr>`).join('') : ''}
                                    </table>
                                </div>
                            </div>
                        </div>

                        <!-- SEKME 2: YENİ ETKİNLİK & QR KOD -->
                        <div id="sectionNewEvent" style="display: none; flex-direction: column; gap: 1rem;">
                            <h4 style="color: #a6e6db; margin: 0;">Yeni Etkinlik / Toplantı Oluştur</h4>
                            <form id="newEventForm" style="display: flex; flex-direction: column; gap: 0.75rem;">
                                <input type="text" id="evTitle" placeholder="Etkinlik Adı" required style="padding:0.5rem; background:rgba(0,0,0,0.2); color:#fff; border:1px solid rgba(255,255,255,0.2); border-radius:0.4rem;">
                                <input type="text" id="evYer" placeholder="Yer (Örn: Konferans Salonu)" required style="padding:0.5rem; background:rgba(0,0,0,0.2); color:#fff; border:1px solid rgba(255,255,255,0.2); border-radius:0.4rem;">
                                <input type="datetime-local" id="evTarih" required style="padding:0.5rem; background:rgba(0,0,0,0.2); color:#fff; border:1px solid rgba(255,255,255,0.2); border-radius:0.4rem;">
                                <button type="submit" style="padding: 0.6rem; background: #a6e6db; color: #0d2b52; border: none; border-radius: 0.4rem; font-weight: bold; cursor: pointer; margin-top: 0.5rem;">Etkinliği Kaydet & Başlat</button>
                            </form>
                            <!-- Canlı QR Kodu Buraya Gelecek -->
                            <div id="liveAdminQr" style="display: flex; justify-content: center; padding: 1rem; margin-top: 1rem; background: #fff; border-radius: 0.5rem; max-width: 250px; align-self: center;"></div>
                        </div>

                        <!-- SEKME 3: MANUEL ÖĞRENCİ EKLE ("LİSTEYE EKLE") -->
                        <div id="sectionManual" style="display: none; flex-direction: column; gap: 1rem;">
                            <h4 style="color: #a6e6db; margin: 0;">Manuel Öğrenci Ekle ("Listeye Ekle")</h4>
                            <form id="manualAddForm" style="display: flex; flex-direction: column; gap: 0.75rem;">
                                <label style="font-size:0.85rem; color:#a6e6db;">Etkinlik / Toplantı Seç:</label>
                                <select id="manualEventSelect" style="padding:0.5rem; background:rgba(0,0,0,0.3); color:#fff; border:1px solid rgba(255,255,255,0.2); border-radius:0.4rem;">
                                    ${eventOptions}
                                </select>
                                <input type="text" id="manNo" placeholder="Öğrenci Numarası" required style="padding:0.5rem; background:rgba(0,0,0,0.2); color:#fff; border:1px solid rgba(255,255,255,0.2); border-radius:0.4rem;">
                                <input type="text" id="manName" placeholder="Ad Soyad" required style="padding:0.5rem; background:rgba(0,0,0,0.2); color:#fff; border:1px solid rgba(255,255,255,0.2); border-radius:0.4rem;">
                                <input type="text" id="manBolum" placeholder="Bölüm" required style="padding:0.5rem; background:rgba(0,0,0,0.2); color:#fff; border:1px solid rgba(255,255,255,0.2); border-radius:0.4rem;">
                                <button type="submit" style="padding: 0.6rem; background: #a6e6db; color: #0d2b52; border: none; border-radius: 0.4rem; font-weight: bold; cursor: pointer;">Listeye Ekle</button>
                            </form>
                        </div>
                    </div>
                `;

                // Sekme Geçiş Mantığı
                const btnManage = document.getElementById('adminTabManage');
                const btnNew = document.getElementById('adminTabNew');
                const btnManual = document.getElementById('adminTabManual');
                const secManage = document.getElementById('sectionManage');
                const secNew = document.getElementById('sectionNewEvent');
                const secManual = document.getElementById('sectionManual');

                btnManage.addEventListener('click', () => {
                    secManage.style.display = 'flex'; secNew.style.display = 'none'; secManual.style.display = 'none';
                    btnManage.style.background = '#a6e6db'; btnManage.style.color = '#0d2b52';
                    btnNew.style.background = 'transparent'; btnNew.style.color = '#fff';
                    btnManual.style.background = 'transparent'; btnManual.style.color = '#fff';
                });
                btnNew.addEventListener('click', () => {
                    secManage.style.display = 'none'; secNew.style.display = 'flex'; secManual.style.display = 'none';
                    btnNew.style.background = '#a6e6db'; btnNew.style.color = '#0d2b52';
                    btnManage.style.background = 'transparent'; btnManage.style.color = '#fff';
                    btnManual.style.background = 'transparent'; btnManual.style.color = '#fff';
                });
                btnManual.addEventListener('click', () => {
                    secManage.style.display = 'none'; secNew.style.display = 'none'; secManual.style.display = 'flex';
                    btnManual.style.background = '#a6e6db'; btnManual.style.color = '#0d2b52';
                    btnNew.style.background = 'transparent'; btnNew.style.color = '#fff';
                    btnManage.style.background = 'transparent'; btnManage.style.color = '#fff';
                });

                // Yeni Etkinlik Oluşturma ve QR Üretme (SAYFA YENİLENME SORUNU ÇÖZÜLDÜ)
                document.getElementById('newEventForm').addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const title = document.getElementById('evTitle').value;
                    const yer = document.getElementById('evYer').value;
                    const tarihStr = document.getElementById('evTarih').value;

                    const res = await fetch('/api/create-event', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ etkinlik_adi: title, yer, kontenjan: 100, tarih: new Date(tarihStr) })
                    });
                    const r = await res.json();
                    alert(r.message);
                    
                    if (r.success) {
                        eventId = r.etkinlik_id;
                        refreshQRCode('liveAdminQr', eventId);
                        
                        // Eski sayacı temizle
                        if (window.qrInterval) clearInterval(window.qrInterval);
                        window.qrInterval = setInterval(() => refreshQRCode('liveAdminQr', eventId), 10000); 
                        
                        // Listelere yeni etkinliği sayfayı yenilemeden ekle
                        const yeniSecenek = `<option value="${eventId}">${title} (${yer})</option>`;
                        document.getElementById('adminEventSelect').insertAdjacentHTML('afterbegin', yeniSecenek);
                        document.getElementById('manualEventSelect').insertAdjacentHTML('afterbegin', yeniSecenek);
                        
                        // Sadece formu temizle, QR kod ekranda kalsın
                        document.getElementById('newEventForm').reset();
                    }
                });

                // Etkinlik Silme
                document.getElementById('deleteEventBtn').addEventListener('click', async () => {
                    const selectedEvId = document.getElementById('adminEventSelect').value;
                    if (confirm("Bu etkinliği silmek istediğinize emin misiniz?")) {
                        const res = await fetch(`/api/delete-event?eventId=${selectedEvId}`, { method: 'DELETE' });
                        const r = await res.json();
                        alert(r.message);
                        if (r.success) loadAdminDashboard();
                    }
                });

                // Katılanları Gör ve CSV İndir
                document.getElementById('loadAttListBtn').addEventListener('click', async () => {
                    const selectedEvId = document.getElementById('adminEventSelect').value;
                    const container = document.getElementById('adminAttendanceContainer');
                    const res = await fetch(`/api/get-attendance?eventId=${selectedEvId}`);
                    const result = await res.json();

                    if (result.success) {
                        let rows = result.data.map(item => `
                            <tr>
                                <td style="padding: 0.4rem; border-bottom: 1px solid rgba(255,255,255,0.1);">${item.ogrenci_no}</td>
                                <td style="padding: 0.4rem; border-bottom: 1px solid rgba(255,255,255,0.1);">${item.ogrenci_ad_soyad}</td>
                                <td style="padding: 0.4rem; border-bottom: 1px solid rgba(255,255,255,0.1);">${item.bolum}</td>
                                <td style="padding: 0.4rem; border-bottom: 1px solid rgba(255,255,255,0.1);">${new Date(item.katilim_tarihi).toLocaleTimeString('tr-TR')}</td>
                            </tr>
                        `).join('');

                        container.innerHTML = `
                            <div style="display: flex; justify-content: space-between; align-items: center; margin: 1rem 0 0.5rem 0;">
                                <span style="font-size:0.9rem; color:#a6e6db;">Katılanlar (${result.data.length} Öğrenci)</span>
                                <button id="adminCsvBtn" style="padding: 0.3rem 0.7rem; background: #a6e6db; color: #0d2b52; border: none; border-radius: 0.3rem; font-weight: bold; cursor: pointer;">CSV İndir</button>
                            </div>
                            <div style="max-height: 180px; overflow-y: auto;">
                                <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.85rem;">
                                    <thead><tr style="color:#a6e6db; border-bottom:1px solid rgba(255,255,255,0.2);"><th style="padding:0.4rem;">No</th><th style="padding:0.4rem;">Ad Soyad</th><th style="padding:0.4rem;">Bölüm</th><th style="padding:0.4rem;">Saat</th></tr></thead>
                                    <tbody>${rows || '<tr><td colspan="4" style="padding:0.5rem; text-align:center;">Kayıt yok.</td></tr>'}</tbody>
                                </table>
                            </div>
                        `;

                        document.getElementById('adminCsvBtn').addEventListener('click', () => {
                            let csvContent = "\uFEFFÖğrenci No,Ad Soyad,Bölüm,Katılım Tarihi\n";
                            result.data.forEach(item => {
                                csvContent += `"${item.ogrenci_no}","${item.ogrenci_ad_soyad}","${item.bolum}","${item.katilim_tarihi}"\n`;
                            });
                            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `${selectedEvId}_yoklama.csv`;
                            a.click();
                        });
                    }
                });

                // Manuel Öğrenci Ekle ("Listeye Ekle")
                document.getElementById('manualAddForm').addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const manualEvId = document.getElementById('manualEventSelect').value;
                    const res = await fetch('/api/manual-add-attendance', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            etkinlik_id: manualEvId,
                            ogrenci_no: document.getElementById('manNo').value,
                            ogrenci_ad_soyad: document.getElementById('manName').value,
                            bolum: document.getElementById('manBolum').value
                        })
                    });
                    const r = await res.json();
                    alert(r.message);
                    if (r.success) document.getElementById('manualAddForm').reset();
                });

                // Duyuru Ekleme
                document.getElementById('announcementForm').addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const res = await fetch('/api/create-announcement', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            baslik: document.getElementById('annTitle').value,
                            icerik: document.getElementById('annContent').value
                        })
                    });
                    const r = await res.json();
                    alert(r.message);
                    if (r.success) {
                        loadAdminDashboard();
                        setupHomepageAnnouncements();
                    }
                });

            } catch (err) {
                console.error("Admin panel yüklenemedi:", err);
            }
        }

        // --- GLOBAL DÜZENLEME VE SİLME FONKSİYONLARI ---
        window.deleteAnnouncement = async function(id) {
            if (confirm("Bu duyuruyu silmek istediğinize emin misiniz?")) {
                const res = await fetch(`/api/delete-announcement?id=${id}`, { method: 'DELETE' });
                const r = await res.json();
                alert(r.message);
                if (r.success) { loadAdminDashboard(); setupHomepageAnnouncements(); }
            }
        };

        window.editAnnouncement = async function(id, currentTitle, currentContent) {
            const newTitle = prompt("Yeni Duyuru Başlığı:", currentTitle);
            if (!newTitle) return;
            const newContent = prompt("Yeni Duyuru İçeriği:", currentContent);
            if (!newContent) return;

            const res = await fetch('/api/update-announcement', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: id, baslik: newTitle, icerik: newContent })
            });
            const r = await res.json();
            alert(r.message);
            if (r.success) { loadAdminDashboard(); setupHomepageAnnouncements(); }
        };

        window.editEvent = async function() {
            const selectedEvId = document.getElementById('adminEventSelect').value;
            const newTitle = prompt("Etkinlik için yeni bir isim girin:");
            if (!newTitle) return;
            const newYer = prompt("Etkinlik için yeni bir yer girin:");
            if (!newYer) return;

            const res = await fetch('/api/update-event', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ etkinlik_id: selectedEvId, etkinlik_adi: newTitle, yer: newYer })
            });
            const r = await res.json();
            alert(r.message);
            if (r.success) loadAdminDashboard();
        };

        // --- YÖNETİCİ GİRİŞ VE ÇIKIŞ KONTROLLERİ ---
        const loginBtn = document.getElementById('loginBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const authDialog = document.getElementById('auth');
        const aForm = document.getElementById('aForm');
        const navAdmin = document.getElementById('navAdmin');
        const adminSection = document.getElementById('admin');
        const aX = document.getElementById('aX'); 
        const whoSpan = document.getElementById('who');

        if (loginBtn && authDialog) loginBtn.addEventListener('click', () => authDialog.showModal());
        if (aX) aX.addEventListener('click', () => authDialog.close());

        if (aForm) {
            aForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const no = document.getElementById('aNo').value;
                const pw = document.getElementById('aPw').value;

                if (no === 'admin' && pw === '123456') { 
                    authDialog.close(); 
                    navAdmin.hidden = false; 
                    adminSection.hidden = false; 
                    loginBtn.hidden = true; 
                    logoutBtn.hidden = false; 
                    whoSpan.innerText = "Yönetici";
                    window.location.href = "#admin";
                    loadAdminDashboard();
                } else {
                    alert("Hatalı numara veya şifre!");
                }
            });
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                navAdmin.hidden = true;
                adminSection.hidden = true;
                loginBtn.hidden = false;
                logoutBtn.hidden = true;
                whoSpan.innerText = "";
                window.location.href = "#top";
                alert("Çıkış yapıldı.");
            });
        }
    }

    // --- 3B SAHNE (ARKAPLAN ANİMASYONU) ---
    const canvasGL = document.querySelector('#gl');
    if (canvasGL && typeof THREE !== 'undefined') {
        const T = THREE, R = new T.WebGLRenderer({ canvas: canvasGL, antialias: true, alpha: true }), S = new T.Scene(), C = new T.PerspectiveCamera(45, 1, .1, 100);
        C.position.z = 9; R.setPixelRatio(Math.min(devicePixelRatio, 2));
        const N = 900, pos = new Float32Array(N * 3), col = new Float32Array(N * 3), pal = [[.17, .69, .83], [.17, .23, .55], [.88, .23, .23]];
        for (let i = 0; i < N; i++) { pos.set([(Math.random() - .5) * 26, (Math.random() - .5) * 40, (Math.random() - .5) * 12 - 2], i * 3); col.set(pal[i % 3], i * 3) }
        const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(pos, 3)); g.setAttribute('color', new T.BufferAttribute(col, 3));
        const pts = new T.Points(g, new T.PointsMaterial({ size: .05, vertexColors: true, transparent: true, opacity: .7, depthWrite: false })); S.add(pts);
        let logo, mx = 0, my = 0, sy = 0; const calm = matchMedia('(prefers-reduced-motion:reduce)').matches;
        new T.TextureLoader().load('logo.png', tex => {
            const H = 5.2, W = H * tex.image.width / tex.image.height; logo = new T.Group();
            for (let i = 0; i < 16; i++) { const k = .3 + .7 * i / 15; logo.add(Object.assign(new T.Mesh(new T.PlaneGeometry(W, H), new T.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: .08, side: T.DoubleSide, color: new T.Color(k, k, k) })), { position: new T.Vector3(0, 0, (i - 15) * .035) })) }
            S.add(logo)
        });
        const fit = () => { R.setSize(innerWidth, innerHeight); C.aspect = innerWidth / innerHeight; C.updateProjectionMatrix() }; window.addEventListener('resize', fit); fit();
        window.addEventListener('pointermove', e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5 }); window.addEventListener('scroll', () => sy = scrollY, { passive: true });
        (function loop() {
            requestAnimationFrame(loop); const w = innerWidth > 760;
            if (logo) { if (!calm) logo.rotation.y += .012; logo.rotation.x += (my * .4 - logo.rotation.x) * .05; logo.position.x = w ? 2.6 : 0; logo.position.y = -.2 + sy / innerHeight * 7; logo.position.z = w ? 0 : -2.5 }
            pts.rotation.y += calm ? 0 : .0007; pts.position.y = sy / innerHeight * 2; C.position.x += (mx * 1.2 - C.position.x) * .03; R.render(S, C)
        })();
    }
});
