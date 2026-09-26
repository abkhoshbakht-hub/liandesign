import { Card } from "@/components/ui/card";
import { getMyProfile } from "@/lib/data/settings";
import SettingsForms from "@/components/dashboard/SettingsForms";

export default async function SettingsPage() {
  const profile = await getMyProfile().catch(() => null);

  return (
    <Card className="p-6">
      <div className="text-sm font-bold text-white mb-4">تنظیمات</div>
      {profile ? (
        <SettingsForms name={profile.name} email={profile.email} />
      ) : (
        <p className="text-xs text-white/40">ابتدا وارد شوید.</p>
      )}
    </Card>
  );
}
