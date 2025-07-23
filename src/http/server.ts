import fastifyCors from "@fastify/cors";
import fastifyJwt from "@fastify/jwt";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import fastify from "fastify";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";

import { env } from "@/env";
import {
  authenticateWithPassword,
  createAccount,
  getProfile,
} from "@/routes/auth";

import {
  createCourse,
  deleteCourseBySlug,
  getAllCourses,
  getMyCourses,
  updateCourseBySlug,
} from "@/routes/courses";

import { errorHandler } from "./error-handler";

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.register(fastifyCors, {
  origin: env.FRONTEND_URL,
});
app.setSerializerCompiler(serializerCompiler);
app.setValidatorCompiler(validatorCompiler);
app.setErrorHandler(errorHandler);

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: "Algoritmo Humano",
      description:
        "Uma plataforma para criadores de conteúdo e consultores possam vender seus cursos e treinamentos dentro de suas comunidades.",
      version: "1.0.0",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  transform: jsonSchemaTransform,
});

app.register(fastifySwaggerUi, {
  routePrefix: "/docs",
});

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
});

// Auth
app.register(createAccount);
app.register(authenticateWithPassword);
app.register(getProfile);

// Courses
app.register(getAllCourses);
app.register(getMyCourses);
app.register(createCourse);
app.register(updateCourseBySlug);
app.register(deleteCourseBySlug);

app.get("/health", (_, res) => {
  res.send("OK");
});

app.listen({ port: env.PORT });
