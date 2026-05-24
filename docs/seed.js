// Run this after schema.sql has been applied to Supabase
// Usage: node docs/seed.js
// Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env

import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const seed = async () => {
  // Get the test organisation ID
  const { data: org } = await supabase
    .from('organisations')
    .select('id')
    .eq('name', 'Test Company')
    .single()

  if (!org) {
    console.error('Test Company organisation not found. Run schema.sql first.')
    process.exit(1)
  }

  const users = [
    { email: 'super@incodere.com', password: 'SuperAdmin123!', role: 'super_admin', first_name: 'Super', last_name: 'Admin', org_id: null },
    { email: 'admin@testcompany.com', password: 'Admin123!', role: 'company_admin', first_name: 'Company', last_name: 'Admin', org_id: org.id },
    { email: 'learner@testcompany.com', password: 'Learner123!', role: 'learner', first_name: 'Test', last_name: 'Learner', org_id: org.id },
  ]

  for (const u of users) {
    const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
    })

    if (authErr) {
      console.error(`Failed to create auth user ${u.email}:`, authErr.message)
      continue
    }

    console.log(`Created auth user: ${u.email}`)

    const { error: dbErr } = await supabase.from('users').insert({
      id: authUser.user.id,
      email: u.email,
      role: u.role,
      organisation_id: u.org_id,
      first_name: u.first_name,
      last_name: u.last_name,
    })

    if (dbErr) {
      console.error(`Failed to insert public user ${u.email}:`, dbErr.message)
    } else {
      console.log(`Inserted public user: ${u.email}`)
    }
  }

  console.log('Seed complete. Test credentials:')
  console.log('  super@incodere.com / SuperAdmin123!')
  console.log('  admin@testcompany.com / Admin123!')
  console.log('  learner@testcompany.com / Learner123!')
}

seed().catch(console.error)
