import Papa from 'papaparse';

export const SHEET_ID = '1BrGhsTDd75PRcVcHzT2Q3Sqtwp6-snAZjjn-Z4fvfLU';

const PRODUCTS_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=URUNLER`;
const TEXTS_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=METINLER`;

export async function getProducts() {
  try {
    const response = await fetch(PRODUCTS_URL);
    if (!response.ok) throw new Error('Google Sheets URUNLER yanıt vermedi');
    const csvText = await response.text();

    // İzin veya Paylaşım Hatası Kontrolü
    if (csvText.trim().startsWith('<!DOCTYPE') || csvText.trim().startsWith('<html')) {
      console.error('❌ HATA: TP_MASTER paylaşım izni kapalı! Lütfen Google Sheets dosyasını "Bağlantıya sahip olan herkes" olarak ayarlayın.');
      return [];
    }

    return new Promise((resolve) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (!results.data || results.data.length === 0) {
            resolve([]);
            return;
          }

          // En az bir hücresi dolu olan tüm satırları ekrana getir
          const validRows = results.data.filter(row => {
            return Object.values(row).some(val => val && val.toString().trim() !== '');
          });

          resolve(validRows);
        },
        error: () => resolve([])
      });
    });
  } catch (err) {
    console.error('URUNLER çekilemedi:', err);
    return [];
  }
}

export async function getTexts() {
  try {
    const response = await fetch(TEXTS_URL);
    if (!response.ok) throw new Error('METINLER yanıt vermedi');
    const csvText = await response.text();

    if (csvText.trim().startsWith('<!DOCTYPE') || csvText.trim().startsWith('<html')) {
      return {};
    }

    return new Promise((resolve) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const dict = {};
          if (results.data && results.data.length > 0) {
            results.data.forEach((row) => {
              const keys = Object.keys(row);
              if (keys.length === 0) return;
              
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
        error: () => resolve({})
      });
    });
  } catch (err) {
    return {};
  }
}
