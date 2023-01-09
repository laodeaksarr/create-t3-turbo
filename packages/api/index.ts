export { appRouter, type AppRouter } from "./src/root";
export { createTRPCContext } from "./src/trpc";

export type { RouterInputs, RouterOutputs } from "./src/client";

export { api } from "./src/client";
export { trpc as trpcNative } from "./src/client/index.native";
