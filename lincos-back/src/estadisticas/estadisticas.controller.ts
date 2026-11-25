import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { EstadisticasService } from './estadisticas.service';
import { PeriodoDto } from './dto/periodo.dto';
import { AuthGuard } from '../guards/auth/auth.guard';
import { AdminGuard } from '../guards/admin/admin.guard';

// Todas las rutas por GET, solo para administradores (lo pide el TP).
// Todas reciben ?desde=AAAA-MM-DD&hasta=AAAA-MM-DD
@Controller('estadisticas')
@UseGuards(AuthGuard, AdminGuard)
export class EstadisticasController {
  constructor(private readonly estadisticasService: EstadisticasService) {}

  // ---------- Sprint 4 ----------

  @Get('publicaciones-por-usuario')
  publicacionesPorUsuario(@Query() periodo: PeriodoDto) {
    return this.estadisticasService.publicacionesPorUsuario(periodo);
  }

  @Get('comentarios-por-dia')
  comentariosPorDia(@Query() periodo: PeriodoDto) {
    return this.estadisticasService.comentariosPorDia(periodo);
  }

  @Get('comentarios-por-publicacion')
  comentariosPorPublicacion(@Query() periodo: PeriodoDto) {
    return this.estadisticasService.comentariosPorPublicacion(periodo);
  }

  // ---------- Sprint 5 ----------

  @Get('ingresos-por-usuario')
  ingresosPorUsuario(@Query() periodo: PeriodoDto) {
    return this.estadisticasService.ingresosPorUsuario(periodo);
  }

  @Get('visitas-por-perfil')
  visitasPorPerfil(@Query() periodo: PeriodoDto) {
    return this.estadisticasService.visitasPorPerfil(periodo);
  }

  @Get('me-gusta-por-dia')
  meGustaPorDia(@Query() periodo: PeriodoDto) {
    return this.estadisticasService.meGustaPorDia(periodo);
  }
}