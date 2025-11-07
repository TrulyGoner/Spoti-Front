export default function RatingStars({ rating, onRatingChange }) {
  const handleClick = (value) => {
    onRatingChange(value)
  }

  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-surface-400 mr-2">Рейтинг:</span>
      {[1, 2, 3, 4, 5].map((value) => (
        <button
          key={value}
          onClick={() => handleClick(value)}
          className={`text-2xl transition-colors ${
            value <= rating
              ? 'text-yellow-400 hover:text-yellow-300'
              : 'text-surface-600 hover:text-surface-500'
          }`}
          type="button"
        >
          ★
        </button>
      ))}
      {rating > 0 && (
        <span className="text-xs text-surface-400 ml-2">{rating}/5</span>
      )}
    </div>
  )
}

