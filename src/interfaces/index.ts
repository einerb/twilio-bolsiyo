export interface User {
  name: string;
  phone: string;
}
export interface ResponseMessage {
  user: User[];
  channel: string;
}
