
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getInitials(name: string) {
    if (!name) return '??';
    const names = name.split(' ');
    if (names.length > 1) {
      return names[0][0] + names[1][0];
    }
    return name.substring(0, 2).toUpperCase();
}

/**
 * Recursively removes properties with `undefined` values from an object.
 * This is crucial for ensuring data consistency when using JSON.stringify,
 * which omits keys with `undefined` values.
 * @param obj The object to sanitize.
 * @returns A new object with all `undefined` values removed.
 */
export function sanitizeObject<T extends object>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Create a shallow copy to avoid modifying the original object directly in this level
  const newObj = { ...obj };

  for (const key in newObj) {
    // We check hasOwnProperty to ensure we don't process properties from the prototype chain
    if (Object.prototype.hasOwnProperty.call(newObj, key)) {
      if (newObj[key] === undefined) {
        delete newObj[key];
      } else if (typeof newObj[key] === 'object' && newObj[key] !== null && !Array.isArray(newObj[key])) {
        // @ts-ignore
        newObj[key] = sanitizeObject(newObj[key]);
      }
    }
  }

  return newObj;
}
