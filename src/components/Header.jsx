import React from 'react';
import { useCartStore } from '../store/cart';

export default function Header() {
  const cartItems = useCartStore((state) => state.items);
  
  // Sepetteki toplam ürün sayısı (çeşit değil, adet toplamı)
  const totalItemsCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 w-full bg-background/90 backdrop-blur-md border-b border-surfaceHover/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          
          {/* Logo Alanı */}
          <div className="flex-shrink-0 flex items-center">
            <a href="/" className="block">
              {/* Logo görseli eklenecek, şimdilik metin */}
              <span className="text-xl md:text-2xl font-black text-primaryText tracking-tighter">
                TURSKA PIJACA
              </span>
            </a>
          </div>

          {/* Merkez Menü (Desktop) */}
          <nav className="hidden md:flex space-x-8">
            <a href="/urunler" className="text-base font-medium text-secondaryText hover:text-primaryText transition-colors">Ürünler</a>
            <a href="/markalar" className="text-base font-medium text-secondaryText hover:text-primaryText transition-colors">Markalar</a>
            <a href="/hakkimizda" className="text-base font-medium text-secondaryText hover:text-primaryText transition-colors">Hakkımızda</a>
            <a href="/iletisim" className="text-base font-medium text-secondaryText hover:text-primaryText transition-colors">İletişim</a>
          </nav>

          {/* Sağ Kısım: Dil Seçimi ve Sepet */}
          <div className="flex items-center space-x-4 md:space-x-6">
            
            {/* Dil Seçici (Basit Örnek) */}
            <div className="hidden sm:flex space-x-2 text-sm font-medium">
              <a href="/tr" className="text-primaryText border-b-2 border-accent pb-1">TR</a>
              <a href="/en" className="text-secondaryText hover:text-primaryText pb-1">EN</a>
              <a href="/me" className="text-secondaryText hover:text-primaryText pb-1">ME</a>
            </div>

            {/* Sepet İkonu */}
            <div className="relative cursor-pointer group">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primaryText group-hover:text-accent transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {/* Badge (Sepette ürün varsa görünür) */}
              {totalItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 bg-accent text-background text-xs font-bold rounded-full border-2 border-background">
                  {totalItemsCount}
                </span>
              )}
            </div>
            
            {/* Mobil Menü Butonu (Sadece mobilde görünür) */}
            <div className="md:hidden flex items-center">
              <button className="text-primaryText hover:text-accent focus:outline-none">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
            
          </div>
        </div>
      </div>
    </header>
  );
}
