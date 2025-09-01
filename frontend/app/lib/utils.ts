import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (
  value: number,
  currency: string = "USD",
  locale: string = "en-US"
): string => {
  if (typeof value !== "number" || isNaN(value)) return "";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
};

export function handleItemSelect(item: string, navigate: any) {
  // Navigate to the appropriate route
  if (item === 'dashboard') {
    navigate('/');
  } else {
    navigate(`/${item}`);
  }
};


