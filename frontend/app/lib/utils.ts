import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (amount: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
  }).format(amount);
};

export function handleItemSelect(item: string, navigate: any) {
  // Navigate to the appropriate route
  if (item === 'dashboard') {
    navigate('/dashboard');
  } else {
    navigate(`/${item}`);
  }
};

export const generatePaginationItems = (totalPages: number, currentPage: number) => {
  const items = [];
  const maxVisiblePages = 5;
  
  if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
          items.push(i);
      }
  } else {
      // Smart pagination with ellipsis
      if (currentPage <= 3) {
          // Show first 3 pages, ellipsis, last page
          for (let i = 1; i <= 3; i++) {
              items.push(i);
          }
          items.push('ellipsis');
          items.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
          // Show first page, ellipsis, last 3 pages
          items.push(1);
          items.push('ellipsis');
          for (let i = totalPages - 2; i <= totalPages; i++) {
              items.push(i);
          }
      } else {
          // Show first page, ellipsis, current-1, current, current+1, ellipsis, last page
          items.push(1);
          items.push('ellipsis');
          for (let i = currentPage - 1; i <= currentPage + 1; i++) {
              items.push(i);
          }
          items.push('ellipsis');
          items.push(totalPages);
      }
  }
  return items;
}