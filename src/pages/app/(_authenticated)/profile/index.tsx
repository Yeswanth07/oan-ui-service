import { ProfileWebLayout } from "@/components/screens-component/profile/web-layout";
import { ProfileMobileLayout } from "@/components/screens-component/profile/mob-layout";
import { useIsMobile } from "@/hooks/use-mobile";

function Profile() {
  const isMobile = useIsMobile();
  return isMobile ? <ProfileMobileLayout /> : <ProfileWebLayout />;
}

export default Profile;
