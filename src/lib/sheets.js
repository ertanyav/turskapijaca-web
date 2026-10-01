import Papa from 'papaparse';

const SHEET_ID = '12wF2Is8OiESGgZ-Xq5qJMaZqxKelOCrnRjoj0zCqKlI';

async function fetchSheetData(tabName) {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tabName)}`;
    const response = await fetch(url);
    if (!response.ok) return [];
    
    const text = await response.text();
    // Eğer Google erişim izni hatası dönerse boş dizi ver
    if (text.includes('<html')) return []; 

    return new Promise((resolve) => {
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          // Başlıkları (Sütun isimlerini) güvenli hale getir
          const normalized = results.data.map(row => {
            const cleanRow = {};
            for (let key in row) {
              if (key) {
                // Örn: "Ad TR" -> "adtr", "Menüde Göster" -> "menudegoster"
                const safeKey = key.toLowerCase()
                  .replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g')
                  .replace(/ö/g, 'o').replace(/ç/g, 'c').replace(/ü/g, 'u')
                  .replace(/[^a-z0-9]/g, '');
                
                cleanRow[safeKey] = row[key] ? row[key].trim() : '';
              }
            }
            // Orijinal satırı da saklayalım (ne olur ne olmaz)
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

// Tüm Fonksiyonları Dışa Aktarıyoruz
export const getPages = () => fetchSheetData('SAYFALAR');
export const getTexts = () => fetchSheetData('METINLER');
export const getProducts = () => fetchSheetData('URUNLER');
export const getBrands = () => fetchSheetData('MARKALAR');
export const getCategories = () => fetchSheetData('KATEGORILER');
export const getSettings = () => fetchSheetData('AYARLAR');
export const getDocuments = () => fetchSheetData('DOKUMANLAR');

// Özel Menü Çekici
export async function getMenu() {
  const pages = await getPages();
  if (!pages || pages.length === 0) return [];
  
  return pages
    .filter(p => {
      // Yayında sütunu varsa ve 'hayır' ise alma. (Boşsa veya evet ise al)
      const isYayinda = !p.yayinda || !/hayir|false|0/.test(p.yayinda);
      const isMenude = !p.menude || !/hayir|false|0/.test(p.menude);
      return isYayinda && isMenude;
    })
    .sort((a, b) => Number(a.sira || 99) - Number(b.sira || 99));
}
