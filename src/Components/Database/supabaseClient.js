import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://vrlcbpznvqqqogdwhbuv.supabase.co'
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZybGNicHpudnFxcW9nZHdoYnV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyNjQxMDYsImV4cCI6MjA2MDg0MDEwNn0.3GkcwfpmHcRXOz7udgBWJBcaSaYx2GOggQOQ06-epWI"
export const supabase = createClient(supabaseUrl, supabaseKey)


  