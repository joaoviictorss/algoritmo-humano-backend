import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { CourseStatus } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";

export const getCourseBySlug = (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/courses/:slug",
    {
      schema: {
        tags: ["Courses"],
        summary: "Get course by slug",
        params: z.object({
          slug: z.string(),
        }),
        response: {
          200: z.object({
            id: z.uuid(),
            title: z.string(),
            slug: z.string(),
            description: z.string(),
            imageUrl: z.url().nullable(),
            duration: z.number(),
            status: z.enum(CourseStatus),
            createdAt: z.date(),
            updatedAt: z.date(),
            author: z.object({
              id: z.uuid(),
              name: z.string().nullable(),
              email: z.email(),
            }),
          }),
          404: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { slug } = request.params;

      const course = await prisma.course.findFirst({
        where: {
          slug,
          status: "ACTIVE",
        },
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
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!course) {
        return reply.status(404).send({
          message: "Curso não encontrado",
        });
      }

      return reply.send({
        ...course,
        author: course.user,
      });
    }
  );
};
