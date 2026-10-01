const SHEET_ID = '12wF2Is8OiESGgZ-Xq5qJMaZqxKelOCrnRjoj0zCqKlI';

async function fetchSheetData(tabName) {
  try {
    // CSV yerine %100 güvenli JSON API kullanıyoruz. Virgüller ve satır atlamaları artık sistemi bozamaz.
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&headers=1&sheet=${encodeURIComponent(tabName)}`;
    const response = await fetch(url);
    if (!response.ok) return [];
    
    const text = await response.text();
    // Google'ın JSON formatını ayrıştırıyoruz
    const match = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]+)\);/);
    if (!match) return [];
    
    const json = JSON.parse(match[1]);
    if (!json.table || !json.table.cols || !json.table.rows) return [];
    
    // Sütun başlıklarını temizliyoruz (Kayıt ID -> kayitid)
    const headers = json.table.cols.map(c => {
      if (!c || !c.label) return '';
      return c.label.toLowerCase()
        .replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g')
        .replace(/ö/g, 'o').replace(/ç/g, 'c').replace(/ü/g, 'u')
        .replace(/[^a-z0-9]/g, '');
    });
    
    // Satırları eşleştiriyoruz
    return json.table.rows.map(r => {
      const rowData = {};
      if (r && r.c) {
        r.c.forEach((cell, i) => {
          const h = headers[i];
          if (h) {
            // Hücrede formatlı veri varsa onu, yoksa düz veriyi al
            let val = cell ? (cell.f !== undefined && cell.f !== null ? cell.f : cell.v) : '';
            rowData[h] = val !== null && val !== undefined ? String(val).trim() : '';
          }
        });
      }
      return rowData;
    });
  } catch (error) {
    console.error('Tablo okuma hatası:', error);
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
    .filter(c => (c.yayinda || '').toUpperCase().includes('EVET'))
    .sort((a, b) => Number(a.sira || 99) - Number(b.sira || 99));
}

// Yalnızca Yayında=EVET ve Durum=AKTİF olan ürünleri getir
export async function getProducts() {
  const data = await fetchSheetData('URUNLER');
  return data.filter(item => {
    const yayinda = (item.yayinda || '').toUpperCase();
    const durum = (item.durum || '').toUpperCase();
    return yayinda.includes('EVET') && (durum.includes('AKTIF') || durum.includes('AKTİF'));
  }).sort((a, b) => Number(a.sira || 99) - Number(b.sira || 99));
}

export async function getMenu() {
  const [pages, texts] = await Promise.all([getPages(), getTexts()]);
  if (!pages || pages.length === 0) return [];

  const textMap = {};
  (texts || []).forEach(t => {
    if (t.anahtar) textMap[t.anahtar.toLowerCase()] = t;
  });

  return pages
    .filter(p => (p.yayinda || '').toUpperCase().includes('EVET') && (p.menude || '').toUpperCase().includes('EVET'))
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
  return logoRow ? logoRow.deger : '';
}
