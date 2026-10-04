import React from 'react';
import { useCartStore } from '../store/cart'; // Daha önce yazdığımız Zustand sepet state'i

export default function ProductCard({ product }) {
  const addItem = useCartStore((state) => state.addItem);

  // Master dosya kuralı: Fiyat 0 veya boşsa "Fiyat Sorunuz" gösterilecek
  const hasPrice = product.price && product.price > 0;

  // İletişim butonuna tıklandığında WhatsApp'a veya İletişim sayfasına yönlendirme
  const handleContactClick = () => {
    // Burada WhatsApp linki veya iletişim form modalı tetiklenebilir
    window.location.href = `https://wa.me/38263256666?text=Merhaba, ${product.name} (Kod: ${product.code}) ürününüzün fiyatını öğrenebilir miyim?`;
  };

  return (
    <div className="group relative flex flex-col bg-surface border border-surfaceHover/30 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
      
      {/* Ürün Görseli Alanı (Sabit En-Boy Oranı) */}
      <div className="relative aspect-square w-full bg-white p-4 overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
        />
        {/* Opsiyonel: Stokta yoksa veya yeni ürünse etiket eklenebilir */}
      </div>

      {/* Ürün Detayları */}
      <div className="flex flex-col flex-grow p-5 text-left">
        {/* Kategori veya Marka (Küçük Yazı) */}
        <span className="text-xs font-medium text-secondaryText uppercase tracking-wider mb-1">
          {product.brand || product.category}
        </span>
        
        {/* Ürün Adı */}
        <h3 className="text-base font-semibold text-primaryText leading-snug mb-2 line-clamp-2">
          {product.name}
        </h3>

        <div className="mt-auto pt-4 flex items-center justify-between">
          {/* Fiyat veya İletişim Metni */}
          <div className="flex flex-col">
            {hasPrice ? (
              <span className="text-lg font-bold text-primaryText">
                €{parseFloat(product.price).toFixed(2)}
              </span>
            ) : (
              <span className="text-sm font-medium text-accent">
                Fiyat Sorunuz
              </span>
            )}
          </div>

          {/* Eylem Butonu (Sepete Ekle veya İletişime Geç) */}
          {hasPrice ? (
            <button
              onClick={() => addItem(product)}
              className="flex items-center justify-center bg-surfaceHover text-primaryText p-2 rounded-lg hover:bg-accent hover:text-background transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent"
              aria-label="Sepete Ekle"
              title="Sepete Ekle"
            >
              {/* Sepet İkonu (Heroicons SVG) */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </button>
          ) : (
            <button
              onClick={handleContactClick}
              className="flex items-center justify-center bg-surfaceHover text-primaryText p-2 rounded-lg hover:bg-blue-500 hover:text-white transition-colors duration-200"
              aria-label="WhatsApp'tan Fiyat Sor"
              title="WhatsApp'tan Sor"
            >
              {/* Mesaj İkonu (Heroicons SVG) */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
