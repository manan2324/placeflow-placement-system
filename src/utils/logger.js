/**
 * Logger utility that respects NODE_ENV
 * In production, only logs errors. In development, logs everything.
 */

const isProd = process.env.NODE_ENV === 'production';

export const logger = {
  log: (...args) => {
    if (!isProd) {
      console.log(...args);
    }
  },
  
  error: (...args) => {
    if (!isProd) {
      console.error(...args);
    }
  },
  
  warn: (...args) => {
    if (!isProd) {
      console.warn(...args);
    }
  },
  
  debug: (...args) => {
    if (!isProd) {
      console.debug(...args);
    }
  },
};

export default logger;
