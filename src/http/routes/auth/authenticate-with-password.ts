import { compare } from "bcryptjs";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { findUserByEmail } from "@/utils";
import { BadRequestError } from "../_errors/bad-request-error";

export const authenticateWithPassword = (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/sessions/password",
    {
      schema: {
        tags: ["Auth"],
        summary: "Authenticate with email & password",
        body: z.object({
          email: z.email(),
          password: z.string(),
        }),
        response: {
          201: z.object({
            token: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { email, password } = request.body;

      const userFromEmail = await findUserByEmail(email);

      if (!userFromEmail) {
        throw new BadRequestError(
          "Invalid credentials.",
          "Email ou senha inválidos."
        );
      }

      if (userFromEmail.passwordHash === null) {
        throw new BadRequestError(
          "User does not have a password, use social login.",
          "Esta conta usa login social. Tente fazer login com Google."
        );
      }

      const isPasswordCorrect = await compare(
        password,
        userFromEmail.passwordHash
      );

      if (!isPasswordCorrect) {
        throw new BadRequestError(
          "Invalid credentials.",
          "Email ou senha inválidos."
        );
      }

      const token = await reply.jwtSign(
        {
          sub: userFromEmail.id,
        },
        {
          sign: {
            expiresIn: "2d",
          },
        }
      );

      return reply.status(200).send({ token });
    }
  );
};
