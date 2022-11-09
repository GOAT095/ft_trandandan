import { IsEnum, IsNotEmpty, IsNumber, IsNumberString, IsOptional, IsString, MinLength, MaxLength } from 'class-validator';
import { Access_type } from "../utils/acces.type.enum";

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  public name: string;

  @IsNotEmpty()
  public id: number;

  @IsString()
  @IsNotEmpty()
  public email: string;
}

export class CreateRoomDto {
  @IsString()
  @IsNotEmpty()
  public name: string;

  @IsNotEmpty()
  public owner: number;

  @IsString()
  @IsEnum(Access_type)
  public type: Access_type;

  @IsString()
  @MinLength(8)
  @MaxLength(32)
  @IsOptional()
  public password: string;
}

export class RoomAdminstrationDto {
  @IsNumberString()
  @IsNotEmpty()
  public roomId: number;

  @IsNumberString()
  @IsNotEmpty()
  public playerId: number;
}

export class RoomDto {
  @IsNumberString()
  @IsNotEmpty()
  public roomId: number;
}

export class PasswordDto {
    @IsString()
    @MinLength(8)
    @MaxLength(32)
    password: string;
}