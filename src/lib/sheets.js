import Papa from 'papaparse';

// Google Sheets'ten aldığınız canlı Web CSV bağlantısı:
const PRODUCTS_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSgtpYzushPu45KC5ztC4xvXS6AwRFSUEEWaDOZ3klcaxaUSFBxS0JMvUzhEbYO-Aok-lz7re6nr_Hg/pub?gid=300101&single=true&output=csv';

export const SHEET_ID = '1BrGhsTDd75PRcVcHzT2Q3Sqtwp6-snAZjjn-Z4fvfLU';
const TEXTS_CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=METINLER`;

export async function getProducts() {
  try {
    const response = await fetch(PRODUCTS_CSV_URL);
    if (!response.ok) throw new Error('URUNLER CSV çekilemedi');
    const csvText = await response.text();

    return new Promise((resolve) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (!results.data || results.data.length === 0) {
            resolve([]);
            return;
          }

          // Tablonuzdaki "Yayında = EVET" ve "Durum = AKTİF" olan ürünleri filtreler
          const activeProducts = results.data.filter((item) => {
            const isPublished = item['Yayında'] ? item['Yayında'].trim().toUpperCase() === 'EVET' : true;
            const isActive = item['Durum'] ? item['Durum'].trim().toUpperCase() === 'AKTİF' : true;
            return isPublished && isActive;
          });

          // Filtre sonucu ürün çıkarsa onları, çıkmazsa ham veriyi döndürür
          resolve(activeProducts.length > 0 ? activeProducts : results.data);
        },
        error: () => resolve([])
      });
    });
  } catch (err) {
    console.error('URUNLER veri çekme hatası:', err);
    return [];
  }
}

export async function getTexts() {
  try {
    const response = await fetch(TEXTS_CSV_URL);
    if (!response.ok) throw new Error('METINLER CSV çekilemedi');
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
              if (keys.length === 0) return;
              const keyCol = keys[0];
              const keyVal = row[keyCol] ? row[keyCol].trim() : null;

              if (keyVal) {
                dict[keyVal] = {
                  tr: row['TR'] || row['Türkçe'] || '',
                  en: row['EN'] || row['English'] || '',
                  me: row['ME'] || row['Crnogorski'] || ''
                };
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
