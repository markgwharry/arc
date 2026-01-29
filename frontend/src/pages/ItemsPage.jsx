import { useState } from 'react';
import SearchBar from '../components/SearchBar';
import Filters from '../components/Filters';
import ItemCard from '../components/ItemCard';
import ItemDetail from '../components/ItemDetail';
import { useItems } from '../hooks/useItems';

export default function ItemsPage() {
  const [selectedItem, setSelectedItem] = useState(null);
  const {
    items,
    total,
    loading,
    error,
    params,
    search,
    filterByCategory,
    filterByRarity,
    nextPage,
    prevPage
  } = useItems();

  const hasNextPage = params.offset + params.limit < total;
  const hasPrevPage = params.offset > 0;
  const currentPage = Math.floor(params.offset / params.limit) + 1;
  const totalPages = Math.ceil(total / params.limit);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <SearchBar onSearch={search} placeholder="Search weapons, gear, materials..." />
        <Filters
          onCategoryChange={filterByCategory}
          onRarityChange={filterByRarity}
          currentCategory={params.category}
          currentRarity={params.rarity}
        />
      </div>

      {/* Results Info */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-400">
          {loading ? 'Loading...' : `Showing ${items.length} of ${total} items`}
        </p>
        {totalPages > 1 && (
          <p className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </p>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 mb-4">
          <p className="text-red-400">Error loading items: {error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && items.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-arc-dark rounded-lg p-4 animate-pulse">
              <div className="flex gap-3">
                <div className="w-12 h-12 bg-gray-700 rounded" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-700 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-700 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && items.length === 0 && !error && (
        <div className="text-center py-12">
          <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-400">No items found</h3>
          <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Items Grid */}
      {items.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => (
            <ItemCard
              key={item.id}
              item={item}
              onClick={setSelectedItem}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {(hasPrevPage || hasNextPage) && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={prevPage}
            disabled={!hasPrevPage}
            className="px-4 py-2 bg-arc-dark border border-gray-700 rounded-lg
                       disabled:opacity-50 disabled:cursor-not-allowed
                       hover:border-arc-accent transition-colors"
          >
            Previous
          </button>
          <span className="text-gray-400">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={nextPage}
            disabled={!hasNextPage}
            className="px-4 py-2 bg-arc-dark border border-gray-700 rounded-lg
                       disabled:opacity-50 disabled:cursor-not-allowed
                       hover:border-arc-accent transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* Item Detail Modal */}
      <ItemDetail item={selectedItem} onClose={() => setSelectedItem(null)} />
    </div>
  );
}
