import { IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  public name: string;

  @IsNotEmpty()
  public id: number;

  @IsString()
  @IsNotEmpty()
  public avatar: string;
}
