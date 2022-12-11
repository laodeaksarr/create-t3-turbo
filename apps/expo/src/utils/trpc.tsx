import { createTRPCReact } from "@trpc/react-query";

/**
 * Extend this function when going to production by
 * setting the baseUrl to your production API URL.
 */
import Constants from "expo-constants";

const getBaseUrl = () => {
  /**
   * Gets the IP address of your host-machine. If it cannot automatically find it,
   * you'll have to manually set it. NOTE: Port 3000 should work for most but confirm
   * you don't have anything else running on it, or you'd have to change it.
   */
  const localhost = Constants.manifest?.debuggerHost?.split(":")[0];
  if (!localhost)
    throw new Error("failed to get localhost, configure it manually");
  return `http://${localhost}:3000`;
};

/**
 * A wrapper for your app that provides the TRPC context.
 * Use only in _app.tsx
 */
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { transformer } from "@aksar/api/transformer";
import { AppRouter, trpcNative } from "@aksar/api";

export const TRPCProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [queryClient] = React.useState(() => new QueryClient());
  const [trpcClient] = React.useState(() =>
    trpcNative.createClient({
      transformer,
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
        }),
      ],
    }),
  );

  return (
    <trpcNative.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpcNative.Provider>
  );
};
