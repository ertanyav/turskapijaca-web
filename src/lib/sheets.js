import Papa from 'papaparse';

export const SHEET_ID = '12wF2Is8OiESGgZ-Xq5qJMaZqxKelOCrnRjoj0zCqKlI';

const PRODUCTS_CSV = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSgtpYzushPu45KC5ztC4xvXS6AwRFSUEEWaDOZ3klcaxaUSFBxS0JMvUzhEbYO-Aok-lz7re6nr_Hg/pub?gid=300101&single=true&output=csv';
const TEXTS_CSV = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=METINLER`;
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

export async function getProducts() {
  const data = await fetchCSV(PRODUCTS_CSV);
  return data.filter(item => {
    const pub = item['Yayında'] ? item['Yayında'].trim().toUpperCase() === 'EVET' : true;
    const act = item['Durum'] ? item['Durum'].trim().toUpperCase() === 'AKTİF' : true;
    return pub && act;
  });
}

export async function getTexts() {
  const data = await fetchCSV(TEXTS_CSV);
  const dict = {};
  data.forEach(row => {
    const keys = Object.keys(row);
    if (keys.length === 0) return;
    const kCol = keys.find(k => ['kod', 'key', 'anahtar'].includes(k.toLowerCase())) || keys[0];
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

export async function getBrands() {
  const data = await fetchCSV(BRANDS_CSV);
  return data.filter(item => {
    return item['Yayında'] ? item['Yayında'].trim().toUpperCase() === 'EVET' : true;
  });
}

export async function getSettings() {
  const data = await fetchCSV(SETTINGS_CSV);
  const settings = {};
  data.forEach(row => {
    const keys = Object.keys(row);
    if (keys.length >= 2 && row[keys[0]]) {
      settings[row[keys[0]].trim()] = row[keys[1]] ? row[keys[1]].trim() : '';
    }
  });
  return settings;
}
