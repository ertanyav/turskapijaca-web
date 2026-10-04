import React, { useState, useEffect } from 'react';
import CategoryGrid from '../components/CategoryGrid';
import Header from '../components/Header';

export default function Home({ categories, heroSlides, settings }) {
  // Master dosyadan gelen ayar: Geçiş süresi (Örn: 7 saniye)
  const slideInterval = (settings?.homeCategorySeconds || 7) * 1000;
  const [currentSlide, setCurrentSlide] = useState(0);

  // Otomatik geçiş efekti (Hero Slider)
  useEffect(() => {
    if (!heroSlides || heroSlides.length <= 1) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === heroSlides.length - 1 ? 0 : prev + 1));
    }, slideInterval);
    
    return () => clearInterval(timer);
  }, [heroSlides, slideInterval]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      {/* Hero (Vitrin) Alanı */}
      <section className="relative w-full h-[50vh] sm:h-[60vh] lg:h-[70vh] overflow-hidden bg-surface">
        {heroSlides && heroSlides.map((slide, index) => (
          <div 
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          >
            {/* Arka plan karartma efekti (Yazıların okunması için) */}
            <div className="absolute inset-0 bg-background/60 z-10"></div>
            <img 
              src={slide.imageUrl} 
              alt={slide.title} 
              className="absolute inset-0 w-full h-full object-cover"
            />
            
            {/* Vitrin Metinleri */}
            <div className="relative z-20 h-full flex flex-col items-center justify-center text-center px-4">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-primaryText tracking-tight mb-4 drop-shadow-lg">
                {slide.title}
              </h1>
              <p className="text-lg sm:text-xl text-secondaryText max-w-2xl drop-shadow-md">
                {slide.description}
              </p>
              <a 
                href="/urunler" 
                className="mt-8 px-8 py-3 bg-accent text-background font-bold rounded-full hover:scale-105 transition-transform duration-300 shadow-[0_0_15px_rgba(234,179,8,0.4)]"
              >
                Ürünleri Keşfet
              </a>
            </div>
          </div>
        ))}
        
        {/* Slider Noktaları (Kontrol simgeleri) */}
        <div className="absolute bottom-6 left-0 right-0 z-30 flex justify-center space-x-3">
          {heroSlides && heroSlides.map((_, index) => (
            <button 
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors duration-300 ${index === currentSlide ? 'bg-accent' : 'bg-surfaceHover'}`}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Kategoriler */}
      <CategoryGrid categories={categories} />
      
      {/* Footer (Basit) */}
      <footer className="mt-auto py-8 bg-surface border-t border-surfaceHover/50 text-center">
        <p className="text-secondaryText text-sm">
          © {new Date().getFullYear()} TURSKA PIJACA — UNIVERCERT-MNE D.O.O. Tüm Hakları Saklıdır.
        </p>
      </footer>
    </div>
  );
}
