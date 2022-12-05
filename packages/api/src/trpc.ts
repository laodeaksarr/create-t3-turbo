import { inferRouterInputs, inferRouterOutputs, initTRPC, TRPCError } from "@trpc/server";
import { type Context } from "./context";
import superjson from "superjson";
import { type AppRouter } from "./router";

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Not authenticated",
    });
  }

  return next({
    ctx: {
      session: ctx.session,
    },
  });
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);

/**
 * Inference helpers for input types
 * @example type HelloInput = RouterInputs['example']['hello']
 **/
 export type RouterInputs = inferRouterInputs<AppRouter>;

 /**
  * Inference helpers for output types
  * @example type HelloOutput = RouterOutputs['example']['hello']
  **/
 export type RouterOutputs = inferRouterOutputs<AppRouter>;
 