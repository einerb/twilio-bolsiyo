import {
  IsString,
  IsNotEmpty,
  ArrayNotEmpty,
  IsNumber,
  IsOptional,
} from "class-validator";

import { User } from "../interfaces";

export default class SendMessageDto {
  @ArrayNotEmpty()
  @IsNotEmpty()
  public user: User;

  @IsString()
  @IsNotEmpty()
  public channel: string;

  @IsNumber()
  public template: number;

  @IsString()
  @IsOptional()
  public bodySMS: string;
}
