import { createClient } from '@/lib/supabase/server';
import Header from '@/components/layout/Header';
import Badge from '@/components/ui/Badge';
import RoomsClient from './RoomsClient';
import { roleBadgeColor } from '@/lib/rbac';

export const dynamic = 'force-dynamic';

export default async function AdminRoomsPage() {
  const supabase = createClient();
  const [
    { data: rooms },
    { data: mappings },
    { data: subjects },
    { data: classes },
  ] = await Promise.all([
    supabase.from('rooms').select('*').order('building').order('floor').order('name'),
    // Admin sees ALL mappings (no auto-expiry filter).
    supabase.from('room_mappings').select('*').order('day_of_week').order('start_time'),
    supabase.from('subjects').select('*').order('name'),
    supabase.from('classes').select('*').order('name'),
  ]);

  return (
    <div>
      <Header
        title="Room Mapping System"
        description="Manage rooms and assign subjects to time slots. Admin view shows ALL mappings (no auto-expiry)."
      >
        <Badge className={roleBadgeColor('ADMIN')}>Admin Only</Badge>
      </Header>
      <RoomsClient
        rooms={rooms ?? []}
        mappings={mappings ?? []}
        subjects={subjects ?? []}
        classes={classes ?? []}
      />
    </div>
  );
}
