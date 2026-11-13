import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "INR"): string {
  if (currency === "INR") {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2).replace(/\.00$/, "")} Cr`;
    }
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2).replace(/\.00$/, "")} L`;
    }
    return `₹${amount.toLocaleString("en-IN")}`;
  }
  
  if (currency === "AED") {
    return `AED ${amount.toLocaleString()}`;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

