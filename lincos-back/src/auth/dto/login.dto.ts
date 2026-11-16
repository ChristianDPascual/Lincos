import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty({ message: 'Ingresá tu correo o nombre de usuario' })
  usuario: string; // acepta correo o nombre de usuario

  @IsString()
  @IsNotEmpty({ message: 'Ingresá tu contraseña' })
  password: string;
}