export const WishlistButton = ({ variant, onToggle, isInWishlist }) => {
    return (
      <button
        className="p-3 border rounded-md hover:border-red-500"
        onClick={onToggle}
        disabled={!variant || variant.stock_quantity === 0}
      >
        <svg
          className={`w-6 h-6 ${isInWishlist ? "text-red-500 fill-current" : "text-red-500"}`}
          fill={isInWishlist ? "currentColor" : "none"}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      </button>
    )
  }

