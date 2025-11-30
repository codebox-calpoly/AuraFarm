import { User } from '@supabase/supabase-js';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      user?: User | { id: string; email?: string; [key: string]: any } | any;
    }
  }
}

export {};
