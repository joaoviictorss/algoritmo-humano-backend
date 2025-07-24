import { hash } from "bcryptjs";

import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";

import { z } from "zod";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";
import { prisma } from "@/lib/prisma";
import { findUserByEmail } from "@/utils";

export const createAccount = (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/users",
    {
      schema: {
        tags: ["Auth"],
        summary: "Create a new account",
        body: z.object({
          name: z.string(),
          email: z.email(),
          password: z.string().min(6),
          avatarUrl: z.url().optional(),
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
      const { name, email, password, avatarUrl } = request.body;

      const userWithSameEmail = await findUserByEmail(email);

      if (userWithSameEmail) {
        throw new BadRequestError(
          "User with same e-mail already exists.",
          "Usuário com este e-mail já existe."
        );
      }

      const passwordHash = await hash(password, 8);

      await prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
          avatarUrl,
        },
      });

      return reply.status(201).send({
        message: "Account created successfully.",
        displayMessage: "Conta criada com sucesso.",
      });
    }
  );
};
