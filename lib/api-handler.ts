import { NextRequest, NextResponse } from "next/server";
import { ApiError } from "./errors";
import { z } from "zod";

type RouteHandler<TContext = unknown, TBody = unknown> = (
  req: NextRequest & { parsedBody: TBody },
  context: TContext
) => Promise<NextResponse>;

export function apiHandler<TContext = unknown, TBody = unknown>(
  handler: RouteHandler<TContext, TBody>,
  schema?: z.ZodSchema<TBody>
) {
  return async (req: NextRequest, context: TContext) => {
    try {
      let parsedBody = {} as TBody;

      if (schema) {
        let json;
        try {
          json = await req.json();
        } catch (err) {
          throw new ApiError(400, "Invalid JSON payload");
        }

        const result = schema.safeParse(json);
        if (!result.success) {
          const issues = result.error.issues
            .map((issue) => `${issue.message}`)
            .join(", ");
          throw new ApiError(400, issues);
        }
        parsedBody = result.data;
      }

      const extendedReq = Object.assign(req, { parsedBody });
      return await handler(extendedReq, context);
    } catch (err) {
      console.error(err);

      if (err instanceof ApiError) {
        return NextResponse.json(
          { success: false, message: err.message },
          { status: err.status }
        );
      }

      // Handle invalid JSON parsing errors (from await req.json() calls without schema)
      if (err instanceof SyntaxError) {
        return NextResponse.json(
          { success: false, message: "Invalid JSON payload" },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { success: false, message: "Internal Server Error" },
        { status: 500 }
      );
    }
  };
}