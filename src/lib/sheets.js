import Papa from 'papaparse';

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT17t35fI0N3c5FwF5X-b-kL94B4_D2F5F8N-l7T4R7S-R8-0X9F4D4X4F9_T5D6S3N9D5L8D2-L8F3/pub?output=csv';

// Yardımcı Fonksiyon: Google Sheets'ten CSV sekmesini JSON'a çevirir
async function fetchSheetData(gid) {
  try {
    const url = `${CSV_URL}&gid=${gid}`;
    const response = await fetch(url);
    const csv = await response.text();
    const result = Papa.parse(csv, { header: true, skipEmptyLines: true });
    return result.data;
  } catch (error) {
    console.error(`Sheet fetching error (gid: ${gid}):`, error);
    return [];
  }
}

// Sekmelerin GID numaraları (Google Sheet URL'sindeki "gid=" değerleri)
export async function getPages() {
  return fetchSheetData('0'); // SAYFALAR sekmesi
}

export async function getTexts() {
  return fetchSheetData('1994602283'); // METINLER sekmesi
}

export async function getProducts() {
  return fetchSheetData('930815132'); // URUNLER sekmesi
}

export async function getBrands() {
  return fetchSheetData('556950284'); // MARKALAR sekmesi
}

export async function getCategories() {
  return fetchSheetData('82285149'); // KATEGORILER sekmesi
}

export async function getMenu() {
  const pages = await getPages();
  // Sadece "Yayında: Evet" ve "Menüde Göster: Evet" olanları filtrele, Sıra'ya göre diz
  return pages
    .filter(p => p.Yayında?.toLowerCase() === 'evet' && p['Menüde Göster']?.toLowerCase() === 'evet')
    .sort((a, b) => parseInt(a['Sıra'] || '99') - parseInt(b['Sıra'] || '99'));
}
