import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export function createUserSupabaseClient(accessToken: string): SupabaseClient {
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
  const supabaseKey = process.env.REACT_APP_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing REACT_APP_SUPABASE_URL or REACT_APP_SUPABASE_PUBLISHABLE_DEFAULT_KEY");
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}
