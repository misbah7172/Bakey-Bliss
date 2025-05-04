import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export function getCategoryImage(category: string): string {
  const images: Record<string, string> = {
    'Bread & Loaves': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    'Cakes & Pastries': 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    'Cookies & Biscuits': 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    'Pies & Tarts': 'https://images.unsplash.com/photo-1464305795204-6f5bbfc7fb81?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    'Doughnuts & Croissants': 'https://images.unsplash.com/photo-1559620192-032c4bc4674e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    'Savory Items': 'https://images.unsplash.com/photo-1604917877934-07d8d248d396?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    'Custom Chocolates': 'https://images.unsplash.com/photo-1519915028121-7d3463d5b1ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    'Seasonal & Special Items': 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    'Beverages': 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
  };
  
  return images[category] || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80';
}

export const roleRedirectMap: Record<string, string> = {
  'admin': '/dashboard/admin',
  'main_baker': '/dashboard/main-baker',
  'junior_baker': '/dashboard/junior-baker',
  'customer': '/dashboard/customer',
};
