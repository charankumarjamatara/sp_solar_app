/**
 * Input validation helpers
 */

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  const cleanPhone = phone.replace(/[\s()-]/g, '');
  return phoneRegex.test(cleanPhone) && cleanPhone.length >= 7;
};

export const isNonEmpty = (value?: string | null): boolean => {
  return typeof value === 'string' && value.trim().length > 0;
};
