import { queryClient } from "@/hooks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
export type TRouterContext = {
  queryClient: QueryClient;
  // add your global data here if needed:
  // serverConfig: ServerConfig | null;
};
import { useThemeStore } from "@/hooks/store/theme";

const RootPage = () => {
    // Just call to ensure store is initialized and effect runs if any
    useThemeStore(); 

    return (
        <QueryClientProvider client={queryClient}>
            {import.meta.env.DEV && (
                <>
                    <ReactQueryDevtools buttonPosition="bottom-left" />
                    <TanStackRouterDevtools position="bottom-right" />
                </>
            )}
            <Outlet />
        </QueryClientProvider>
    );
};
export const Route = createRootRouteWithContext<TRouterContext>()({
  component: RootPage,
  // optional global prefetch  :contentReference[oaicite:4]{index=4}
  // beforeLoad: async ({ context }) => {
  //   const serverConfig = await context.queryClient.ensureQueryData({...})
  //   return { serverConfig }
  // },
});