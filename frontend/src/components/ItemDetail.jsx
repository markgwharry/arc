export default function ItemDetail({ item, onClose }) {
  if (!item) return null;

  const getRarityClass = (rarity) => {
    const rarityLower = (rarity || '').toLowerCase();
    const classes = {
      common: 'text-gray-400 border-gray-500',
      uncommon: 'text-green-400 border-green-500',
      rare: 'text-arc-blue border-arc-blue',
      epic: 'text-arc-purple border-arc-purple',
      legendary: 'text-arc-gold border-arc-gold',
    };
    return classes[rarityLower] || 'text-gray-400 border-gray-600';
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
         onClick={onClose}>
      <div className="bg-arc-dark rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
           onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-arc-dark border-b border-gray-700 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {item.image_url && (
              <img src={item.image_url} alt={item.name} className="w-12 h-12 object-contain" />
            )}
            <div>
              <h2 className="text-xl font-bold text-gray-100">{item.name}</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{item.category}</span>
                {item.rarity && (
                  <span className={`text-sm px-2 py-0.5 border rounded ${getRarityClass(item.rarity)}`}>
                    {item.rarity}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Description */}
          {item.description && (
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">Description</h3>
              <p className="text-gray-300">{item.description}</p>
            </div>
          )}

          {/* Stats */}
          {item.stats && Object.keys(item.stats).length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">Stats</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(item.stats).map(([key, value]) => (
                  value !== null && (
                    <div key={key} className="bg-arc-darker rounded p-2">
                      <span className="text-xs text-gray-500 capitalize">{key.replace('_', ' ')}</span>
                      <span className="block text-gray-100 font-medium">{value}</span>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}

          {/* Crafting */}
          {item.crafting && item.crafting.ingredients && Object.keys(item.crafting.ingredients).length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">Crafting Recipe</h3>
              <div className="bg-arc-darker rounded p-3">
                <div className="space-y-1">
                  {Object.entries(item.crafting.ingredients).map(([ingredient, count]) => (
                    <div key={ingredient} className="flex justify-between text-sm">
                      <span className="text-gray-300">{ingredient}</span>
                      <span className="text-arc-accent">x{count}</span>
                    </div>
                  ))}
                </div>
                {item.crafting.crafting_time && (
                  <div className="mt-2 pt-2 border-t border-gray-700 text-sm text-gray-400">
                    Crafting time: {item.crafting.crafting_time}s
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Recycle */}
          {item.recycle && item.recycle.materials && Object.keys(item.recycle.materials).length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">Recycling Yield</h3>
              <div className="bg-arc-darker rounded p-3">
                <div className="space-y-1">
                  {Object.entries(item.recycle.materials).map(([material, count]) => (
                    <div key={material} className="flex justify-between text-sm">
                      <span className="text-gray-300">{material}</span>
                      <span className="text-green-400">+{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Additional Info */}
          <div className="flex flex-wrap gap-4 text-sm">
            {item.value && (
              <div className="bg-arc-darker rounded px-3 py-2">
                <span className="text-gray-500">Value: </span>
                <span className="text-arc-gold">{item.value}</span>
              </div>
            )}
            {item.weight && (
              <div className="bg-arc-darker rounded px-3 py-2">
                <span className="text-gray-500">Weight: </span>
                <span className="text-gray-300">{item.weight} kg</span>
              </div>
            )}
          </div>

          {/* Traders */}
          {item.traders && item.traders.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">Available from Traders</h3>
              <div className="flex flex-wrap gap-2">
                {item.traders.map(trader => (
                  <span key={trader} className="bg-arc-darker text-gray-300 px-3 py-1 rounded text-sm">
                    {trader}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Quest Requirements */}
          {item.quest_requirements && item.quest_requirements.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">Required for Quests</h3>
              <div className="flex flex-wrap gap-2">
                {item.quest_requirements.map(quest => (
                  <span key={quest} className="bg-arc-darker text-arc-blue px-3 py-1 rounded text-sm">
                    {quest}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
