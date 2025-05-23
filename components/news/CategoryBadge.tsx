import React from 'react';

interface CategoryBadgeProps {
  category: string;
  size?: 'small' | 'medium' | 'large';
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ 
  category, 
  size = 'medium' 
}) => {
  const getBadgeStyles = () => {
    const categoryLower = category?.toLowerCase() || '';
    
    // Base styles that apply to all badges
    let baseStyles = "inline-block rounded-full font-medium";
    
    // Size-specific styles
    let sizeStyles = "";
    if (size === 'small') {
      sizeStyles = "text-xs px-2 py-1";
    } else if (size === 'medium') {
      sizeStyles = "text-sm px-3 py-1";
    } else if (size === 'large') {
      sizeStyles = "text-base px-4 py-1.5";
    }
    
    // Category-specific styles
    let categoryStyles = "";
    
    if (categoryLower === 'game' || categoryLower === 'gra') {
      categoryStyles = "bg-gradient-to-r from-green-600 to-emerald-700 text-white";
    } else if (categoryLower === 'movie' || categoryLower === 'film' || categoryLower === 'tv show' || categoryLower === 'serial') {
      categoryStyles = "bg-gradient-to-r from-blue-600 to-blue-800 text-white";
    } else if (categoryLower === 'comic' || categoryLower === 'komiks') {
      categoryStyles = "bg-gradient-to-r from-purple-600 to-purple-800 text-white";
    } else if (categoryLower === 'tech') {
      categoryStyles = "bg-gradient-to-r from-orange-500 to-red-600 text-white";
    } else {
      // Default for 'other' or unknown categories
      categoryStyles = "bg-gradient-to-r from-gray-600 to-gray-700 text-white";
    }
    
    return `${baseStyles} ${sizeStyles} ${categoryStyles}`;
  };

  return (
    <span className={getBadgeStyles()}>
      {category}
    </span>
  );
};