import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, publicProcedure, createTRPCRouter } from "../trpc";

export const commentRouter = createTRPCRouter({
  all: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const { prisma } = ctx;
      const { slug } = input;

      try {
        const comments = await prisma.comment.findMany({
          where: {
            Post: {
              slug,
            },
          },
          include: {
            user: true,
          },
        });

        return comments;
      } catch (e) {
        console.log(e);
        throw new TRPCError({
          code: "BAD_REQUEST",
        });
      }
    }),
  addComment: protectedProcedure
    .input(
      z.object({
        body: z.string(),
        slug: z.string(),
        parentId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { prisma, session } = ctx;
      const { body, slug, parentId } = input;

      const userId = session.user.id;

      try {
        const comment = await prisma.comment.create({
          data: {
            body,
            Post: {
              connect: {
                slug,
              },
            },
            user: {
              connect: {
                id: userId,
              },
            },
            ...(parentId && {
              parent: {
                connect: {
                  id: parentId,
                },
              },
            }),
          },
        });
        return comment;
      } catch (e) {
        console.log(e);

        throw new TRPCError({
          code: "BAD_REQUEST",
        });
      }
    }),
});
