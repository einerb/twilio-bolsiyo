import { IsString, IsNotEmpty, ArrayNotEmpty } from "class-validator";

import { User } from "../interfaces";

export default class SendMessageWhatsAppDto {
  @ArrayNotEmpty()
  @IsNotEmpty()
  public user: User;

  @IsString()
  @IsNotEmpty()
  public channel: string;
}
