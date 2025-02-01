import { getProfile } from "@/services/employees.service";
import { ProfileForm } from "./profile-form";

export default async function SettingsProfilePage() {
  const profile = await getProfile()

  return <ProfileForm profile={profile} />;
}
