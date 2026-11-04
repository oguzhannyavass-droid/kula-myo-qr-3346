const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const SECRET_KEY = process.env.SECRET_KEY || "kula-myo-qr-super-gizli-anahtar";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const WINDOW_STEP = 60000; // 60 saniye

function generateTimeToken(eventId, timeWindow) {
    const data = `${eventId}-${timeWindow}-${SECRET_KEY}`;
    return crypto.createHash('sha256').update(data).digest('hex');
}

// İki koordinat (enlem, boylam) arasındaki mesafeyi metre cinsinden hesaplayan fonksiyon
function getDistanceInMetres(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Dünya yarıçapı (metre)
    const p1 = lat1 * Math.PI/180;
    const p2 = lat2 * Math.PI/180;
    const deltaP = (lat2-lat1) * Math.PI/180;
    const deltaLon = (lon2-lon1) * Math.PI/180;
    const a = Math.sin(deltaP/2) * Math.sin(deltaP/2) +
              Math.cos(p1) * Math.cos(p2) *
              Math.sin(deltaLon/2) * Math.sin(deltaLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// 1. QR Token Üretme
app.get('/api/get-qr-token', (req, res) => {
    const eventId = req.query.eventId || "etkinlik_1";
    const currentWindow = Math.floor(Date.now() / WINDOW_STEP);
    const token = generateTimeToken(eventId, currentWindow);
    res.json({ token, eventId });
});

// 2. Öğrenci Kayıt Olma
app.post('/api/register', async (req, res) => {
    const { ogrenci_no, ogrenci_ad_soyad, bolum, sifre } = req.body;

    if (!ogrenci_no || !ogrenci_ad_soyad || !bolum || !sifre) {
        return res.status(400).json({ success: false, message: "Lütfen tüm alanları doldurun." });
    }

    const { error } = await supabase
        .from('ogrenciler')
        .insert([{ ogrenci_no, ogrenci_ad_soyad, bolum, sifre }]);

    if (error) {
        if (error.code === '23505') {
            return res.status(400).json({ success: false, message: "Bu öğrenci numarası zaten sistemde kayıtlı!" });
        }
        return res.status(500).json({ success: false, message: "Kayıt hatası: " + error.message });
    }

    res.json({ success: true, message: "Kayıt başarıyla oluşturuldu! Şimdi giriş yapabilirsiniz." });
});

// 3. Öğrenci Giriş ve Yoklama Katılımı (Konum Kontrollü)
app.post('/api/login-and-attend', async (req, res) => {
    const { ogrenci_no, sifre, eventId, submittedToken, ogr_enlem, ogr_boylam } = req.body;
    
    if (!ogrenci_no || !sifre || !eventId || !submittedToken || !ogr_enlem || !ogr_boylam) {
        return res.status(400).json({ success: false, message: "Lütfen tüm alanları doldurun ve KONUM izni verin!" });
    }

    const currentWindow = Math.floor(Date.now() / WINDOW_STEP);
    const validTokenNow = generateTimeToken(eventId, currentWindow);
    const validTokenPrev1 = generateTimeToken(eventId, currentWindow - 1);
    const validTokenPrev2 = generateTimeToken(eventId, currentWindow - 2);

    if (submittedToken !== validTokenNow && submittedToken !== validTokenPrev1 && submittedToken !== validTokenPrev2) {
        return res.status(400).json({ success: false, message: "Süresi dolmuş veya geçersiz QR kod!" });
    }

    // Etkinliğin Konumunu Çek
    const { data: etkinlikData } = await supabase.from('etkinlikler').select('enlem, boylam').eq('etkinlik_id', eventId).single();
    if (!etkinlikData || !etkinlikData.enlem || !etkinlikData.boylam) {
         return res.status(400).json({ success: false, message: "Etkinlik konumu bulunamadı." });
    }

    // Mesafe Hesapla (100 Metre Sınırı)
    const distance = getDistanceInMetres(etkinlikData.enlem, etkinlikData.boylam, ogr_enlem, ogr_boylam);
    if (distance > 100) {
         return res.status(400).json({ success: false, message: `Etkinlik alanından çok uzaksınız! (Mesafe: ${Math.round(distance)} metre)` });
    }

    const { data: ogrenci, error: ogrenciError } = await supabase
        .from('ogrenciler')
        .select('*')
        .eq('ogrenci_no', ogrenci_no)
        .eq('sifre', sifre)
        .single();

    if (ogrenciError || !ogrenci) {
        return res.status(400).json({ success: false, message: "Hatalı öğrenci numarası veya şifre!" });
    }

    const { error: yoklamaError } = await supabase
        .from('yoklamalar')
        .insert([{ 
            ogrenci_ad_soyad: ogrenci.ogrenci_ad_soyad, 
            ogrenci_no: ogrenci.ogrenci_no, 
            bolum: ogrenci.bolum, 
            etkinlik_id: eventId 
        }]);

    if (yoklamaError) {
        return res.status(500).json({ success: false, message: "Yoklama kaydedilemedi." });
    }

    res.json({ success: true, message: `Harika ${ogrenci.ogrenci_ad_soyad}, yoklamanız alındı!` });
});

// 4. Etkinlik Oluşturma (Yönetici - Konum Kayıtlı)
app.post('/api/create-event', async (req, res) => {
    const { etkinlik_adi, yer, kontenjan, tarih, enlem, boylam } = req.body;
    const etkinlik_id = etkinlik_adi.replace(/\s+/g, '-').toLowerCase();

    const { error } = await supabase
        .from('etkinlikler')
        .insert([{ etkinlik_id, etkinlik_adi, yer, kontenjan, tarih, enlem, boylam }]);

    if (error) {
        return res.status(400).json({ success: false, message: "Etkinlik oluşturulamadı: " + error.message });
    }

    res.json({ success: true, message: "Etkinlik başarıyla oluşturuldu!", etkinlik_id });
});

// 5. Etkinlikleri Listeleme
app.get('/api/get-events', async (req, res) => {
    const { data, error } = await supabase.from('etkinlikler').select('*').order('created_at', { ascending: false });
    if (error) return res.status(500).json({ success: false, message: error.message });
    res.json({ success: true, data });
});

// 6. Duyuruları Listeleme
app.get('/api/get-announcements', async (req, res) => {
    const { data, error } = await supabase.from('duyurular').select('*').order('created_at', { ascending: false });
    if (error) return res.status(500).json({ success: false, message: error.message });
    res.json({ success: true, data });
});

// 7. Duyuru Ekleme (Yönetici)
app.post('/api/create-announcement', async (req, res) => {
    const { baslik, icerik } = req.body;
    const { error } = await supabase.from('duyurular').insert([{ baslik, icerik }]);
    if (error) return res.status(400).json({ success: false, message: error.message });
    res.json({ success: true, message: "Duyuru yayınlandı!" });
});

// 8. Katılım Listesini Getir
app.get('/api/get-attendance', async (req, res) => {
    const eventId = req.query.eventId;
    let query = supabase.from('yoklamalar').select('*');
    if (eventId) query = query.eq('etkinlik_id', eventId);

    const { data, error } = await query.order('katilim_tarihi', { ascending: false });
    if (error) return res.status(500).json({ success: false, message: error.message });
    res.json({ success: true, data });
});

// 9. Öğrenci Profil ve Katılım Geçmişi
app.get('/api/student-profile', async (req, res) => {
    const { ogrenci_no } = req.query;
    const { data: student, error: sErr } = await supabase.from('ogrenciler').select('*').eq('ogrenci_no', ogrenci_no).single();
    const { data: history, error: hErr } = await supabase.from('yoklamalar').select('*').eq('ogrenci_no', ogrenci_no).order('katilim_tarihi', { ascending: false });
    if (sErr) return res.status(400).json({ success: false, message: "Öğrenci bulunamadı." });
    res.json({ success: true, student, history });
});

// 10. Öğrenci Profil Bilgilerini Güncelleme
app.post('/api/update-profile', async (req, res) => {
    const { ogrenci_no, ogrenci_ad_soyad, bolum, sifre } = req.body;
    const { error } = await supabase.from('ogrenciler').update({ ogrenci_ad_soyad, bolum, sifre }).eq('ogrenci_no', ogrenci_no);
    if (error) return res.status(500).json({ success: false, message: error.message });
    res.json({ success: true, message: "Profiliniz başarıyla güncellendi!" });
});

// 11. Etkinlik Silme (Yönetici)
app.delete('/api/delete-event', async (req, res) => {
    const { eventId } = req.query;
    const { error } = await supabase.from('etkinlikler').delete().eq('etkinlik_id', eventId);
    if (error) return res.status(500).json({ success: false, message: error.message });
    res.json({ success: true, message: "Etkinlik silindi." });
});

// 12. Duyuru Silme (Yönetici)
app.delete('/api/delete-announcement', async (req, res) => {
    const { id } = req.query;
    const { error } = await supabase.from('duyurular').delete().eq('id', id);
    if (error) return res.status(500).json({ success: false, message: error.message });
    res.json({ success: true, message: "Duyuru silindi." });
});

// 13. Manuel Öğrenci Ekleme ("Listeye Ekle")
app.post('/api/manual-add-attendance', async (req, res) => {
    const { etkinlik_id, ogrenci_no, ogrenci_ad_soyad, bolum } = req.body;
    const { error } = await supabase.from('yoklamalar').insert([{ etkinlik_id, ogrenci_no, ogrenci_ad_soyad, bolum }]);
    if (error) return res.status(500).json({ success: false, message: error.message });
    res.json({ success: true, message: "Öğrenci listeye manuel olarak eklendi!" });
});

// 14. Etkinlik Düzenleme (Yönetici)
app.post('/api/update-event', async (req, res) => {
    const { etkinlik_id, etkinlik_adi, yer, kontenjan, tarih } = req.body;
    const { error } = await supabase
        .from('etkinlikler')
        .update({ etkinlik_adi, yer, kontenjan, tarih })
        .eq('etkinlik_id', etkinlik_id);
    
    if (error) return res.status(400).json({ success: false, message: error.message });
    res.json({ success: true, message: "Etkinlik başarıyla güncellendi!" });
});

// 15. Duyuru Düzenleme (Yönetici)
app.post('/api/update-announcement', async (req, res) => {
    const { id, baslik, icerik } = req.body;
    const { error } = await supabase
        .from('duyurular')
        .update({ baslik, icerik })
        .eq('id', id);
        
    if (error) return res.status(400).json({ success: false, message: error.message });
    res.json({ success: true, message: "Duyuru başarıyla güncellendi!" });
});

module.exports = app;
