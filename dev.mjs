// Cross-platform dev bootstrap without extra dependency
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
import('./server/index.ts');
