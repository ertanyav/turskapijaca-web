import React from 'react';
import { useCartStore } from '../store/cart';

export default function Cart() {
  const { items, removeItem, addItem, getCartTotal, clearCart } = useCartStore();

  // Master dosya kuralı: Fiyat EUR
  const totalAmount = getCartTotal();

  // Ürün adedini azaltma fonksiyonu
  const decreaseQuantity = (productId) => {
    const state = useCartStore.getState();
    const item = state.items.find((i) => i.id === productId);
    if (item.quantity > 1) {
      // Zustand state'ini doğrudan güncelliyoruz (Gerçek uygulamada store'a decrease action'ı eklenmelidir)
      useCartStore.setState({
        items: state.items.map((i) =>
          i.id === productId ? { ...i, quantity: i.quantity - 1 } : i
        ),
      });
    } else {
      removeItem(productId);
    }
  };

  // WhatsApp Sipariş Yönlendirmesi
  const handleCheckout = () => {
    if (items.length === 0) return;
    
    let orderText = "Merhaba, TURSKA PIJACA üzerinden sipariş vermek istiyorum:\n\n";
    items.forEach(item => {
      orderText += `- ${item.name} (Kod: ${item.code}) | Adet: ${item.quantity} | Fiyat: €${parseFloat(item.price).toFixed(2)}\n`;
    });
    orderText += `\nToplam Tutar: €${totalAmount.toFixed(2)}`;
    
    const encodedText = encodeURIComponent(orderText);
    window.location.href = `https://wa.me/38263256666?text=${encodedText}`;
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-background">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-surfaceHover mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h2 className="text-2xl font-bold text-primaryText mb-2">Sepetiniz Boş</h2>
        <p className="text-secondaryText mb-6">İhtiyacınız olan ürünleri sepetinize ekleyerek alışverişe başlayabilirsiniz.</p>
        <a href="/urunler" className="px-6 py-3 bg-accent text-background font-bold rounded-lg hover:opacity-90 transition-opacity">
          Ürünleri İncele
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-primaryText mb-8">Alışveriş Sepeti</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sol Taraf: Sepetteki Ürünler Listesi */}
          <div className="lg:w-2/3">
            <div className="bg-surface rounded-2xl shadow-lg border border-surfaceHover/30 overflow-hidden">
              <ul className="divide-y divide-surfaceHover/50">
                {items.map((item) => (
                  <li key={item.id} className="p-4 sm:p-6 flex items-center gap-4 sm:gap-6">
                    {/* Ürün Görseli */}
                    <div className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-xl overflow-hidden p-2">
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain" />
                    </div>

                    {/* Ürün Bilgileri ve Kontroller */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-base sm:text-lg font-semibold text-primaryText line-clamp-2">{item.name}</h3>
                          <p className="text-xs text-secondaryText mt-1">Kod: {item.code}</p>
                        </div>
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="text-secondaryText hover:text-danger transition-colors p-1"
                          title="Ürünü Sil"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        {/* Adet Kontrolcü */}
                        <div className="flex items-center border border-surfaceHover rounded-lg">
                          <button onClick={() => decreaseQuantity(item.id)} className="px-3 py-1 text-primaryText hover:bg-surfaceHover rounded-l-lg transition-colors">-</button>
                          <span className="px-4 py-1 text-primaryText font-medium border-x border-surfaceHover">{item.quantity}</span>
                          <button onClick={() => addItem(item)} className="px-3 py-1 text-primaryText hover:bg-surfaceHover rounded-r-lg transition-colors">+</button>
                        </div>
                        {/* Fiyat (Adet x Birim Fiyat) */}
                        <div className="text-right">
                          <span className="block text-sm text-secondaryText">Birim: €{parseFloat(item.price).toFixed(2)}</span>
                          <span className="block text-lg font-bold text-primaryText">€{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              
              {/* Sepeti Temizle Butonu */}
              <div className="p-4 bg-surfaceHover/20 border-t border-surfaceHover/30 text-right">
                <button onClick={clearCart} className="text-sm text-secondaryText hover:text-danger transition-colors">
                  Sepeti Tamamen Boşalt
                </button>
              </div>
            </div>
          </div>

          {/* Sağ Taraf: Sipariş Özeti (Ödeme/Onay) */}
          <div className="lg:w-1/3">
            <div className="bg-surface rounded-2xl shadow-lg border border-surfaceHover/30 p-6 sticky top-24">
              <h2 className="text-xl font-bold text-primaryText mb-6 border-b border-surfaceHover/50 pb-4">Sipariş Özeti</h2>
              
              <div className="flex justify-between text-secondaryText mb-4">
                <span>Ara Toplam</span>
                <span>€{totalAmount.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between text-secondaryText mb-6">
                <span>KDV & Vergiler</span>
                <span>Dahil</span>
              </div>
              
              <div className="flex justify-between items-center text-primaryText font-bold text-2xl mb-8 border-t border-surfaceHover/50 pt-4">
                <span>Toplam</span>
                <span>€{totalAmount.toFixed(2)}</span>
              </div>

              <button 
                onClick={handleCheckout}
                className="w-full bg-accent text-background font-bold text-lg py-4 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <span>Siparişi Tamamla (WhatsApp)</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
              
              <p className="text-xs text-secondaryText text-center mt-4">
                Siparişinizi WhatsApp üzerinden onayladıktan sonra operasyon ekibimiz sizinle iletişime geçecektir.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
