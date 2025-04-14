export const phoneRegex = /^01[0125][0-9]{8}$/;
export const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
export const nationalIdRegex = /^\d{14}$/;

export const englishNameRegex = /^[a-zA-Z\s]+$/;
// Fix the Arabic regex by removing quotes and fixing the pattern
export const arabicNameRegex = /^[\u0600-\u06FF\s]+$/;
// Properly combine the regexes
export const nameRegex = /^([a-zA-Z\s]+|[\u0600-\u06FF\s]+)$/;

export const emailRegex =
  /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

// New regex patterns for address components
export const cityRegex = /^[a-zA-Z\u0600-\u06FF\s]{2,50}$/; // Allow English and Arabic city names
export const streetRegex = /^[a-zA-Z0-9\u0600-\u06FF\s\.\,\-]{3,100}$/; // Allow English, Arabic, numbers and some special characters

// Date format regex for MM-DD-YYYY
export const dateRegex = /^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])-\d{4}$/;
