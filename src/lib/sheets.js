import Papa from 'papaparse';

const SHEET_ID = '12wF2Is8OiESGgZ-Xq5qJMaZqxKelOCrnRjoj0zCqKlI';

async function fetchSheetData(tabName) {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tabName)}`;
    const response = await fetch(url);
    if (!response.ok) return [];
    
    const text = await response.text();
    if (text.includes('<html')) return []; 

    return new Promise((resolve) => {
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const normalized = results.data.map(row => {
            const cleanRow = {};
            for (let key in row) {
              if (key) {
                const safeKey = key.toLowerCase()
                  .replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g')
                  .replace(/ö/g, 'o').replace(/ç/g, 'c').replace(/ü/g, 'u')
                  .replace(/[^a-z0-9]/g, '');
                cleanRow[safeKey] = row[key] ? row[key].trim() : '';
              }
            }
            cleanRow._original = row;
            return cleanRow;
          });
          resolve(normalized);
        },
        error: () => resolve([])
      });
    });
  } catch (error) {
    console.error(`Tablo Hatası (${tabName}):`, error);
    return [];
  }
}

export const getPages = () => fetchSheetData('SAYFALAR');
export const getTexts = () => fetchSheetData('METINLER');
export const getBrands = () => fetchSheetData('MARKALAR');
export const getCategories = async () => {
  const data = await fetchSheetData('KATEGORILER');
  return data.filter(item => {
    const yayin = (item.yayinda || '').toLowerCase();
    return yayin !== 'hayir' && yayin !== 'pasif' && yayin !== 'false' && yayin !== '0';
  });
};
export const getSettings = () => fetchSheetData('AYARLAR');
export const getDocuments = () => fetchSheetData('DOKUMANLAR');

// Pasif ürünleri filtreleyen akıllı motor
export async function getProducts() {
  const data = await fetchSheetData('URUNLER');
  return data.filter(item => {
    const yayin = (item.yayinda || '').toLowerCase();
    const durum = (item.durum || '').toLowerCase();
    if (yayin === 'hayir' || yayin === 'pasif' || yayin === 'false' || yayin === '0') return false;
    if (durum === 'pasif' || durum === 'hayir' || durum === 'false' || durum === '0') return false;
    return true;
  });
}

// Pasif sayfaları/menüleri filtreleyen motor
export async function getMenu() {
  const pages = await getPages();
  if (!pages || pages.length === 0) return [];
  
  return pages
    .filter(p => {
      const yayin = (p.yayinda || '').toLowerCase();
      const menude = (p.menude || '').toLowerCase();
      if (yayin === 'hayir' || yayin === 'pasif' || yayin === 'false' || yayin === '0') return false;
      if (menude === 'hayir' || menude === 'false' || menude === '0') return false;
      return true;
    })
    .sort((a, b) => Number(a.sira || 99) - Number(b.sira || 99));
}
