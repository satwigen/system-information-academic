/**
 * Creates the 4 demo accounts (one per role) in Supabase Auth and wires them
 * to departments / classes in the `profiles` table.
 *
 * Usage:
 *   npm i
 *   npm run seed:users
 *
 * Requires in .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!url || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

interface Seed {
  email: string;
  password: string;
  full_name: string;
  role: 'ADMIN' | 'HEAD' | 'DOSEN' | 'STUDENT';
  department_id?: string;
  class_id?: string;
  nim?: string;
  nip?: string;
}

const seeds: Seed[] = [
  {
    email: 'admin@siakad.test',
    password: 'Admin#123',
    full_name: 'Sarah Admin',
    role: 'ADMIN',
    nip: 'ADM-0001',
  },
  {
    email: 'head@siakad.test',
    password: 'Head#123',
    full_name: 'Dr. Ahmad Wibowo',
    role: 'HEAD',
    department_id: 'd1111111-1111-1111-1111-111111111111', // IT
    nip: 'HEAD-0001',
  },
  {
    email: 'dosen@siakad.test',
    password: 'Dosen#123',
    full_name: 'Yudi Permana, M.Kom',
    role: 'DOSEN',
    department_id: 'd1111111-1111-1111-1111-111111111111', // IT
    nip: 'DOS-0001',
  },
  {
    email: 'student@siakad.test',
    password: 'Student#123',
    full_name: 'Ahmad Rizki Pratama',
    role: 'STUDENT',
    department_id: 'd1111111-1111-1111-1111-111111111111', // IT
    class_id: '11111111-0000-0000-0000-000000000001',       // IT-1A
    nim: '2024IT001',
  },
];

async function main() {
  for (const s of seeds) {
    console.log(`\nSeeding ${s.role.padEnd(7)} ${s.email}`);

    // Create or fetch the auth user.
    let userId: string | undefined;

    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email: s.email,
      password: s.password,
      email_confirm: true,
      user_metadata: { full_name: s.full_name, role: s.role },
    });

    if (createErr) {
      if (/already been registered|already registered|duplicate/i.test(createErr.message)) {
        const { data: list } = await admin.auth.admin.listUsers();
        userId = list.users.find((u) => u.email === s.email)?.id;
        console.log('  exists, reusing', userId);
      } else {
        console.error('  createUser failed:', createErr.message);
        continue;
      }
    } else {
      userId = created.user?.id;
      console.log('  created', userId);
    }

    if (!userId) continue;

    // Sync profile fields. The trigger auto-creates the base row.
    const { error: updErr } = await admin
      .from('profiles')
      .update({
        role: s.role,
        full_name: s.full_name,
        email: s.email,
        department_id: s.department_id ?? null,
        class_id: s.class_id ?? null,
        nim: s.nim ?? null,
        nip: s.nip ?? null,
      })
      .eq('id', userId);

    if (updErr) console.error('  profile update failed:', updErr.message);
    else console.log('  profile updated');
  }

  // Link department heads.
  await admin
    .from('departments')
    .update({ head_id: (await admin.auth.admin.listUsers()).data.users.find((u) => u.email === 'head@siakad.test')?.id })
    .eq('id', 'd1111111-1111-1111-1111-111111111111');

  console.log('\nDone. Demo accounts:');
  for (const s of seeds) console.log(`  ${s.role.padEnd(7)} ${s.email}  /  ${s.password}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
