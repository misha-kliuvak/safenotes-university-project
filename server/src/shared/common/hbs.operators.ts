import { roundTo2Decimal, toCurrency } from '@/shared/utils';

export const HandlebarOperators = {
  eq: function (a, operator, b, options) {
    if (!options) {
      options = b;
      b = operator;
      operator = '==';
    }

    switch (operator) {
      case '==':
        return a == b;
      case '!=':
        return a != b;
      case '===':
        return a === b;
      case '<':
        return a < b;
      case '<=':
        return a <= b;
      case '>':
        return a > b;
      case '>=':
        return a >= b;
      case '&&':
        return !!(a && b);
      case '||':
        return !!(a || b);
      default:
        return false;
    }
  },

  dateFormatter: function (date, format, options) {
    const DateFormats = {
      date: {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      },
      numericDate: {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
      },
      datetime: {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
        month: 'short',
        day: 'numeric',
      },
    };

    if (!options) {
      options = format;
      format = 'date';
    }

    format = DateFormats[format] || DateFormats.date;

    const formatter = new Intl.DateTimeFormat('en-US', format);

    return formatter.format(date);
  },

  wordArticle: function (value, options) {
    return /^[AEIOU]/i.test(value) ? 'an' : 'a';
  },

  percentOf: function (val, percent) {
    return roundTo2Decimal(val * (percent / 100));
  },

  calcPercent(number, total) {
    return roundTo2Decimal((number / total) * 100);
  },

  slice: function (str, length) {
    return str.slice(0, length);
  },

  sum: function (a, b) {
    return a + b;
  },

  toCurrency: function (num) {
    return toCurrency(roundTo2Decimal(num));
  },

  toJSON: function (obj) {
    return JSON.stringify(obj, null, 3);
  },
};
