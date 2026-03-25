import { ChatScreenWebLayout } from "@/components/screens-component/chat-screen/web-layout";
import { ChatScreenMobileLayout } from "@/components/screens-component/chat-screen/mob-layout";
import { useIsMobile } from "@/hooks/use-mobile";

function ChatScreen() {
  const isMobile = useIsMobile();
  return isMobile ? <ChatScreenMobileLayout /> : <ChatScreenWebLayout />;
}

export default ChatScreen;
