const SUPABASE_URL = 'https://bscruhppvicfphqcrdwb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzY3J1aHBwdmljZnBocWNyZHdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2NTA0ODksImV4cCI6MjA5MjIyNjQ4OX0.YPwJyRqNmf8wL8ljZ2dkrwLKU1TfEY-iuSMgC2tB2NY';
 
// Use var to avoid redeclaration conflict with the CDN global
var supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
var supabase = supabaseClient;
 

 
