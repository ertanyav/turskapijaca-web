// src/lib/sheets.js

// Google Sheets Master Sheet URL'si veya yapılandırmanız
// ("SAYFALAR" sekmesinden veri çeken fonksiyon)
export async function getPages() {
  try {
    // Google Sheets'in SAYFALAR sekmesinden verileri çektiğiniz endpoint veya mantık
    // Örnek CSV / API çekme işlemi:
    const SHEET_ID = 'PROJE_SHEET_ID_BURAYA'; // Kendi Sheet ID'niz
    const TAB_NAME = 'SAYFALAR';
    
    // Eğer daha önce çalışan bir Google Sheets çekme metodunuz varsa onu koruyabilirsiniz,
    // kritik olan kısım fonksiyonun en başında "export" kelimesinin yer almasıdır:
    
    const response = await fetch(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${TAB_NAME}`);
    const data = await response.text();
    
    // Veriyi işleme mantığınız...
    return parseCSV(data);
  } catch (error) {
    console.error("Google Sheets verisi alınamadı:", error);
    return [];
  }
}

function parseCSV(text) {
  // Basit CSV parser veya mevcut projenizdeki parse fonksiyonu
  const lines = text.split('\n');
  const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim());
  
  return lines.slice(1).filter(line => line.trim() !== '').map(line => {
    const values = line.split(',').map(val => val.replace(/^"|"$/g, '').trim());
    let obj = {};
    headers.forEach((header, index) => {
      obj[header] = values[index] || '';
    });
    return obj;
  });
}
