import Papa from 'papaparse';

export const SHEET_ID = '1BrGhsTDd75PRcVcHzT2Q3Sqtwp6-snAZjjn-Z4fvfLU';

const PRODUCTS_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=URUNLER`;
const TEXTS_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=METINLER`;

// 1. Ürünleri Çeken Fonksiyon
export async function getProducts() {
  try {
    const response = await fetch(PRODUCTS_URL);
    if (!response.ok) throw new Error('Google Sheets URUNLER yanıt vermedi');
    const csvText = await response.text();

    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (!results.data || results.data.length === 0) {
            resolve([]);
            return;
          }

          // Esnek Filtreleme (Yayında & Aktif durumları için)
          const activeProducts = results.data.filter((item) => {
            const keys = Object.keys(item);
            const publishedKey = keys.find(k => k.trim().toLowerCase().includes('yayın') || k.trim().toLowerCase().includes('yayin'));
            const statusKey = keys.find(k => k.trim().toLowerCase().includes('durum') || k.trim().toLowerCase().includes('aktif'));

            const isPublished = publishedKey ? (item[publishedKey] && item[publishedKey].trim().toUpperCase() === 'EVET') : true;
            const isActive = statusKey ? (item[statusKey] && item[statusKey].trim().toUpperCase() === 'AKTİF') : true;

            return isPublished && isActive;
          });

          resolve(activeProducts.length > 0 ? activeProducts : results.data);
        },
        error: (error) => reject(error),
      });
    });
  } catch (err) {
    console.error('TP_MASTER URUNLER verisi çekilemedi:', err);
    return [];
  }
}

// 2. METİNLER Sekmesini Çeken Fonksiyon
export async function getTexts() {
  try {
    const response = await fetch(TEXTS_URL);
    if (!response.ok) throw new Error('Google Sheets METINLER yanıt vermedi');
    const csvText = await response.text();

    return new Promise((resolve) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const dict = {};
          if (results.data && results.data.length > 0) {
            results.data.forEach((row) => {
              const keys = Object.keys(row);
              // Key/Anahtar/Kod sütununu bul
              const keyCol = keys.find(k => ['key', 'anahtar', 'kod', 'id', 'metin_kodu'].includes(k.trim().toLowerCase())) || keys[0];
              const keyVal = row[keyCol] ? row[keyCol].trim() : null;

              if (keyVal) {
                dict[keyVal] = {};
                keys.forEach(col => {
                  const cLower = col.trim().toLowerCase();
                  if (cLower === 'tr' || cLower.includes('türkçe') || cLower.includes('turkce')) dict[keyVal]['tr'] = row[col];
                  else if (cLower === 'en' || cLower.includes('english') || cLower.includes('ingilizce')) dict[keyVal]['en'] = row[col];
                  else if (cLower === 'me' || cLower === 'cg' || cLower.includes('karadağ') || cLower.includes('sr') || cLower.includes('montenegro')) dict[keyVal]['me'] = row[col];
                });
              }
            });
          }
          resolve(dict);
        },
        error: () => resolve({}),
      });
    });
  } catch (err) {
    console.error('METINLER verisi çekilemedi:', err);
    return {};
  }
}
