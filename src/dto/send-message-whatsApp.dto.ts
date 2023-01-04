import { IsString, IsNotEmpty, ArrayNotEmpty, IsNumber } from "class-validator";

import { User } from "../interfaces";

export default class SendMessageWhatsAppDto {
  @ArrayNotEmpty()
  @IsNotEmpty()
  public user: User;

  @IsNumber()
  public template: number;
}
