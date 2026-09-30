import Papa from 'papaparse';

export const SHEET_ID = '1BrGhsTDd75PRcVcHzT2Q3Sqtwp6-snAZjjn-Z4fvfLU';
const SHEET_NAME = 'URUNLER';

const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${SHEET_NAME}`;

export async function getProducts() {
  try {
    const response = await fetch(CSV_URL);
    if (!response.ok) throw new Error('Google Sheets yanıt vermedi');
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

          // Esnek Filtreleme: Sütun isimleri farklı yazılmış olsa bile yakalar
          const activeProducts = results.data.filter((item) => {
            const keys = Object.keys(item);
            
            const publishedKey = keys.find(k => k.trim().toLowerCase().includes('yayın') || k.trim().toLowerCase().includes('yayin'));
            const statusKey = keys.find(k => k.trim().toLowerCase().includes('durum') || k.trim().toLowerCase().includes('aktif'));

            const isPublished = publishedKey ? (item[publishedKey] && item[publishedKey].trim().toUpperCase() === 'EVET') : true;
            const isActive = statusKey ? (item[statusKey] && item[statusKey].trim().toUpperCase() === 'AKTİF') : true;

            return isPublished && isActive;
          });

          // Filtrelenmiş liste boş gelirse tablodaki tüm veriyi göster (Sayfa boş kalmasın)
          resolve(activeProducts.length > 0 ? activeProducts : results.data);
        },
        error: (error) => reject(error),
      });
    });
  } catch (err) {
    console.error('TP_MASTER verisi çekilirken hata oluştu:', err);
    return [];
  }
}
