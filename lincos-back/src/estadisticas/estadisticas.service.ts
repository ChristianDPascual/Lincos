import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import { Publicacion } from '../publicaciones/entities/publicacion.entity';
import { MeGusta } from '../publicaciones/entities/me-gusta.entity';
import { Comentario } from '../comentarios/entities/comentario.entity';
import { Ingreso } from '../auth/entities/ingreso.entity';
import { VisitaPerfil } from '../usuarios/entities/visita-perfil.entity';
import { PeriodoDto } from './dto/periodo.dto';

const ZONA_HORARIA = 'America/Argentina/Buenos_Aires';
const DESFASE_ARGENTINA = '-03:00'; // Argentina no tiene horario de verano
const UN_DIA = 24 * 60 * 60 * 1000;
const DIAS_POR_DEFECTO = 30;
const MAXIMO_DIAS = 366;

// Período ya validado: fechas en texto (para armar la respuesta) y como Date (para filtrar)
interface Rango {
  desde: string;
  hasta: string;
  inicio: Date; // desde, a las 00:00 de Argentina
  fin: Date;    // el día siguiente a "hasta", a las 00:00 (límite no incluido)
}

@Injectable()
export class EstadisticasService {
  constructor(
    @InjectModel(Publicacion.name) private readonly publicacionModel: Model<Publicacion>,
    @InjectModel(Comentario.name) private readonly comentarioModel: Model<Comentario>,
    @InjectModel(MeGusta.name) private readonly meGustaModel: Model<MeGusta>,
    @InjectModel(Ingreso.name) private readonly ingresoModel: Model<Ingreso>,
    @InjectModel(VisitaPerfil.name) private readonly visitaModel: Model<VisitaPerfil>,
  ) {}

  // ---------- Sprint 4 ----------

  publicacionesPorUsuario(periodo: PeriodoDto) {
    return this.contarPorUsuario(this.publicacionModel, 'autor', { activa: true }, this.armarRango(periodo));
  }

  comentariosPorDia(periodo: PeriodoDto) {
    return this.contarPorDia(this.comentarioModel, { activo: true }, this.armarRango(periodo));
  }

  // Las 10 publicaciones (activas) con más comentarios en el período
  comentariosPorPublicacion(periodo: PeriodoDto) {
    const rango = this.armarRango(periodo);
    const pipeline: PipelineStage[] = [
      { $match: { activo: true, ...this.filtroFechas(rango) } },
      { $group: { _id: '$publicacion', cantidad: { $sum: 1 } } },
      // $lookup: trae la publicación de cada grupo (como un populate dentro de la consulta)
      { $lookup: { from: 'publicaciones', localField: '_id', foreignField: '_id', as: 'publicacion' } },
      { $unwind: '$publicacion' },
      { $match: { 'publicacion.activa': true } },
      { $sort: { cantidad: -1 } },
      { $limit: 10 },
      { $project: { _id: 0, titulo: '$publicacion.titulo', cantidad: 1 } },
    ];
    return this.comentarioModel.aggregate(pipeline);
  }

  // ---------- Sprint 5 ----------

  ingresosPorUsuario(periodo: PeriodoDto) {
    return this.contarPorUsuario(this.ingresoModel, 'usuario', {}, this.armarRango(periodo));
  }

  // Las visitas al propio perfil no se guardan, así que no hace falta filtrarlas acá
  visitasPorPerfil(periodo: PeriodoDto) {
    return this.contarPorUsuario(this.visitaModel, 'perfilVisitado', {}, this.armarRango(periodo));
  }

  meGustaPorDia(periodo: PeriodoDto) {
    return this.contarPorDia(this.meGustaModel, {}, this.armarRango(periodo));
  }

  // ---------- Consultas reutilizables ----------

