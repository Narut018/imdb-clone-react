import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  initialRating?: number;
  onRate: (rating: number, event?: React.MouseEvent) => void;
  readonly?: boolean;
  size?: number;
  className?: string;
}

const StarRating: React.FC<StarRatingProps> = ({ 
  initialRating = 0, 
  onRate, 
  readonly = false, 
  size = 20,
  className = ''
}) => {
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState(0);

  const handleClick = (value: number, event?: React.MouseEvent) => {
    if (!readonly) {
      event?.preventDefault(); // Prevent navigation
      event?.stopPropagation(); // Stop event propagation
      setRating(value);
      onRate(value, event);
    }
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-${size/4} h-${size/4} cursor-${readonly ? 'default' : 'pointer'} transition-colors ${
            (hover || rating) >= star
              ? 'fill-yellow-500 text-yellow-500'
              : 'fill-transparent text-gray-400'
          }`}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          onClick={(e) => handleClick(star, e)}
        />
      ))}
    </div>
  );
};

export default StarRating;
