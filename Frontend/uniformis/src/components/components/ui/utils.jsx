// import { clsx } from "clsx";
// import { twMerge } from "tailwind-merge";

// export function cn(...inputs) {
//   return twMerge(clsx(inputs));
// }

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to handle class names.
 * Uses clsx and tailwind-merge for advanced class merging,
 * falls back to simple concatenation for basic string inputs.
 * 
 * @param {...(string|object)} inputs - Class names or conditional class objects
 * @returns {string} - Processed class names
 * 
 * @example
 * // Using with clsx/tailwind-merge
 * cn("px-2", { "bg-red-500": isError }, "py-1")
 * 
 * // Using as simple concatenation
 * cn("button", "primary", isActive && "active")
 */
export function cn(...inputs) {
  // If all inputs are strings, use simple concatenation
  if (inputs.every(input => typeof input === 'string' || !input)) {
    return inputs.filter(Boolean).join(" ");
  }
  
  // Otherwise use clsx and tailwind-merge for advanced handling
  return twMerge(clsx(inputs));
}