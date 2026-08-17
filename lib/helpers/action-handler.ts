import { ZodType } from "zod";

export type ActionState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
  [key: string]: any;
};

export function actionHandler<T>(
  handler: (input: T) => Promise<ActionState>,
  schema: ZodType<T>
) {
  return async (
    firstArg: ActionState | FormData | T,
    secondArg?: FormData
  ): Promise<ActionState> => {
    try {
      let input = firstArg;
      if (secondArg instanceof FormData) {
        input = secondArg;
      }

      let parsedInput: unknown = input;
      if (input instanceof FormData) {
        parsedInput = Object.fromEntries(input.entries());
      }

      const result = schema.safeParse(parsedInput);

      if (!result.success) {
        const formattedErrors = result.error.issues.reduce<Record<string, string[]>>((acc, issue) => {
          const path = issue.path.join(".");
          if (!acc[path]) {
            acc[path] = [];
          }
          acc[path].push(issue.message);
          return acc;
        }, {});

        return {
          success: false,
          message: "Validation failed.",
          errors: formattedErrors,
        };
      }

      return await handler(result.data);
    } catch (err) {
      console.error(err);

      return {
        success: false,
        message: "An unexpected error occurred.",
      };
    }
  };
}