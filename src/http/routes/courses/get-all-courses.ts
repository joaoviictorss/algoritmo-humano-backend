import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";

import { z } from "zod";
import { CourseStatus } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";

type CourseWhereInput = {
  title?: {
    contains: string;
    mode: "insensitive";
  };
  status?: CourseStatus;
};

type CourseOrderBy = {
  [K in "title" | "createdAt" | "updatedAt" | "duration"]?: "asc" | "desc";
};

export const getAllCourses = (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/courses",
    {
      schema: {
        tags: ["Courses"],
        summary: "Get all public courses with optional filters",
        querystring: z.object({
          title: z.string().optional(),
          status: z.enum(CourseStatus).optional(),
          page: z.coerce.number().min(1).default(1),
          limit: z.coerce.number().min(1).max(100).default(10),
          sortBy: z
            .enum(["title", "createdAt", "updatedAt", "duration"])
            .default("createdAt"),
          sortOrder: z.enum(["asc", "desc"]).default("desc"),
        }),
        response: {
          200: z.object({
            courses: z.array(
              z.object({
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
              })
            ),
            pagination: z.object({
              page: z.number(),
              limit: z.number(),
              total: z.number(),
              totalPages: z.number(),
              hasNext: z.boolean(),
              hasPrev: z.boolean(),
            }),
          }),
        },
      },
    },
    async (request, reply) => {
      const { title, status, page, limit, sortBy, sortOrder } = request.query;

      const where: CourseWhereInput = {};

      if (title) {
        where.title = {
          contains: title,
          mode: "insensitive",
        };
      }

      if (status) {
        where.status = status;
      }

      const orderBy: CourseOrderBy = {
        [sortBy]: sortOrder,
      };

      const offset = (page - 1) * limit;

      const [courses, total] = await Promise.all([
        prisma.course.findMany({
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
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy,
          skip: offset,
          take: limit,
        }),
        prisma.course.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);
      const hasNext = page < totalPages;
      const hasPrev = page > 1;

      return reply.send({
        courses: courses.map((course) => ({
          id: course.id,
          title: course.title,
          slug: course.slug,
          description: course.description,
          imageUrl: course.imageUrl,
          duration: course.duration,
          status: course.status,
          createdAt: course.createdAt,
          updatedAt: course.updatedAt,
          author: course.user,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext,
          hasPrev,
        },
      });
    }
  );
};
