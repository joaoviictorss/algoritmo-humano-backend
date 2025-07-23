import type { FastifyInstance } from "fastify";

import { BadRequestError } from "@/http/routes/_errors/bad-request-error";
import { UnauthorizedError } from "@/http/routes/_errors/unauthorized-error";
import { hasZodFastifySchemaValidationErrors } from "fastify-type-provider-zod";

type FastifyErrorHandler = FastifyInstance["errorHandler"];

export const errorHandler: FastifyErrorHandler = (error, _, reply) => {
  if (hasZodFastifySchemaValidationErrors(error)) {
    const validationErrors = error.validation.map((validationError) => {
      const field = validationError.instancePath.replace("/", "") || "root";
      return {
        field,
        message: validationError.message,
      };
    });

    return reply.code(400).send({
      error: "Validation Error",
      message: "Request doesn't match the schema",
      statusCode: 400,
      errors: validationErrors,
    });
  }

  if (error instanceof BadRequestError) {
    return reply.status(400).send({
      error: "Bad Request",
      message: error.message,
      statusCode: 400,
    });
  }

  if (error instanceof UnauthorizedError) {
    return reply.status(401).send({
      error: "Unauthorized",
      message: error.message,
      statusCode: 401,
    });
  }

  // biome-ignore lint/suspicious/noConsole: Only for debugging
  console.error(error);

  // todo: send error to some observability platform

  return reply.status(500).send({
    error: "Internal Server Error",
    message: "Internal server error",
    statusCode: 500,
  });
};
