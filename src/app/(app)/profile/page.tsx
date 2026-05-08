import { requireSession } from '@/lib/auth';
import Header from '@/components/layout/Header';
import Badge from '@/components/ui/Badge';
import ProfileForm from './ProfileForm';
import { roleBadgeColor, roleLabel } from '@/lib/rbac';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const { profile } = await requireSession();
  return (
    <div>
      <Header title="Profile" description="Manage your personal information.">
        <Badge className={roleBadgeColor(profile.role)}>{roleLabel(profile.role)}</Badge>
      </Header>
      <ProfileForm profile={profile} />
    </div>
  );
}
