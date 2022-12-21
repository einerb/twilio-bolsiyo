export default class HttpException extends Error {
  status: number;
  message: string;
  data: string;

  constructor(status: number, message: string, data: string) {
    super(message);
    this.status = status;
    this.message = message;
    this.data = data;
  }
}
