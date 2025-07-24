import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";

import { z } from "zod";
import { CourseStatus } from "@/generated/prisma";
import { auth } from "@/http/middlewares/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/utils";

export const createCourse = (app: FastifyInstance) => {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      "/courses",
      {
        schema: {
          tags: ["Courses"],
          summary: "Create a new course",
          security: [{ bearerAuth: [] }],
          body: z.object({
            title: z.string().min(3),
            description: z.string(),
            imageUrl: z.url().optional(),
            duration: z.number(),
            status: z
              .enum(CourseStatus)
              .optional()
              .default(CourseStatus.ACTIVE),
          }),
          response: {
            201: z.object({
              message: z.string(),
              displayMessage: z.string(),
            }),
          },
        },
      },
      async (request, reply) => {
        const { title, description, imageUrl, duration, status } = request.body;

        const userId = await request.getCurrentUserId();

        await prisma.course.create({
          data: {
            title,
            description,
            slug: slugify(title),
            imageUrl: imageUrl || null,
            duration,
            status,
            userId,
          },
        });

        return reply.status(201).send({
          message: "Course created successfully.",
          displayMessage: "Curso criado com sucesso.",
        });
      }
    );
};
