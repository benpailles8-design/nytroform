import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vqtjtvnfwxibgozadfny.supabase.co'
const supabaseKey = 'sb_publishable_59YECfWJ68b094G5CzF6fA_14U2ZIu0'

export const supabase = createClient(supabaseUrl, supabaseKey)
