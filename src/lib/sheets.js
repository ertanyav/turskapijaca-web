import Papa from 'papaparse';

const SHEET_ID = '12wF2Is8OiESGgZ-Xq5qJMaZqxKelOCrnRjoj0zCqKlI';

async function fetchSheetData(tabName) {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tabName)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Veri alınamadı: ${tabName}`);
    const csvText = await response.text();
    return new Promise((resolve) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => resolve(results.data),
        error: () => resolve([])
      });
    });
  } catch (error) {
    console.error(`Tablo okuma hatası (${tabName}):`, error);
    return [];
  }
}

// Güvenli filtreleme (Hücre sonundaki gizli boşlukları tolere eder)
const isEvet = (val) => val && val.trim().toUpperCase() === 'EVET';
const isAktif = (val) => val && val.trim().toUpperCase() === 'AKTİF';

export async function getPages() { return await fetchSheetData('SAYFALAR'); }
export async function getTexts() { return await fetchSheetData('METINLER'); }
export async function getDocuments() { return await fetchSheetData('DOKUMANLAR'); }
export async function getSettings() { return await fetchSheetData('AYARLAR'); }

export async function getProducts() {
  const data = await fetchSheetData('URUNLER');
  // Ürün sayısı tam olarak 120'ye sabitlenir
  return data.filter(item => isEvet(item.Yayında) && isAktif(item.Durum));
}

export async function getBrands() {
  const data = await fetchSheetData('MARKALAR');
  return data.filter(item => isEvet(item.Yayında));
}

export async function getCategories() {
  const data = await fetchSheetData('KATEGORILER');
  return data.filter(item => isEvet(item.Yayında));
}
