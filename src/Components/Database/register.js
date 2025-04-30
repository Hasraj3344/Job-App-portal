import { supabase } from './database.js'; // or wherever you initialized it

const testConnection = async () => {
  const { data, error } = await supabase.from('users').select('*').limit(1);

  if (error) {
    console.error('❌ Database connection failed:', error.message);
  } else {
    console.log('✅ Database connected. Sample user:', data);
  }
};

testConnection();
