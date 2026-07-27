import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** shadcn/ui class-merge helper. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number of Indian Rupees for display, e.g. 1234567 -> "₹12,34,567". */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Convert a EUR ex-works price to an estimated landed INR cost.
 * Build doc §11: Italian furniture lands at roughly 1.7–1.8× ex-works once
 * freight, duty, GST and logistics are included. `eurToInr` is the FX rate.
 */
export function landedFromEUR(
  eurExWorks: number,
  eurToInr: number,
  multiplier = 1.75,
): number {
  return Math.round(eurExWorks * eurToInr * multiplier);
}
