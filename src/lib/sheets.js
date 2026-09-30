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
 * URUNLER sekmesinden yalnızca yayında ve aktif olan ürünleri çeker (Sayaç ve listeler için)
 */
export async function getProducts() {
  const data = await fetchSheetData('URUNLER');
  // Master kuralı: Yayında = EVET ve Durum = AKTİF olanlar (Bu filtre sayaçları 120 yapar)
  return data.filter(item => 
    (item.Yayında === 'EVET' || item.Yayında === 'EVET ') && 
    (item.Durum === 'AKTİF' || item.Durum === 'AKTİF ')
  );
}

/**
 * MARKALAR sekmesinden marka verilerini çeker
 */
export async function getBrands() {
  const data = await fetchSheetData('MARKALAR');
  return data.filter(item => item.Yayında === 'EVET');
}

/**
 * KATEGORILER sekmesinden kategori verilerini çeker
 */
export async function getCategories() {
  const data = await fetchSheetData('KATEGORILER');
  return data.filter(item => item.Yayında === 'EVET');
}
