import { createClient } from '@supabase/supabase-js'

// Load environment variables from Render environment
const supabaseUrl = process.env.supabaseUrl;
const supabaseKey = process.env.supabaseKey;

// Create and export the Supabase client instance
export const supabase = createClient(supabaseUrl, supabaseKey);
