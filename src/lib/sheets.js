const SHEET_ID = '12wF2Is8OiESGgZ-Xq5qJMaZqxKelOCrnRjoj0zCqKlI';

// Tamamen yerel, dış kütüphanesiz %100 güvenli CSV Ayrıştırıcı
function parseCSV(csvText) {
  if (!csvText) return [];
  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) return [];

  function parseLine(line) {
    const result = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (c === ',' && !inQuotes) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += c;
      }
    }
    result.push(cur.trim());
    return result;
  }

  const headers = parseLine(lines[0]).map(h => {
    return h.toLowerCase()
      .replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g')
      .replace(/ö/g, 'o').replace(/ç/g, 'c').replace(/ü/g, 'u')
      .replace(/[^a-z0-9]/g, '');
  });

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i]);
    const row = {};
    let hasValue = false;
    headers.forEach((h, idx) => {
      if (h) {
        const val = values[idx] !== undefined ? values[idx] : '';
        row[h] = val;
        if (val) hasValue = true;
      }
    });
    if (hasValue) rows.push(row);
  }
  return rows;
}

async function fetchSheetData(tabName) {
  const urls = [
    `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tabName)}`,
    `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&sheet=${encodeURIComponent(tabName)}`
  ];

  for (const url of urls) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        const text = await response.text();
        if (text && !text.includes('<html') && !text.includes('google.com/accounts')) {
          const parsed = parseCSV(text);
          if (parsed && parsed.length > 0) return parsed;
        }
      }
    } catch (e) {
      // Hata durumunda diğer URL denenir
    }
  }
  return [];
}

export const getPages = () => fetchSheetData('SAYFALAR');
export const getTexts = () => fetchSheetData('METINLER');
export const getBrands = () => fetchSheetData('MARKALAR');
export const getSettings = () => fetchSheetData('AYARLAR');
export const getDocuments = () => fetchSheetData('BELGELER');

export async function getCategories() {
  const data = await fetchSheetData('KATEGORILER');
  return data
    .filter(c => {
      const y = (c.yayinda || '').toUpperCase();
      return y.includes('EVET') || y === 'TRUE' || y === '1' || !y;
    })
    .sort((a, b) => Number(a.sira || 99) - Number(b.sira || 99));
}

export async function getProducts() {
  const data = await fetchSheetData('URUNLER');
  return data.filter(item => {
    const yayinda = (item.yayinda || '').toUpperCase();
    const durum = (item.durum || '').toUpperCase();
    const isYayinda = yayinda.includes('EVET') || yayinda === 'TRUE' || yayinda === '1';
    const isAktif = durum.includes('AKT') || durum === 'TRUE' || durum === '1' || !durum;
    return isYayinda && isAktif;
  }).sort((a, b) => Number(a.sira || 99) - Number(b.sira || 99));
}

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
      return yayinda.includes('EVET') && menude.includes('EVET');
    })
    .map(p => {
      const titleKey = `${(p.kod || '').toLowerCase()}.title`;
      const textRow = textMap[titleKey] || {};

      return {
        ...p,
        adtr: textRow.turkce || p.adtr || p.kod,
        aden: textRow.english || p.aden || p.kod,
        adme: textRow.crnogorski || p.adme || p.kod
      };
    })
    .sort((a, b) => Number(a.sira || 99) - Number(b.sira || 99));
}

export async function getLogoUrl() {
  const settings = await getSettings();
  const logoRow = (settings || []).find(s => (s.anahtar || '').toLowerCase() === 'logo');
  if (logoRow && logoRow.deger) return logoRow.deger;
  return '';
}
