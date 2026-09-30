import Papa from 'papaparse';

export const SHEET_ID = '12wF2Is8OiESGgZ-Xq5qJMaZqxKelOCrnRjoj0zCqKlI';

// Web'e Yayınlanmış Canlı CSV Bağlantıları
const PRODUCTS_CSV = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSgtpYzushPu45KC5ztC4xvXS6AwRFSUEEWaDOZ3klcaxaUSFBxS0JMvUzhEbYO-Aok-lz7re6nr_Hg/pub?gid=300101&single=true&output=csv';
const TEXTS_CSV = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=METINLER`;
const BRANDS_CSV = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=MARKALAR`;
const DOCUMENTS_CSV = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=BELGELER`;

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

// 1. ÜRÜNLER
export async function getProducts() {
  const data = await fetchCSV(PRODUCTS_CSV);
  return data.filter(item => {
    const pub = item['Yayında'] ? item['Yayında'].trim().toUpperCase() === 'EVET' : true;
    const act = item['Durum'] ? item['Durum'].trim().toUpperCase() === 'AKTİF' : true;
    return pub && act;
  });
}

// 2. METINLER (Nokta notasyonlu dinamik sözlük)
export async function getTexts() {
  const data = await fetchCSV(TEXTS_CSV);
  const dict = {};
  
  if (data && data.length > 0) {
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
  }

  return dict;
}

// 3. MARKALAR (Distribütörlükler & Satış Portföyü)
export async function getBrands() {
  const data = await fetchCSV(BRANDS_CSV);
  if (data && data.length > 0) {
    return data.filter(item => item['Yayında'] ? item['Yayında'].trim().toUpperCase() === 'EVET' : true);
  }
  // Google engellerse devreye giren yedek marka listesi
  return [
    { "Kod": "BR001", "Marka": "Seda Gıda", "Tür": "DISTRIBUTOR", "Logo URL": "https://lh3.googleusercontent.com/d/1nUH9KvNddJGvXIsGFeiS1yT4tLCVmcWP" },
    { "Kod": "BR002", "Marka": "Nefis", "Tür": "DISTRIBUTOR", "Logo URL": "https://lh3.googleusercontent.com/d/18c3R1Kmkwj7oDno2iCaM420Fr_VmMfqS" },
    { "Kod": "BR003", "Marka": "Büyük Usta", "Tür": "DISTRIBUTOR", "Logo URL": "https://lh3.googleusercontent.com/d/15NDKVINABnnmY6G3XUEwTYf8ozdUq-UB" },
    { "Kod": "BR004", "Marka": "Kaçkar", "Tür": "DISTRIBUTOR", "Logo URL": "https://lh3.googleusercontent.com/d/1n_CosSIp8PDd-xII4qgno9QTxGAJoy6M" },
    { "Kod": "BR005", "Marka": "Cem", "Tür": "DISTRIBUTOR", "Logo URL": "https://lh3.googleusercontent.com/d/1cZp9y1E6I0gA_FHJwBbBg_h1xzz-iJ0R" },
    { "Kod": "BR006", "Marka": "Ergül", "Tür": "DISTRIBUTOR", "Logo URL": "https://lh3.googleusercontent.com/d/1vv442VWVMNXAmGb93SXvnVGxLs7XWMJb" },
    { "Kod": "BR007", "Marka": "Shazel", "Tür": "DISTRIBUTOR", "Logo URL": "https://lh3.googleusercontent.com/d/1SLSLMvqHfaOT8U--d1CquRPcky-trjbV" },
    { "Kod": "BR008", "Marka": "Fairouz", "Tür": "DISTRIBUTOR", "Logo URL": "https://lh3.googleusercontent.com/d/1qYcKFZobFFSH6KaGheccSKqozZmAPu8b" },
    { "Kod": "BR009", "Marka": "Mehmet Efendi", "Tür": "SALES", "Logo URL": "https://lh3.googleusercontent.com/d/1rGUhkld-arHJ4Fw2biNQ8XWTeJ7DHNgx" },
    { "Kod": "BR010", "Marka": "Doğuş", "Tür": "SALES", "Logo URL": "https://lh3.googleusercontent.com/d/17v9kAcalu7_QY6L98_c4Na9qIp8q5Gfr" },
    { "Kod": "BR011", "Marka": "Beypazarı", "Tür": "SALES", "Logo URL": "https://lh3.googleusercontent.com/d/14cd913mc-eFpP11S1rc0DxJIp1x1UkUX" },
    { "Kod": "BR012", "Marka": "Burcu", "Tür": "SALES", "Logo URL": "https://lh3.googleusercontent.com/d/1KvlheBbjNnSkmS5sivzdIZK-qRF2GZFe" },
    { "Kod": "BR013", "Marka": "Öncü", "Tür": "SALES", "Logo URL": "https://lh3.googleusercontent.com/d/1eZY10wAng2XThvJ2MFOgqbixZI4Y9zGZ" },
    { "Kod": "BR014", "Marka": "Tukaş", "Tür": "SALES", "Logo URL": "https://lh3.googleusercontent.com/d/1K9G5ft3EswVn4Hc3VUOHIuxrEDiMaFG9" }
  ];
}

// 4. BELGELER (Dokümanlar Sayfası)
export async function getDocuments() {
  const data = await fetchCSV(DOCUMENTS_CSV);
  if (data && data.length > 0) {
    return data.filter(item => item['Yayında'] ? item['Yayında'].trim().toUpperCase() === 'EVET' : true);
  }
  // Google engellerse devreye giren yedek doküman listesi
  return [
    {
      "Kod": "order",
      "Ad TR": "Sipariş formu",
      "Ad EN": "Order form",
      "Ad ME": "Obrazac za naručivanje",
      "Açıklama TR": "Ürün ve miktarları paylaşmak için sipariş formu.",
      "Açıklama EN": "Order form for sharing products and quantities.",
      "Açıklama ME": "Obrazac za slanje proizvoda i količina.",
      "Drive ID": "1MwG6HpQhZwsGEh72Z25Jo-QzlW869mjV",
      "Dosya adı": "TURSKA_PIJACA_Order_Form.pdf"
    },
    {
      "Kod": "logo",
      "Ad TR": "TURSKA PIJACA logosu",
      "Ad EN": "TURSKA PIJACA logo",
      "Ad ME": "TURSKA PIJACA logo",
      "Açıklama TR": "Mevcut kurumsal logo dosyası.",
      "Açıklama EN": "The current corporate logo file.",
      "Açıklama ME": "Aktuelni korporativni logo.",
      "Drive ID": "1J9KP6UkFWWjHNV6d1W2ScYDV9SozuqRC",
      "Dosya adı": "Turska_Pijaca_Logo.png"
    },
    {
      "Kod": "monogram",
      "Ad TR": "TURSKA PIJACA monogramı",
      "Ad EN": "TURSKA PIJACA monogram",
      "Ad ME": "TURSKA PIJACA monogram",
      "Açıklama TR": "Mevcut monogram dosyası.",
      "Açıklama EN": "The current monogram file.",
      "Açıklama ME": "Aktuelni monogram.",
      "Drive ID": "14BFS24JrQOpz1ALBLzUGd0T-0Jw4c0jy",
      "Dosya adı": "Turska_Pijaca_Monogram.png"
    }
  ];
}
