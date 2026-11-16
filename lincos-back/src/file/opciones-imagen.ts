import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { memoryStorage } from 'multer';

// Configuración de Multer para cualquier imagen que reciba la API
export const opcionesImagen: MulterOptions = {
  storage: memoryStorage(), // el archivo queda en memoria y se sube a Cloudinary
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB (si se supera, Nest responde 413)
  fileFilter: (_req, file, callback) => {
    if (!/^image\/(jpeg|png|webp)$/.test(file.mimetype)) {
      return callback(new BadRequestException('La imagen debe ser JPG, PNG o WEBP'), false);
    }
    callback(null, true);
  },
};