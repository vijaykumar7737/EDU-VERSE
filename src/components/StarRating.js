import React, { useState } from 'react';
import { FaStar, FaRegStar } from 'react-icons/fa';

const StarRating = ({ 
  rating = 0, 
  onRatingChange = null, 
  readonly = false, 
  size = '1rem',
  className = '' 
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  
  const handleStarClick = (starValue) => {
    if (!readonly && onRatingChange) {
      onRatingChange(starValue);
    }
  };
  
  const handleStarHover = (starValue) => {
    if (!readonly) {
      setHoverRating(starValue);
    }
  };
  
  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0);
    }
  };
  
  const getStarColor = (starValue) => {
    const currentRating = hoverRating || rating;
    if (starValue <= currentRating) {
      return '#ffc107'; // Bootstrap warning color (yellow)
    }
    return '#dee2e6'; // Bootstrap light gray
  };
  
  return (
    <div 
      className={`d-flex align-items-center ${className}`}
      onMouseLeave={handleMouseLeave}
      style={{ cursor: readonly ? 'default' : 'pointer' }}
    >
      {[1, 2, 3, 4, 5].map((starValue) => (
        <span
          key={starValue}
          onClick={() => handleStarClick(starValue)}
          onMouseEnter={() => handleStarHover(starValue)}
          style={{
            color: getStarColor(starValue),
            fontSize: size,
            marginRight: '2px',
            cursor: readonly ? 'default' : 'pointer',
            transition: 'color 0.2s ease'
          }}
        >
          {starValue <= (hoverRating || rating) ? <FaStar /> : <FaRegStar />}
        </span>
      ))}
      {rating > 0 && (
        <span className="ms-2 text-muted small">
          ({rating}/5)
        </span>
      )}
    </div>
  );
};

export default StarRating;