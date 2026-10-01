import Papa from 'papaparse';

const SHEET_ID = '12wF2Is8OiESGgZ-Xq5qJMaZqxKelOCrnRjoj0zCqKlI';

async function fetchSheetData(tabName) {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tabName)}`;
    const response = await fetch(url);
    const text = await response.text();

    // Tablo gizli kalmışsa sistemi uyar
    if (text.includes('<html')) {
        console.error(`HATA: Tablo gizli. Sekme: ${tabName}`);
        return [];
    }

    return new Promise((resolve) => {
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
            // Tablodaki sütun başlıklarında yanlışlıkla boşluk bırakıldıysa (Örn: "Ad TR ") otomatik temizler
            const cleanedData = results.data.map(row => {
                const cleanRow = {};
                for (let key in row) {
                    cleanRow[key.trim()] = row[key];
                }
                return cleanRow;
            });
            resolve(cleanedData);
        },
        error: () => resolve([])
      });
    });
  } catch (error) {
    return [];
  }
}

// FİLTRELER İPTAL EDİLDİ - Veriler doğrudan çekiliyor
export async function getPages() {
    let data = await fetchSheetData('SAYFALAR');
    if (!data || data.length === 0) data = await fetchSheetData('Sayfalar'); // Küçük/Büyük harf ihtimali
    return data;
}

export async function getTexts() { return await fetchSheetData('METINLER'); }
export async function getDocuments() { return await fetchSheetData('DOKUMANLAR'); }
export async function getSettings() { return await fetchSheetData('AYARLAR'); }

export async function getProducts() {
    let data = await fetchSheetData('URUNLER');
    if (!data || data.length === 0) data = await fetchSheetData('Ürünler'); // Tablo adı farklı yazılmış olabilir
    return data;
}

export async function getBrands() { return await fetchSheetData('MARKALAR'); }
export async function getCategories() { return await fetchSheetData('KATEGORILER'); }

export async function getMenu() {
    // Yayında/Menüde kontrolünü şimdilik iptal ettik, tüm sayfalar menüye gelsin
    return await getPages(); 
}
