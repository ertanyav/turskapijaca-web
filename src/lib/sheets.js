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
export const getSettings = () => fetchSheetData('AYARLAR');
export const getDocuments = () => fetchSheetData('BELGELER');

export async function getCategories() {
  const data = await fetchSheetData('KATEGORILER');
  return data
    .filter(c => (c.yayinda || '').toUpperCase() === 'EVET')
    .sort((a, b) => Number(a.sira || 99) - Number(b.sira || 99));
}

// Sadece Yayında = EVET ve Durum = AKTİF ürünleri getirir
export async function getProducts() {
  const data = await fetchSheetData('URUNLER');
  return data.filter(item => {
    const yayinda = (item.yayinda || '').toUpperCase();
    const durum = (item.durum || '').toUpperCase();
    return yayinda === 'EVET' && (durum === 'AKTIF' || durum === 'AKTİF');
  }).sort((a, b) => Number(a.sira || 99) - Number(b.sira || 99));
}

// SAYFALAR ve METINLER sekmelerini birleştirip kusursuz menü üretir
export async function getMenu() {
  const [pages, texts] = await Promise.all([getPages(), getTexts()]);
  if (!pages || pages.length === 0) return [];
  
  const textMap = {};
  (texts || []).forEach(t => {
    if (t.anahtar) {
      textMap[t.anahtar.toLowerCase()] = t;
    }
  });

  return pages
    .filter(p => {
      const yayinda = (p.yayinda || '').toUpperCase();
      const menude = (p.menude || '').toUpperCase();
      return yayinda === 'EVET' && menude === 'EVET';
    })
    .map(p => {
      const titleKey = `${(p.kod || '').toLowerCase()}.title`;
      const textRow = textMap[titleKey] || {};
      
      return {
        ...p,
        adtr: textRow.turkce || p.kod,
        aden: textRow.english || p.kod,
        adme: textRow.crnogorski || p.kod
      };
    })
    .sort((a, b) => Number(a.sira || 99) - Number(b.sira || 99));
}

// AYARLAR sekmesindeki dikey Anahtar: logo değerini çeker
export async function getLogoUrl() {
  const settings = await getSettings();
  const logoRow = (settings || []).find(s => (s.anahtar || '').toLowerCase() === 'logo');
  return logoRow ? logoRow.deger : '';
}
