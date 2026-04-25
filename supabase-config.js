const SUPABASE_URL = 'https://bscruhppvicfphqcrdwb.supabase.co';
const SUPABASE_KEY = 'sb_publishable_1AQAROauXL4mn8HMfiBCBg_X4HkOw_R';

// @supabase/supabase-js v2 UMD bundle exposes window.supabase
const { createClient } = window.supabase;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
