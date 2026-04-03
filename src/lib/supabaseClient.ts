import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Missing REACT_APP_SUPABASE_URL or REACT_APP_SUPABASE_PUBLISHABLE_DEFAULT_KEY"
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);
