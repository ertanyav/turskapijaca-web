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
        complete: (results) => resolve(results.data || []),
        error: () => resolve([])
      });
    });
  } catch (error) {
    console.error(`Tablo okuma hatası (${tabName}):`, error);
    return [];
  }
}

// Sütun isimlerindeki Türkçe karakter veya kelime farklarını tolere eden yardımcı fonksiyon
function getValueByFlexibleKey(row, keyPattern) {
  if (!row) return '';
  const matchKey = Object.keys(row).find(k => keyPattern.test(k));
  return matchKey ? row[matchKey] : '';
}

export async function getPages() { return await fetchSheetData('SAYFALAR'); }
export async function getTexts() { return await fetchSheetData('METINLER'); }
export async function getDocuments() { return await fetchSheetData('DOKUMANLAR'); }
export async function getSettings() { return await fetchSheetData('AYARLAR'); }

export async function getProducts() {
  const data = await fetchSheetData('URUNLER');
  return data.filter(item => {
    const yayin = getValueByFlexibleKey(item, /yayın|yayin/i);
    const durum = getValueByFlexibleKey(item, /durum/i);
    return (!yayin || /evet/i.test(yayin)) && (!durum || /aktif/i.test(durum));
  });
}

export async function getBrands() {
  const data = await fetchSheetData('MARKALAR');
  return data.filter(item => {
    const yayin = getValueByFlexibleKey(item, /yayın|yayin/i);
    return !yayin || /evet/i.test(yayin);
  });
}

export async function getCategories() {
  const data = await fetchSheetData('KATEGORILER');
  return data.filter(item => {
    const yayin = getValueByFlexibleKey(item, /yayın|yayin/i);
    return !yayin || /evet/i.test(yayin);
  });
}

export async function getMenu() {
  const pages = await getPages();
  if (!pages || pages.length === 0) return [];
  
  return pages
    .filter(p => {
      const yayin = getValueByFlexibleKey(p, /yayın|yayin/i);
      const menude = getValueByFlexibleKey(p, /menü|menu/i);
      const isYayinda = !yayin || /evet|true|1/i.test(yayin.toString());
      const isMenude = !menude || /evet|true|1/i.test(menude.toString());
      return isYayinda && isMenude;
    })
    .sort((a, b) => {
      const siraA = Number(getValueByFlexibleKey(a, /sıra|sira/i) || 99);
      const siraB = Number(getValueByFlexibleKey(b, /sıra|sira/i) || 99);
      return siraA - siraB;
    });
}
