import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class FileService {
  constructor() {
    // Las claves salen del .env (en clase estaban escritas en el código)
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  subirImagen(file: Express.Multer.File, carpeta: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: `lincos/${carpeta}`, resource_type: 'image' },
        (error, result) => {
          if (error || !result?.secure_url) {
            reject(new InternalServerErrorException('No se pudo guardar la imagen'));
          } else {
            resolve(result.secure_url);
          }
        },
      );
      stream.end(file.buffer);
    });
  }
}