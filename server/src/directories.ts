import { join } from 'path';

export const distDir = __dirname;
export const templateDir = join(__dirname, 'templates');
export const rootDir = __dirname.replace('dist', '');
