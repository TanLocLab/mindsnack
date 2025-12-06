'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, X, ArrowUp } from 'lucide-react';
import ModelCard from '@/components/ModelCard';
import { CategoryData } from '@/types';
import mentalModelsData from '../input.json';

export default function Home() {
  const categories = mentalModelsData as CategoryData[];
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Generate unique card ID
  const getCardId = useCallback((categoryIndex: number, modelIndex: number, modelName: string) => {
    return `card-${categoryIndex}-${modelIndex}-${modelName.replace(/\s+/g, '-').toLowerCase()}`;
  }, []);


  // Filter categories and models based on search
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) {
      return categories;
    }

    const query = searchQuery.toLowerCase();
    return categories.map(category => {
      const filteredData = category.data.filter(model => {
        const title = (model.properties?.title || model.title || '').toLowerCase();
        const modelName = model.model_name.toLowerCase();
        const tldr = (model.properties?.tldr || model.tldr || '').toLowerCase();
        const content = (model.properties?.content || model.content || '').toLowerCase();
        const tags = (model.properties?.tags || model.tags || []).join(' ').toLowerCase();
        
        return title.includes(query) || 
               modelName.includes(query) || 
               tldr.includes(query) || 
               content.includes(query) ||
               tags.includes(query);
      });

      return {
        ...category,
        data: filteredData
      };
    }).filter(category => category.data.length > 0);
  }, [categories, searchQuery]);

  // Calculate total models and read count
  const totalModels = useMemo(() => {
    return categories.reduce((sum, cat) => sum + cat.data.length, 0);
  }, [categories]);

  const [readCount, setReadCount] = useState(0);

  // Calculate read count
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const calculateReadCount = () => {
      let count = 0;
      const readCards = JSON.parse(localStorage.getItem('mindsnack_read_cards') || '[]');
      categories.forEach((category, catIdx) => {
        category.data.forEach((model, modelIdx) => {
          const cardId = getCardId(catIdx, modelIdx, model.model_name);
          if (readCards.includes(cardId)) count++;
        });
      });
      setReadCount(count);
    };

    calculateReadCount();
    
    // Listen for read updates
    window.addEventListener('mindsnack_read_update', calculateReadCount);
    return () => window.removeEventListener('mindsnack_read_update', calculateReadCount);
  }, [categories, getCardId]);

  // Scroll to active category on change
  useEffect(() => {
    if (activeCategory !== null) {
      const categoryElement = document.getElementById(`category-${activeCategory}`);
      if (categoryElement) {
        setTimeout(() => {
          categoryElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, [activeCategory]);

  // Show/hide scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30">
      {/* Sticky Progress Bar - Always on top */}
      <div className="sticky top-0 z-[100] bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-3 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-xs sm:text-sm text-gray-600 font-medium">MindSnack</span>
              <div className="flex-1 max-w-xs sm:max-w-sm">
                <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 rounded-full"
                    style={{ width: `${totalModels > 0 ? (readCount / totalModels) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="text-xs sm:text-sm text-gray-500 font-medium ml-2">
              {readCount}/{totalModels} ({totalModels > 0 ? Math.round((readCount / totalModels) * 100) : 0}%)
            </div>
          </div>
        </div>
      </div>

      {/* Header - Only at top of page */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 relative z-10">
        <div className="max-w-7xl mx-auto px-3 py-3 sm:px-4 sm:py-4">
          {/* Compact Header - Mobile First */}
          <div className="mb-2 sm:mb-4">
            {/* Title Row - Compact */}
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                MindSnack
              </h1>
            </div>
            
            {/* Search Bar - Compact */}
            <div className="relative">
              <Search className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 sm:pl-10 pr-8 sm:pr-10 py-2 sm:py-2.5 rounded-lg sm:rounded-xl border border-gray-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-200 transition-all text-sm bg-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}
            </div>
            {searchQuery && (
              <p className="text-xs text-gray-500 mt-1.5 text-center">
                {filteredCategories.reduce((sum, cat) => sum + cat.data.length, 0)} kết quả
              </p>
            )}
          </div>

          {/* Category Navigation Tabs - Compact Scrollable */}
          <div className="mb-2 sm:mb-4 -mx-3 sm:mx-0">
            <div className="flex gap-1.5 sm:gap-2 overflow-x-auto px-3 sm:px-0 pb-2 sm:pb-0 scrollbar-hide">
              <button
                onClick={() => {
                  setActiveCategory(null);
                  setSearchQuery('');
                }}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md sm:rounded-lg transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                  activeCategory === null
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tất cả
              </button>
              {categories.map((categoryData, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setActiveCategory(index);
                    setSearchQuery('');
                  }}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md sm:rounded-lg transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                    activeCategory === index
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {categoryData.category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-8">

        {/* Categories */}
        <div className="space-y-8 sm:space-y-12">
          {filteredCategories.map((categoryData, categoryIndex) => {
            // Find original category index for filtering
            const originalCategoryIndex = categories.findIndex(cat => cat.category === categoryData.category);
            
            // Filter: show all if activeCategory is null, or show only selected category
            if (activeCategory !== null && activeCategory !== originalCategoryIndex) {
              return null;
            }

            return (
              <div 
                key={categoryIndex} 
                id={`category-${originalCategoryIndex}`}
                className="mb-8 scroll-mt-4"
              >
                {/* Category Header */}
                <div className="mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent border-b-2 border-indigo-200 pb-2">
                    {categoryData.category}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-2">
                    {categoryData.data.length} mental model{categoryData.data.length !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Cards Grid - Mobile: 1 column, Tablet: 2 columns, Desktop: 3 columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {categoryData.data.map((model, modelIndex) => {
                    const cardId = getCardId(originalCategoryIndex, modelIndex, model.model_name);
                    return (
                      <ModelCard 
                        key={modelIndex} 
                        model={model} 
                        cardId={cardId}
                        categoryIndex={originalCategoryIndex}
                        modelIndex={modelIndex}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 p-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 ${
          showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
    </main>
  );
}

