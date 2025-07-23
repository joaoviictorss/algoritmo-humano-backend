import { prisma } from "@/lib/prisma";

export const findCourseBySlug = async (slug: string) => {
  const course = await prisma.course.findUnique({
    where: {
      slug,
    },
  });

  return course;
};
