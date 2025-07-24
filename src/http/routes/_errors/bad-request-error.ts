export class BadRequestError extends Error {
  displayMessage: string;

  constructor(message: string, displayMessage?: string) {
    super(message);
    this.name = "BadRequestError";
    this.displayMessage = displayMessage || message;
  }
}
