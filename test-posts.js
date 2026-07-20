import { supabase } from './src/lib/supabase.js';

async function checkPostsTable() {
  const { data, error } = await supabase.from('posts').select('*').limit(1);
  if (error) {
    console.error("Error querying posts table:", error.message);
  } else {
    console.log("Posts table exists! Data:", data);
  }
}

checkPostsTable();
