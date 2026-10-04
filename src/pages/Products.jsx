import React, { useState } from 'react';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';

export default function Products({ products, categories }) {
  const [activeCategory, setActiveCategory] = useState('ALL');

  // Kategoriye göre filtreleme
  const filteredProducts = activeCategory === 'ALL' 
    ? products 
    : products.filter(p => p.categoryId === activeCategory);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-primaryText mb-4">Tüm Ürünler</h1>
          <p className="text-secondaryText">Türkiye'den Karadağ'a uzanan eşsiz lezzetler ve kaliteli ürünler.</p>
        </div>

        {/* Kategori Filtreleme Butonları */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <button 
            onClick={() => setActiveCategory('ALL')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === 'ALL' ? 'bg-accent text-background' : 'bg-surface text-primaryText border border-surfaceHover hover:bg-surfaceHover'}`}
          >
            Tümü
          </button>
          {categories.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === cat.id ? 'bg-accent text-background' : 'bg-surface text-primaryText border border-surfaceHover hover:bg-surfaceHover'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Ürün Grid Yapısı */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-secondaryText">
            Bu kategoride henüz ürün bulunmamaktadır.
          </div>
        )}
      </main>
    </div>
  );
}
