import { useCategories, useRarities } from '../hooks/useItems';

export default function Filters({ onCategoryChange, onRarityChange, currentCategory, currentRarity }) {
  const { categories } = useCategories();
  const { rarities } = useRarities();

  return (
    <div className="flex flex-wrap gap-4">
      <div className="flex-1 min-w-[150px]">
        <label className="block text-sm text-gray-400 mb-1">Category</label>
        <select
          value={currentCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="w-full px-3 py-2 bg-arc-dark border border-gray-700 rounded-lg
                     text-gray-100 focus:outline-none focus:border-arc-accent"
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="flex-1 min-w-[150px]">
        <label className="block text-sm text-gray-400 mb-1">Rarity</label>
        <select
          value={currentRarity}
          onChange={(e) => onRarityChange(e.target.value)}
          className="w-full px-3 py-2 bg-arc-dark border border-gray-700 rounded-lg
                     text-gray-100 focus:outline-none focus:border-arc-accent"
        >
          <option value="">All Rarities</option>
          {rarities.map(rarity => (
            <option key={rarity} value={rarity}>{rarity}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
