// TODO make class with static properties

export function toCurrency(number?: number, intlOptions = {}): string {
  // eslint-disable-next-line no-restricted-globals
  if (number === undefined || number === null || isNaN(number)) {
    return '';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    ...intlOptions,
  }).format(number);
}

export function toCompactCurrency(number: number) {
  return toCurrency(number, {
    notation: 'compact',
    maximumFractionDigits: 0,
  });
}

/**
 * Get initials from full name, eg:
 *  name = John doe,
 *  initials = JD
 * @param fullName
 * @returns {string|null}
 */
export function getInitials(fullName: string) {
  try {
    const _split = fullName?.split(' ');
    const firstNameLetter = _split[0]?.charAt(0);
    const lastNameLetter = _split[1]?.charAt(0);

    return (firstNameLetter + lastNameLetter).toUpperCase();
  } catch (err) {
    return null;
  }
}

/**
 * Parse first word from string with 2 words, eg: John Smith = John
 * @param fullName
 */
export function getFirstName(fullName): string {
  return fullName.split(' ')[0];
}

/**
 * Parse second word from string with 2 words, eg: John Smith = Smith
 * @param fullName
 */
export function getLastName(fullName): string {
  return fullName.split(' ')[1];
}

/**
 * Convert camel case to dash case
 * Eg: doubleValue -> double-value
 */
export function camelCaseToDashCase(str: string) {
  return str.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}

export function toBoolean(value: string | boolean): boolean {
  if (typeof value === 'string') {
    value = value.trim().toLowerCase();
  }

  if (value == 'false' || value == '0') {
    return false;
  }

  return Boolean(value);
}

export function roundTo2Decimal(num: number): number {
  return Number(Math.round(((num || 0) + Number.EPSILON) * 100) / 100);
}
