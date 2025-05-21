import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://opgqrdltnngkhjymgmmy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wZ3FyZGx0bm5na2hqeW1nbW15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2NDY2ODcsImV4cCI6MjA1OTIyMjY4N30.K9p-IjOiYbSDBHlSLuhc7Uy1HQrReec8796x1O2FnlU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 