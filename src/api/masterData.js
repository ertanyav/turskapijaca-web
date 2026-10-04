// Google Apps Script (TP_MASTER) Web App URL'si buraya gelecek
const SCRIPT_URL = "BURAYA_APPS_SCRIPT_URL_GELECEK";

export const fetchMasterData = async (language = 'tr') => {
  try {
    // Veriyi çekiyoruz
    const response = await fetch(`${SCRIPT_URL}?lang=${language}`);
    if (!response.ok) throw new Error('Veri çekilemedi');
    
    const data = await response.json();
    return data; 
    /* 
      Dönen veri yapısı beklentisi:
      {
        categories: [...],
        products: [...],
        texts: {...},
        settings: {...}
      }
    */
  } catch (error) {
    console.error("TP_MASTER Bağlantı Hatası:", error);
    return null;
  }
}
