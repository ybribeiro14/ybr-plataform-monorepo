import { z } from "zod";

const successResponse = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    status: z.literal("success"),
    message: z.string(),
    data: dataSchema,
  });

const errorResponse = () =>
  z.object({
    status: z.literal("error"),
    message: z.string(),
    errors: z.array(
      z.object({
        code: z.string(),
        detail: z.string(),
      }),
    ),
  });

const RESPONSE_401 = errorResponse();
const RESPONSE_403 = errorResponse();
const RESPONSE_404 = errorResponse();
const RESPONSE_422 = errorResponse();
const RESPONSE_500 = errorResponse();

export {
  errorResponse,
  RESPONSE_401,
  RESPONSE_403,
  RESPONSE_404,
  RESPONSE_422,
  RESPONSE_500,
  successResponse,
};
