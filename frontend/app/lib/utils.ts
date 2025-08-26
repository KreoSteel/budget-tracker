import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { useAuth } from "~/contexts/AuthContext";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (amount: number | undefined) => {
  const { user } = useAuth();
  if (amount === undefined || amount === null || isNaN(amount)) return '$0.00';

  // Add commas for thousands and format to 2 decimal places
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: user?.preferences.currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};