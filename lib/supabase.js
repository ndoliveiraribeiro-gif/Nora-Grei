import { createClient } from '@supabase/supabase-js'

let _supabase = null;

export const supabase = new Proxy({}, {
  get(_, prop) {
    if (!_supabase) {
      _supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      );
    }
    const val = _supabase[prop];
    return typeof val === 'function' ? val.bind(_supabase) : val;
  }
});