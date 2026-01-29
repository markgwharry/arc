export default function ItemCard({ item, onClick }) {
  const getRarityClass = (rarity) => {
    const rarityLower = (rarity || '').toLowerCase();
    const classes = {
      common: 'border-gray-500',
      uncommon: 'border-green-500',
      rare: 'border-arc-blue',
      epic: 'border-arc-purple',
      legendary: 'border-arc-gold',
    };
    return classes[rarityLower] || 'border-gray-600';
  };

  const getRarityTextClass = (rarity) => {
    const rarityLower = (rarity || '').toLowerCase();
    const classes = {
      common: 'text-gray-400',
      uncommon: 'text-green-400',
      rare: 'text-arc-blue',
      epic: 'text-arc-purple',
      legendary: 'text-arc-gold',
    };
    return classes[rarityLower] || 'text-gray-400';
  };

  return (
    <div
      onClick={() => onClick?.(item)}
      className={`item-card bg-arc-dark border-l-4 ${getRarityClass(item.rarity)}
                  rounded-lg p-4 cursor-pointer hover:bg-gray-800`}
    >
      <div className="flex items-start gap-3">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="w-12 h-12 object-contain rounded"
            loading="lazy"
          />
        ) : (
          <div className="w-12 h-12 bg-gray-700 rounded flex items-center justify-center text-gray-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-100 truncate">{item.name}</h3>

          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-500">{item.category}</span>
            {item.rarity && (
              <span className={`text-xs ${getRarityTextClass(item.rarity)}`}>
                {item.rarity}
              </span>
            )}
          </div>

          {item.description && (
            <p className="text-sm text-gray-400 mt-2 line-clamp-2">
              {item.description}
            </p>
          )}

          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            {item.value && (
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.736 6.979C9.208 6.193 9.696 6 10 6c.304 0 .792.193 1.264.979a1 1 0 001.715-1.029C12.279 4.784 11.232 4 10 4s-2.279.784-2.979 1.95c-.285.475-.507 1-.67 1.55H6a1 1 0 000 2h.013a9.358 9.358 0 000 1H6a1 1 0 100 2h.351c.163.55.385 1.075.67 1.55C7.721 15.216 8.768 16 10 16s2.279-.784 2.979-1.95a1 1 0 10-1.715-1.029c-.472.786-.96.979-1.264.979-.304 0-.792-.193-1.264-.979a4.265 4.265 0 01-.264-.521H10a1 1 0 100-2H8.017a7.36 7.36 0 010-1H10a1 1 0 100-2H8.472c.08-.185.167-.36.264-.521z"/>
                </svg>
                {item.value}
              </span>
            )}
            {item.weight && (
              <span>{item.weight} kg</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
