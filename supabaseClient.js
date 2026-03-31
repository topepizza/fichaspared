import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = 'https://sejtaomnhcjgelamtii.supabase.co'
const supabaseKey = 'PEGA_AQUI_TU_CLAVE_PUBLICABLE'

export const supabase = createClient(supabaseUrl, supabaseKey)
