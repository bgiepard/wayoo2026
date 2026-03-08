import { useSession } from "next-auth/react";
import { useClientAsyncInit, StatsigProvider } from "@statsig/react-bindings";
import { StatsigAutoCapturePlugin } from "@statsig/web-analytics";
import { StatsigSessionReplayPlugin } from "@statsig/session-replay";

const STATSIG_CLIENT_KEY = "client-iaiaBy8AKB1LvcJvAlijeRsoZRNZ3LI3Mnde0xYsvaG";

export default function StatsigWrapper({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  const user = session?.user
    ? { userID: (session.user as { id?: string }).id ?? session.user.email ?? undefined, email: session.user.email ?? undefined }
    : {};

  const { client } = useClientAsyncInit(STATSIG_CLIENT_KEY, user, {
    plugins: [new StatsigAutoCapturePlugin(), new StatsigSessionReplayPlugin()],
  });

  return <StatsigProvider client={client}>{children}</StatsigProvider>;
}
