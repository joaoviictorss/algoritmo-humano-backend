/** biome-ignore-all lint/suspicious/noConsole: Only for development */
import { faker } from "@faker-js/faker";
import { hash } from "bcryptjs";
import { CourseStatus, PrismaClient } from "../src/generated/prisma";
import { slugify } from "../src/utils";

const prisma = new PrismaClient();

async function seed() {
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await hash("123456", 1);

  const mainUser = await prisma.user.create({
    data: {
      name: "Jhon Doe",
      email: "jhon@example.com",
      avatarUrl:
        "https://avatars.githubusercontent.com/u/137708191?s=400&u=b2a2ae6ebb2b3f05d221ddaf2d3c627088c36c59&v=4",
      passwordHash,
    },
  });

  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        avatarUrl: faker.image.avatarGitHub(),
        passwordHash,
      },
    }),
    prisma.user.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        avatarUrl: faker.image.avatarGitHub(),
        passwordHash,
      },
    }),
    prisma.user.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        avatarUrl: faker.image.avatarGitHub(),
        passwordHash,
      },
    }),
  ]);

  const allUsers = [mainUser, ...users];

  // Títulos de cursos realistas
  const courseTitles = [
    "JavaScript Fundamentos Completo",
    "React.js do Zero ao Avançado",
    "Node.js e Express para Iniciantes",
    "TypeScript na Prática",
    "MongoDB e Banco de Dados NoSQL",
    "Python para Data Science",
    "Docker e Containerização",
    "Git e GitHub Essencial",
    "CSS Grid e Flexbox Moderno",
    "Vue.js 3 Composition API",
    "Next.js Full Stack Development",
    "GraphQL com Apollo Server",
    "Jest - Testes Automatizados",
    "AWS Cloud Computing Básico",
    "Figma para Desenvolvedores",
    "API REST com Fastify",
    "PostgreSQL Avançado",
    "Sass e Pré-processadores CSS",
    "Prisma ORM Completo",
    "Deploy e DevOps para Desenvolvedores",
  ];

  // Criar cursos
  const courses = await Promise.all(
    courseTitles.map((title) => {
      const description = faker.lorem.paragraphs(2, "\n\n");
      const duration = faker.number.int({ min: 30, max: 480 }); // 30min a 8h
      const status = faker.helpers.arrayElement(Object.values(CourseStatus));
      const userId = faker.helpers.arrayElement(allUsers).id;

      return prisma.course.create({
        data: {
          title,
          slug: slugify(title),
          description,
          imageUrl: faker.image.urlPicsumPhotos({
            width: 800,
            height: 600,
          }),
          duration,
          status,
          userId,
        },
      });
    })
  );

  // Criar alguns cursos específicos para o usuário principal
  await Promise.all([
    prisma.course.create({
      data: {
        title: "Meu Curso de FastAPI Avançado",
        slug: slugify("Meu Curso de FastAPI Avançado"),
        description:
          "Um curso completo sobre FastAPI para desenvolvimento de APIs modernas e eficientes.",
        imageUrl: "https://picsum.photos/800/600?random=100",
        duration: 120,
        status: CourseStatus.ACTIVE,
        userId: mainUser.id,
      },
    }),
    prisma.course.create({
      data: {
        title: "Prisma e Database Design",
        slug: slugify("Prisma e Database Design"),
        description:
          "Aprenda a modelar bancos de dados eficientes usando Prisma ORM.",
        imageUrl: "https://picsum.photos/800/600?random=101",
        duration: 90,
        status: CourseStatus.ACTIVE,
        userId: mainUser.id,
      },
    }),
    prisma.course.create({
      data: {
        title: "Curso em Desenvolvimento",
        slug: slugify("Curso em Desenvolvimento"),
        description:
          "Este curso ainda está sendo desenvolvido. Em breve teremos mais conteúdo.",
        imageUrl: null,
        duration: 60,
        status: CourseStatus.INACTIVE,
        userId: mainUser.id,
      },
    }),
  ]);

  console.log("Database seeded successfully!");
  console.log(`Created ${allUsers.length} users`);
  console.log(`Created ${courses.length + 3} courses`);
  console.log("\nLogin credentials:");
  console.log("Email: jhon@example.com");
  console.log("Password: 123456");
}

seed()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
