import { IsOptional, Matches } from 'class-validator';

// GET /estadisticas/...?desde=2026-11-01&hasta=2026-11-30
// Las dos son opcionales: si faltan, se usan los últimos 30 días
export class PeriodoDto {
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'desde debe tener el formato AAAA-MM-DD' })
  desde?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'hasta debe tener el formato AAAA-MM-DD' })
  hasta?: string;
}