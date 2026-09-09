import 'express-session';

// Augment express-session module
declare module 'express-session' {
  interface SessionData {
    userId?: number;
  }
}