import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { Ingreso, IngresoSchema } from './entities/ingreso.entity';

@Module({
  imports: [
    UsuariosModule,
    MongooseModule.forFeature([{ name: Ingreso.name, schema: IngresoSchema }]),
    // registerAsync lee el .env cuando la app arranca, y no antes de que ConfigModule lo cargue
    JwtModule.registerAsync({
      global: true, // el guard de otros módulos también va a poder verificar tokens
      useFactory: () => ({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: 60 * 3 }, // 15 minutos (en segundos)
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [MongooseModule], // Estadísticas va a usar el modelo Ingreso
})
export class AuthModule {}