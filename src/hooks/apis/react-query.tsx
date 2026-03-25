import { MutationCache, QueryClient } from "@tanstack/react-query";
import onRequestError from "./componets/on-request-error";

export const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onError: onRequestError
  }),
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});
