import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";

import { z } from "zod";
import { CourseStatus } from "@/generated/prisma";
import { auth } from "@/http/middlewares/auth";
import { prisma } from "@/lib/prisma";

export const getMyCourses = (app: FastifyInstance) => {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      "/me/courses",
      {
        schema: {
          tags: ["Courses"],
          summary: "Get current user's courses",
          security: [{ bearerAuth: [] }],
          querystring: z.object({
            title: z.string().optional(),
            status: z.enum(CourseStatus).optional(),
          }),
          response: {
            200: z.object({
              courses: z.array(
                z.object({
                  id: z.uuid(),
                  title: z.string(),
                  slug: z.string(),
                  description: z.string(),
                  imageUrl: z.string().url().nullable(),
                  duration: z.number(),
                  status: z.enum(CourseStatus),
                  createdAt: z.date(),
                  updatedAt: z.date(),
                })
              ),
            }),
          },
        },
      },
      async (request, reply) => {
        const { title, status } = request.query;
        const userId = await request.getCurrentUserId();

        const where = {
          userId,
          ...(title && {
            title: {
              contains: title,
              mode: "insensitive" as const,
            },
          }),
          ...(status && { status }),
        };

        const courses = await prisma.course.findMany({
          where,
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            imageUrl: true,
            duration: true,
            status: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        return reply.send({ courses });
      }
    );
};
