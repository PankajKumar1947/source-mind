export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}

export class ActionError extends Error {
  constructor(message: string) {
    super(message);
  }
}