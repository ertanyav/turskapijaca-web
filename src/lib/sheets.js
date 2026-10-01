import Papa from 'papaparse';

const SHEET_ID = '12wF2Is8OiESGgZ-Xq5qJMaZqxKelOCrnRjoj0zCqKlI';

async function fetchSheetData(tabName) {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tabName)}`;
    const response = await fetch(url);
    if (!response.ok) return [];
    
    const text = await response.text();
    if (text.includes('<html') || text.includes('google.com/accounts')) return []; 

    return new Promise((resolve) => {
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const normalized = results.data.map(row => {
            const cleanRow = {};
            for (let key in row) {
              if (key) {
                // Türkçe karakter ve boşluk temizleme
                const safeKey = key.toLowerCase()
                  .replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g')
                  .replace(/ö/g, 'o').replace(/ç/g, 'c').replace(/ü/g, 'u')
                  .replace(/[^a-z0-9]/g, '');
                cleanRow[safeKey] = row[key] ? String(row[key]).trim() : '';
              }
            }
            return cleanRow;
          });
          resolve(normalized);
        },
        error: () => resolve([])
      });
    });
  } catch (error) {
    return [];
  }
}

export const getPages = () => fetchSheetData('SAYFALAR');
export const getTexts = () => fetchSheetData('METINLER');
export const getBrands = () => fetchSheetData('MARKALAR');
export const getCategories = () => fetchSheetData('KATEGORILER');
export const getSettings = () => fetchSheetData('AYARLAR');
export const getDocuments = () => fetchSheetData('DOKUMANLAR');

// Tam Eşleşmeli Ürün Filtresi (Yayında = EVET ve Durum = AKTİF)
export async function getProducts() {
  const data = await fetchSheetData('URUNLER');
  return data.filter(item => {
    const yayinda = (item.yayinda || '').toUpperCase();
    const durum = (item.durum || '').toUpperCase();
    
    if (yayinda === 'HAYIR' || durum === 'PASIF' || durum === 'PASİF') return false;
    if (yayinda === 'EVET' || durum === 'AKTIF' || durum === 'AKTİF') return true;
    return yayinda !== 'HAYIR';
  });
}

// Tam Eşleşmeli Menü Filtresi
export async function getMenu() {
  const pages = await getPages();
  if (!pages || pages.length === 0) return [];
  
  return pages
    .filter(p => {
      const yayinda = (p.yayinda || '').toUpperCase();
      const menude = (p.menude || p.menudegoster || '').toUpperCase();
      if (yayinda === 'HAYIR' || menude === 'HAYIR') return false;
      return true;
    })
    .sort((a, b) => Number(a.sira || 99) - Number(b.sira || 99));
}
