import { supabase } from './supabaseClient';

export const registerUser = async (dataToSubmit) => {
  try {
    const { data, error } = await supabase
      .from('users') // ensure your table is named 'users'
      .insert([dataToSubmit]);

    if (error) {
      console.error('❌ Supabase insert error:', error.message);
      throw error;
    }

    console.log('✅ Inserted into Supabase:', data);
    return data;
  } catch (err) {
    console.error('❌ registerUser caught error:', err);
    throw err;
  }
};
