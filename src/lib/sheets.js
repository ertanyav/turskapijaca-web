import Papa from 'papaparse';

// TP_MASTER dosyasının kesin ID'si
const SHEET_ID = '12wF2Is8OiESGgZ-Xq5qJMaZqxKelOCrnRjoj0zCqKlI';

async function fetchSheetData(tabName) {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tabName)}`;
    const response = await fetch(url);
    const text = await response.text();

    return new Promise((resolve) => {
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
            const normalized = results.data.map(row => {
                const cleanRow = { ...row }; // Orijinal sütunları koru
                
                // Hata önleyici: "Ad TR " gibi boşluklu başlıkları "adtr" şekline çevirip ekler
                for (let key in row) {
                    if (key) {
                        const cleanKey = key.toLowerCase()
                            .replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g')
                            .replace(/ö/g, 'o').replace(/ç/g, 'c').replace(/ü/g, 'u')
                            .replace(/[^a-z0-9]/g, '');
                        cleanRow[cleanKey] = row[key];
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

// 0 Ürün hatasını ve menü boşluğunu önlemek için filtreleri tamamen iptal ettik. 
export async function getPages() { return await fetchSheetData('SAYFALAR'); }
export async function getTexts() { return await fetchSheetData('METINLER'); }
export async function getProducts() { return await fetchSheetData('URUNLER'); }
export async function getBrands() { return await fetchSheetData('MARKALAR'); }
export async function getCategories() { return await fetchSheetData('KATEGORILER'); }
export async function getSettings() { return []; }
export async function getDocuments() { return []; }

export async function getMenu() {
    const pages = await getPages();
    return pages.sort((a, b) => Number(a.sira || 99) - Number(b.sira || 99));
}
