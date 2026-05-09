import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vqtjtvnfwxibgozadfny.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || 'sb_publishable_59YECfWJ68b094G5CzF6fA_14U2ZIu0'

export const supabase = createClient(supabaseUrl, supabaseKey)
