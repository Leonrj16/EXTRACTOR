import { IsEmail, IsString, MaxLength } from 'class-validator';

export class SubmitContactDto {
  @IsString()
  linkId!: string;

  @IsString()
  @MaxLength(100)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MaxLength(1000)
  message!: string;
}