  // Cuenta documentos agrupados por un campo que referencia a un usuario
  // Resultado: [{ nombreUsuario, cantidad }], de mayor a menor
  private contarPorUsuario(modelo: Model<any>, campoUsuario: string, filtro: Record<string, unknown>, rango: Rango) {
    const pipeline: PipelineStage[] = [
      { $match: { ...filtro, ...this.filtroFechas(rango) } },
      { $group: { _id: `$${campoUsuario}`, cantidad: { $sum: 1 } } },
      { $sort: { cantidad: -1 } },
      { $lookup: { from: 'usuarios', localField: '_id', foreignField: '_id', as: 'usuario' } },
      { $unwind: '$usuario' },
      { $project: { _id: 0, nombreUsuario: '$usuario.nombreUsuario', cantidad: 1 } },
    ];
    return modelo.aggregate(pipeline);
  }

  // Cuenta documentos por día (hora argentina) y completa con 0 los días sin datos
  // Resultado: [{ fecha: 'AAAA-MM-DD', cantidad }], un elemento por cada día del período
  private async contarPorDia(modelo: Model<any>, filtro: Record<string, unknown>, rango: Rango) {
    const porDia: { _id: string; cantidad: number }[] = await modelo.aggregate([
      { $match: { ...filtro, ...this.filtroFechas(rango) } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: ZONA_HORARIA } },
          cantidad: { $sum: 1 },
        },
      },
    ]);

    const cantidades = new Map(porDia.map((d) => [d._id, d.cantidad]));
    const dias: { fecha: string; cantidad: number }[] = [];
    const ultimo = new Date(`${rango.hasta}T00:00:00Z`);

    for (let dia = new Date(`${rango.desde}T00:00:00Z`); dia <= ultimo; dia = new Date(dia.getTime() + UN_DIA)) {
      const fecha = dia.toISOString().slice(0, 10);
      dias.push({ fecha, cantidad: cantidades.get(fecha) ?? 0 });
    }
    return dias;
  }

  // ---------- Período ----------

  private armarRango({ desde, hasta }: PeriodoDto): Rango {
    const hastaFinal = hasta ?? this.fechaArgentina(new Date());
    const desdeFinal = desde ?? this.fechaArgentina(new Date(Date.now() - (DIAS_POR_DEFECTO - 1) * UN_DIA));

    if (!this.esFechaValida(desdeFinal) || !this.esFechaValida(hastaFinal)) {
      throw new BadRequestException('Alguna de las fechas no existe');
    }

    const inicio = new Date(`${desdeFinal}T00:00:00${DESFASE_ARGENTINA}`);
    const inicioUltimoDia = new Date(`${hastaFinal}T00:00:00${DESFASE_ARGENTINA}`);

    if (inicio > inicioUltimoDia) {
      throw new BadRequestException('La fecha "desde" no puede ser posterior a "hasta"');
    }
    if ((inicioUltimoDia.getTime() - inicio.getTime()) / UN_DIA + 1 > MAXIMO_DIAS) {
      throw new BadRequestException(`El período no puede superar los ${MAXIMO_DIAS} días`);
    }

    return { desde: desdeFinal, hasta: hastaFinal, inicio, fin: new Date(inicioUltimoDia.getTime() + UN_DIA) };
  }

  private filtroFechas(rango: Rango) {
    return { createdAt: { $gte: rango.inicio, $lt: rango.fin } };
  }

  // JavaScript convierte el 31 de febrero en 3 de marzo: si al volver a texto no coincide, la fecha no existe
  private esFechaValida(fecha: string): boolean {
    const fechaDate = new Date(`${fecha}T00:00:00Z`);
    return !isNaN(fechaDate.getTime()) && fechaDate.toISOString().slice(0, 10) === fecha;
  }

  // Fecha de hoy (o de cualquier instante) en Argentina, como AAAA-MM-DD
  private fechaArgentina(instante: Date): string {
    return new Date(instante.getTime() - 3 * 60 * 60 * 1000).toISOString().slice(0, 10);
  }
}