import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rswuojsebxrzwfnwpsei.supabase.co'
const supabaseKey = 'sb_publishable_eQj1gRYYUjaxLKtmBjS1CQ_jhcXAxpl'

export const supabase = createClient(supabaseUrl, supabaseKey)