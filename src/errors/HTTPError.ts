export class HTTPError extends Error {
  constructor(
    public status: number,
    public code: string,
    message?: string
  ) {
    super(message ?? code)
    Object.setPrototypeOf(this, new.target.prototype)
  }
}
