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
          const activeProducts = results.data.filter((item) => {
            const isPublished = item['Yayında'] && item['Yayında'].trim().toUpperCase() === 'EVET';
            const isActive = item['Durum'] && item['Durum'].trim().toUpperCase() === 'AKTİF';
            return isPublished && isActive;
          });
          resolve(activeProducts);
        },
        error: (error) => reject(error),
      });
    });
  } catch (err) {
    console.error('TP_MASTER verisi çekilirken hata oluştu:', err);
    return [];
  }
}
