import React from 'react'; // React might not be needed if only returning strings/CSSProperties

// Converts full category name to a simplified variant string
// Ideally, this should be in a shared utils file and imported.
export const getBadgeVariant = (category: string): string => {
  if (!category) return 'default';
  const categoryLower = category.toLowerCase();

  if (categoryLower === 'gra' || categoryLower === 'game') return 'green';
  if (categoryLower === 'film' || categoryLower === 'movie' || categoryLower === 'serial' || categoryLower === 'tv show') return 'blue';
  if (categoryLower === 'komiks' || categoryLower === 'comic') return 'purple';
  if (categoryLower === 'tech') return 'orange';
  if (categoryLower === 'inne' || categoryLower === 'other') return 'secondary';
  
  return 'default';
};

// Returns CSSProperties for gradient background based on variant
export const getFeaturedArticleGradientStyle = (variant: string): React.CSSProperties => {
  const darkEndColor = 'rgb(17, 24, 39)'; // Consistent dark end for the gradient

  switch (variant) {
    case 'green':
      return { background: `linear-gradient(to bottom right, rgb(21, 128, 61), ${darkEndColor})` }; // Dark Green
    case 'blue':
      return { background: `linear-gradient(to bottom right, rgb(29, 78, 216), ${darkEndColor})` }; // Dark Blue
    case 'purple':
      return { background: `linear-gradient(to bottom right, rgb(88, 28, 135), ${darkEndColor})` }; // Original Purple
    case 'orange':
      return { background: `linear-gradient(to bottom right, rgb(194, 65, 12), ${darkEndColor})` }; // Dark Orange
    case 'secondary': // Usually gray
      return { background: `linear-gradient(to bottom right, rgb(75, 85, 99), ${darkEndColor})` }; // Gray
    case 'default':
    default:
      return { background: `linear-gradient(to bottom right, rgb(55, 65, 81), ${darkEndColor})` }; // Default Dark Gray
  }
};

// NEW: Returns Tailwind CSS class string for text color based on variant
export const getCategoryTextColorClasses = (variant: string): string => {
  switch (variant) {
    case 'green':
      return 'text-green-400 hover:text-green-300';
    case 'blue':
      return 'text-blue-400 hover:text-blue-300';
    case 'purple':
      return 'text-purple-400 hover:text-purple-300';
    case 'orange':
      return 'text-orange-400 hover:text-orange-300';
    case 'secondary':
      return 'text-slate-400 hover:text-slate-300'; // Using slate for a slightly brighter gray link
    case 'default':
    default:
      return 'text-gray-400 hover:text-gray-300'; // Default link color
  }
};

// NOWA FUNKCJA: Zwraca klasę Tailwind CSS dla *docelowego* koloru tekstu po najechaniu myszką
export const getCategoryHoverTextColorClass = (variant: string): string => {
  switch (variant) {
    case 'green':
      return 'text-green-300'; // Klasa, którą `group-hover:` zastosuje
    case 'blue':
      return 'text-blue-300';
    case 'purple':
      return 'text-purple-300';
    case 'orange':
      return 'text-orange-300';
    case 'secondary':
      return 'text-slate-300';
    case 'default':
    default:
      return 'text-gray-300'; // Domyślny kolor hover dla tekstu
  }
};