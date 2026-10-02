const SHEET_ID = '12wF2Is8OiESGgZ-Xq5qJMaZqxKelOCrnRjoj0zCqKlI';

// Sunucu içi önbellek: Aynı sekme kısa süre içinde tekrar tekrar okunmasın
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 dakika
const sheetCache = new Map();

function getCached(tabName) {
  const entry = sheetCache.get(tabName);
  if (!entry) return null;
  if (Date.now() - entry.time > CACHE_TTL_MS) {
    sheetCache.delete(tabName);
    return null;
  }
  return entry.data;
}

function setCached(tabName, data) {
  sheetCache.set(tabName, { data, time: Date.now() });
}

async function fetchSheetData(tabName) {
  const cached = getCached(tabName);
  if (cached) return cached;

  try {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&headers=1&sheet=${encodeURIComponent(tabName)}`;
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Sheets API hatası (${tabName}): HTTP ${response.status}`);
      return [];
    }

    const text = await response.text();
    const match = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]+)\);/);
    if (!match) {
      console.error(`Sheets yanıtı ayrıştırılamadı (${tabName})`);
      return [];
    }

    const json = JSON.parse(match[1]);
    if (!json.table || !json.table.cols || !json.table.rows) return [];

    const headers = json.table.cols.map(c => c && c.label ? c.label.toLowerCase().replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ö/g, 'o').replace(/ç/g, 'c').replace(/ü/g, 'u').replace(/[^a-z0-9]/g, '') : '');

    const rows = json.table.rows.map(r => {
      const rowData = {};
      if (r && r.c) {
        r.c.forEach((cell, i) => {
          if (headers[i]) {
            let val = cell ? (cell.f !== undefined && cell.f !== null ? cell.f : cell.v) : '';
            rowData[headers[i]] = val !== null && val !== undefined ? String(val).trim() : '';
          }
        });
      }
      return rowData;
    });

    setCached(tabName, rows);
    return rows;
  } catch (error) {
    console.error(`Sheets okuma hatası (${tabName}):`, error);
    return [];
  }
}

export const getPages = () => fetchSheetData('SAYFALAR');
export const getTexts = () => fetchSheetData('METINLER');
export const getSettings = () => fetchSheetData('AYARLAR');

export const getBrands = async () => (await fetchSheetData('MARKALAR')).filter(b => (b.yayinda || '').toUpperCase() === 'EVET').sort((a, b) => Number(a.sira || 99) - Number(b.sira || 99));
export const getDealers = async () => (await fetchSheetData('BAYILER')).filter(d => (d.yayinda || '').toUpperCase() === 'EVET').sort((a, b) => Number(a.sira || 99) - Number(b.sira || 99));
export const getDocuments = async () => (await fetchSheetData('BELGELER')).filter(d => (d.yayinda || '').toUpperCase() === 'EVET').sort((a, b) => Number(a.sira || 99) - Number(b.sira || 99));
export const getCategories = async () => (await fetchSheetData('KATEGORILER')).filter(c => (c.yayinda || '').toUpperCase().includes('EVET')).sort((a, b) => Number(a.sira || 99) - Number(b.sira || 99));

export async function getProducts() {
  const data = await fetchSheetData('URUNLER');
  return data.filter(item => {
    const yayinda = (item.yayinda || '').toUpperCase();
    const durum = (item.durum || '').toUpperCase();
    return yayinda.includes('EVET') && (durum.includes('AKTIF') || durum.includes('AKTİF') || !durum);
  }).sort((a, b) => Number(a.sira || 99) - Number(b.sira || 99));
}

export async function getMenu() {
  const [pages, texts] = await Promise.all([getPages(), getTexts()]);
  if (!pages) return [];

  const textMap = {};
  (texts || []).forEach(t => { if (t.anahtar) textMap[t.anahtar.toLowerCase()] = t; });

  const activePages = pages.filter(p => (p.yayinda || '').toUpperCase().includes('EVET') && (p.menude || '').toUpperCase().includes('EVET'));
  const parents = [], childrenMap = {};

  activePages.forEach(p => {
    const addr = p.adrestr || p.kod || '';
    const parts = addr.split('/').filter(Boolean);
    const titleKey = `${(p.kod || '').toLowerCase()}.title`;

    p.adtr = (textMap[titleKey]?.turkce) || p.adtr || p.kod;
    p.aden = (textMap[titleKey]?.english) || p.aden || p.kod;
    p.adme = (textMap[titleKey]?.crnogorski) || p.adme || p.kod;

    if (parts.length > 1) {
      const parentSlug = parts[0].toLowerCase();
      if (!childrenMap[parentSlug]) childrenMap[parentSlug] = [];
      childrenMap[parentSlug].push(p);
    } else {
      p.parentSlug = parts[0]?.toLowerCase() || (p.kod || '').toLowerCase();
      parents.push(p);
    }
  });

  return parents.sort((a, b) => Number(a.sira || 99) - Number(b.sira || 99)).map(parent => ({
    ...parent,
    children: (childrenMap[parent.parentSlug] || []).sort((a, b) => Number(a.sira || 99) - Number(b.sira || 99))
  }));
}

export async function getTextDictionary(lang = 'tr') {
  const texts = await getTexts();
  const dict = {};
  const langCol = lang === 'en' ? 'english' : lang === 'me' ? 'crnogorski' : 'turkce';
  (texts || []).forEach(t => { if (t.anahtar) dict[t.anahtar.toLowerCase()] = t[langCol] || t.turkce || ''; });
  return dict;
}

export async function getLogoUrl() {
  const settings = await getSettings();
  const logoRow = (settings || []).find(s => (s.anahtar || '').toLowerCase() === 'logo');
  return logoRow ? logoRow.deger : '';
}
