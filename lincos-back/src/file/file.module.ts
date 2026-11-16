import { Module } from '@nestjs/common';
import { FileService } from './file.service';

@Module({
  providers: [FileService],
  exports: [FileService], // para que Auth y Publicaciones puedan usarlo
})
export class FileModule {}