// Google Sheets Master Veri Okuyucu

// Master Google Sheets dosyanızın CSV yayın bağlantısı veya ID'si
const SHEET_CSV_URL = "BURAYA_GOOGLE_SHEETS_CSV_URL_ADRESINIZ_GELECEK"; 
// (Eğer projede halihazırda bir SHEET_ID veya URL tanımlıysa, kendi URL yapınızı koruyabilirsiniz)

// Yardımcı CSV parser fonksiyonu
async function fetchSheetData(tabName) {
  try {
    // Projenizde mevcut olan sheet çekme yönteminiz neyse onu kullanabilirsiniz.
    // Örnek standart fetch:
    const response = await fetch(`https://docs.google.com/spreadsheets/d/e/.../pub?output=csv&sheet=${tabName}`);
    if (!response.ok) return [];
    const csvText = await response.text();
    
    // Basit CSV satır/sütun çevirici
    const lines = csvText.split('\n').map(line => line.split(','));
    const headers = lines[0].map(h => h.trim().replace(/^"|"$/g, ''));
    
    return lines.slice(1).map(line => {
      const obj = {};
      headers.forEach((header, index) => {
        let val = line[index] ? line[index].trim() : '';
        val = val.replace(/^"|"$/g, ''); // tırnakları temizle
        obj[header] = val;
      });
      return obj;
    }).filter(row => Object.values(row).some(Boolean));
  } catch (err) {
    console.error(`Sheet okuma hatası (${tabName}):`, err);
    return [];
  }
}

// 1. Ürünler
export async function getProducts() {
  return await fetchSheetData('URUNLER');
}

// 2. Metinler
export async function getTexts() {
  const rows = await fetchSheetData('METINLER');
  const textsMap = {};
  rows.forEach(row => {
    const key = row['Anahtar'] || row['Key'];
    if (key) {
      textsMap[key] = {
        tr: row['TR'] || '',
        me: row['ME'] || '',
        en: row['EN'] || ''
      };
    }
  });
  return textsMap;
}

// 3. Markalar
export async function getBrands() {
  return await fetchSheetData('MARKALAR');
}

// 4. Sayfalar (Üst Menü İçin - Eksik Olan Fonksiyon)
export async function getPages() {
  return await fetchSheetData('SAYFALAR');
}
