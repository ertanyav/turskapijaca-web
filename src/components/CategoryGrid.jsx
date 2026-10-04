import React from 'react';

// Bu veriler api/masterData.js üzerinden TP_MASTER'dan gelecek
export default function CategoryGrid({ categories }) {
  if (!categories || categories.length === 0) return null;

  return (
    <section className="py-12 bg-background"> {/* bg-[#18181B] - Tailwind config'den */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Başlık Alanı */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-primaryText tracking-tight sm:text-4xl">
            Kategoriler
          </h2>
          <div className="w-16 h-1 bg-accent mx-auto mt-4 rounded-full"></div> {/* Logo renginde vurgu çizgisi */}
        </div>

        {/* Kategoriler Izgarası */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:gap-6">
          {categories.map((category) => (
            <a 
              key={category.id} 
              href={`/urunler/${category.slug}`}
              className="group relative flex flex-col items-center p-4 bg-surface rounded-2xl shadow-lg transition-all duration-300 hover:bg-surfaceHover hover:scale-105 border border-surfaceHover/50 cursor-pointer overflow-hidden"
            >
              {/* Görsel Kutusu */}
              <div className="relative w-24 h-24 mb-4 md:w-32 md:h-32">
                <img 
                  src={category.imageUrl} 
                  alt={category.name}
                  loading="lazy"
                  className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              
              {/* Kategori Adı */}
              <h3 className="text-sm md:text-base font-semibold text-primaryText text-center group-hover:text-accent transition-colors duration-200">
                {category.name}
              </h3>
            </a>
          ))}
        </div>

      </div>
    </section>
  );
}
