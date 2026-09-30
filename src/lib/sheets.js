import Papa from 'papaparse';

// Asıl Master Dosyanız: TP_MASTER ID
const SHEET_ID = '12wF2Is8OiESGgZ-Xq5qJMaZqxKelOCrnRjoj0zCqKlI';

// Ortak Google Sheets CSV veri çekme ve parse etme yardımcısı
async function fetchSheetData(tabName) {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tabName)}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Google Sheets verisi alınamadı: ${tabName}`);
    }
    
    const csvText = await response.text();
    
    return new Promise((resolve) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => resolve(results.data),
        error: (err) => {
          console.error(`CSV Parse Hatası (${tabName}):`, err);
          resolve([]);
        }
      });
    });
  } catch (error) {
    console.error(`Sheets bağlantı hatası (${tabName}):`, error);
    return [];
  }
}

/**
 * SAYFALAR sekmesinden dinamik menü ve sayfa verilerini çeker
 */
export async function getPages() {
  return await fetchSheetData('SAYFALAR');
}

/**
 * METINLER sekmesinden site içi metinleri/çevirileri çeker
 */
export async function getTexts() {
  return await fetchSheetData('METINLER');
}

/**
 * DOKUMANLAR sekmesinden doküman verilerini çeker
 */
export async function getDocuments() {
  return await fetchSheetData('DOKUMANLAR');
}

/**
 * URUNLER sekmesinden ürün verilerini ve sayaçları çeker
 */
export async function getProducts() {
  return await fetchSheetData('URUNLER');
}

/**
 * MARKALAR sekmesinden marka verilerini çeker
 */
export async function getBrands() {
  return await fetchSheetData('MARKALAR');
}

/**
 * KATEGORILER sekmesinden kategori verilerini çeker
 */
export async function getCategories() {
  return await fetchSheetData('KATEGORILER');
}
