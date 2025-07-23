import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";

import { z } from "zod";
import { CourseStatus } from "@/generated/prisma";
import { auth } from "@/http/middlewares/auth";
import { prisma } from "@/lib/prisma";
import { findCourseBySlug } from "@/utils";
import { BadRequestError } from "../_errors/bad-request-error";
import { UnauthorizedError } from "../_errors/unauthorized-error";

export const updateCourseBySlug = (app: FastifyInstance) => {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .put(
      "/courses/:slug",
      {
        schema: {
          tags: ["Courses"],
          summary: "Update a course by slug",
          security: [{ bearerAuth: [] }],
          body: z.object({
            title: z.string().min(3).optional(),
            description: z.string().optional(),
            imageUrl: z.url().optional(),
            duration: z.number().optional(),
            status: z
              .enum(CourseStatus)
              .optional()
              .default(CourseStatus.ACTIVE),
          }),
          params: z.object({
            slug: z.string(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { slug } = request.params;
        const { title, description, imageUrl, duration, status } = request.body;

        const userId = await request.getCurrentUserId();

        const course = await findCourseBySlug(slug);

        if (!course) {
          throw new BadRequestError("Course not found.");
        }

        const userIsCourseOwner = course.userId === userId;

        if (!userIsCourseOwner) {
          throw new UnauthorizedError("You are not the owner of this course.");
        }

        await prisma.course.update({
          where: {
            id: course.id,
          },
          data: {
            title,
            description,
            imageUrl,
            duration,
            status,
          },
        });

        return reply.status(204).send();
      }
    );
};
