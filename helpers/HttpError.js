export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }

  static notFound(message = 'Not found') {
    return new HttpError(404, message);
  }

  static badRequest(message = 'Bad request') {
    return new HttpError(400, message);
  }
}
