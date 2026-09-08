declare module 'better-sqlite3-session-store' {
  import { Store } from 'express-session';
  import session from 'express-session';

  interface Options {
    client: any;
    expired?: {
      clear?: boolean;
      intervalMs?: number;
    };
  }

  export default function SqliteStoreInit(
    s: typeof session
  ): new (options: Options) => Store;
}