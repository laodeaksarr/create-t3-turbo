import { router } from "../trpc";
import { postRouter } from "./post";
import { authRouter } from "./auth";
import { commentRouter } from "./comment";

export const appRouter = router({
  comment: commentRouter,
  post: postRouter,
  auth: authRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
