const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://lvjsggjaemlfabhlsfdi.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2anNnZ2phZW1sZmFiaGxzZmRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2NTk1MzUsImV4cCI6MjA5NTIzNTUzNX0.ePIV6Po6jkn9JO1DVxB9FQDzG-vVVv-uGcvTRrJnA60'

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  try {
    console.log('--- GETTING POLICIES FOR TABLA: objetivos ---')
    // We can query pg_policies by calling a custom query or executing via rpc,
    // but if we don't have rpc we can't do arbitrary SQL directly via the client unless we have a postgres function.
    // Let's check if we can select from information_schema or similar.
    // Actually, let's check if we can call a search with a service key? We don't have it.
    // Let's check what tables and schemas are returned.
    
    // Instead of querying pg_policies (which requires admin/postgres permissions),
    // let's try to insert a test goal with visibility = 'Compartido' for another user ID,
    // and see if we can read it. But we cannot write as another user due to insert policy (auth.uid() = user_id).
    
    // Wait, let's query public perfiles again to see if we can see any objectives.
    // If the RLS fix was run, we should be able to see the goals.
    
    // Let's write a script that checks what tables are visible, or let's try to check pg_policies via a direct query.
    // Wait, anon key cannot query pg_policies (it gets permission denied).
    // Let's check if the query to objetivos table returns anything when we try to select.
    // If we select from 'objetivos', it is empty.
    
    console.log('Testing reading all perfiles...')
    const { data: profiles } = await supabase.from('perfiles').select('*')
    console.log('Number of profiles found:', profiles ? profiles.length : 0)

    console.log('Testing reading all objetivos...')
    const { data: goals } = await supabase.from('objetivos').select('*')
    console.log('Number of goals found:', goals ? goals.length : 0)
    
  } catch (err) {
    console.error(err)
  }
}

test()
