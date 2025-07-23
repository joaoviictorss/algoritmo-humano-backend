import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import { auth } from "@/http/middlewares/auth";
import { UnauthorizedError } from "@/http/routes/_errors/unauthorized-error";
import { prisma } from "@/lib/prisma";
import { findCourseBySlug } from "@/utils";
import { BadRequestError } from "../_errors/bad-request-error";

export function deleteCourseBySlug(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .delete(
      "/courses/:slug",
      {
        schema: {
          tags: ["Courses"],
          summary: "Delete a course by slug",
          security: [{ bearerAuth: [] }],
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
        const userId = await request.getCurrentUserId();

        const course = await findCourseBySlug(slug);

        if (!course) {
          throw new BadRequestError("Course not found.");
        }

        const userIsCourseOwner = course.userId === userId;

        if (!userIsCourseOwner) {
          throw new UnauthorizedError("You are not the owner of this course.");
        }

        await prisma.course.delete({
          where: {
            id: course.id,
          },
        });

        return reply.status(204).send();
      }
    );
}
