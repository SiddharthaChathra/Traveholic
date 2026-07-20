const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://zvchufelnsnnsenzkilv.supabase.co',
  'sb_publishable_1Enn4uahDwszYy9917bZ5g_QvG0DWEP'
);

async function run() {
  const { data, error } = await supabase.from('posts').select('*').limit(1);
  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Success! Posts exist:", data);
  }
}
run();
