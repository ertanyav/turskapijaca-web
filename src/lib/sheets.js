import Papa from 'papaparse';

export const SHEET_ID = '1BrGhsTDd75PRcVcHzT2Q3Sqtwp6-snAZjjn-Z4fvfLU';

// Web'e Yayınlanmış Canlı CSV Bağlantıları
const PRODUCTS_CSV = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSgtpYzushPu45KC5ztC4xvXS6AwRFSUEEWaDOZ3klcaxaUSFBxS0JMvUzhEbYO-Aok-lz7re6nr_Hg/pub?gid=300101&single=true&output=csv';
const TEXTS_CSV = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=METINLER`;
const CATEGORIES_CSV = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=KATEGORILER`;
const BRANDS_CSV = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=MARKALAR`;
const SETTINGS_CSV = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=AYARLAR`;

async function fetchCSV(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const text = await res.text();
    if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) return [];
    return new Promise((resolve) => {
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => resolve(results.data || []),
        error: () => resolve([])
      });
    });
  } catch (e) {
    return [];
  }
}

// 1. Ürünleri Getir
export async function getProducts() {
  const data = await fetchCSV(PRODUCTS_CSV);
  return data.filter(item => {
    const pub = item['Yayında'] ? item['Yayında'].trim().toUpperCase() === 'EVET' : true;
    const act = item['Durum'] ? item['Durum'].trim().toUpperCase() === 'AKTİF' : true;
    return pub && act;
  });
}

// 2. Metinleri Getir (Çoklu Dil)
export async function getTexts() {
  const data = await fetchCSV(TEXTS_CSV);
  const dict = {};
  data.forEach(row => {
    const keys = Object.keys(row);
    if (keys.length === 0) return;
    const kCol = keys.find(k => ['key', 'anahtar', 'kod'].includes(k.toLowerCase())) || keys[0];
    const keyVal = row[kCol] ? row[kCol].trim() : null;
    if (keyVal) {
      dict[keyVal] = {
        tr: row['TR'] || row['Türkçe'] || '',
        en: row['EN'] || row['English'] || '',
        me: row['ME'] || row['Crnogorski'] || ''
      };
    }
  });
  return dict;
}

// 3. Kategorileri Getir
export async function getCategories() {
  return await fetchCSV(CATEGORIES_CSV);
}

// 4. Markaları Getir
export async function getBrands() {
  return await fetchCSV(BRANDS_CSV);
}

// 5. Ayarları Getir
export async function getSettings() {
  const data = await fetchCSV(SETTINGS_CSV);
  const settings = {};
  data.forEach(row => {
    const keys = Object.keys(row);
    if (keys.length >= 2) {
      settings[row[keys[0]]] = row[keys[1]];
    }
  });
  return settings;
}
