import { router, publicProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import crypto from "crypto";

const getPermaLink = (title: string) =>
  title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const postRouter = router({
  all: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.post.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
      },
    });
  }),
  timeline: publicProcedure
    .input(
      z.object({
        where: z
          .object({
            user: z
              .object({
                name: z.string().optional(),
              })
              .optional(),
          })
          .optional(),
        cursor: z.string().nullish(),
        limit: z.number().min(1).max(100).default(10),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { prisma, session } = ctx;
      const { cursor, limit, where } = input;

      const userId = session?.user?.id;

      const posts = await prisma.post.findMany({
        take: limit + 1,
        where,
        orderBy: [
          {
            createdAt: "desc",
          },
        ],
        cursor: cursor ? { id: cursor } : undefined,
        include: {
          likes: {
            where: {
              userId,
            },
            select: {
              userId: true,
            },
          },
          user: {
            select: {
              name: true,
              image: true,
              id: true,
            },
          },
          _count: {
            select: {
              likes: true,
            },
          },
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;

      if (posts.length > limit) {
        const nextItem = posts.pop() as typeof posts[number];

        nextCursor = nextItem.id;
      }

      return {
        posts,
        nextCursor,
      };
    }),
  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const { prisma } = ctx;
      const { slug } = input;

      const post = await prisma.post.findUnique({
        where: {
          slug,
        },
        select: {
          title: true,
          content: true,
          createdAt: true,
          user: {
            select: {
              name: true,
            },
          },
        },
      });

      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
        });
      }

      return post;
    }),
  create: protectedProcedure
    .input(z.object({ title: z.string(), content: z.string() }))
    .mutation(({ ctx, input }) => {
      const { prisma, session } = ctx;
      const { title, content } = input;

      const slug = `${getPermaLink(title)}-${crypto
        .randomBytes(2)
        .toString("hex")}`;

      const userId = session.user.id;

      return prisma.post.create({
        data: {
          title,
          content,
          /*: sanitizeHtml(body, {
            allowedTags: ["b", "i", "em", "strong", "a"],
            allowedAttributes: {
              a: ["href"],
            },
            allowedIframeHostnames: ["www.youtube.com"],
          }),*/
          slug,
          user: {
            connect: {
              id: userId,
            },
          },
        },
      });
    }),
  like: protectedProcedure
    .input(
      z.object({
        postId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { prisma, session } = ctx;
      const { postId } = input;

      const userId = session.user.id;

      return prisma.like.create({
        data: {
          post: {
            connect: {
              id: postId,
            },
          },
          user: {
            connect: {
              id: userId,
            },
          },
        },
      });
    }),
  unlike: protectedProcedure
    .input(
      z.object({
        postId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { prisma, session } = ctx;
      const { postId } = input;

      const userId = session.user.id;

      return prisma.like.delete({
        where: {
          postId_userId: {
            postId,
            userId,
          },
        },
      });
    }),
});
