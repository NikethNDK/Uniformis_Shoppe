export const extractErrorMessages = (data) => {
    if (!data) return ["An unknown error occurred"];

    if (typeof data === "string") return [data]; // Direct string error
    if (Array.isArray(data)) return data.map(extractErrorMessages).flat(); // Handle arrays
    if (typeof data === "object") return Object.values(data).map(extractErrorMessages).flat(); // Handle objects

    return ["An error occurred"]; // Fallback
  };