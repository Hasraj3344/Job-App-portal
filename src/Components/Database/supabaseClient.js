import { createClient } from '@supabase/supabase-js'

// Load environment variables from Render environment
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Create and export the Supabase client instance
export const supabase = createClient(supabaseUrl, supabaseKey);
