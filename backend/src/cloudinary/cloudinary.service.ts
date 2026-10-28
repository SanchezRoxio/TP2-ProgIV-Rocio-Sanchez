import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  subirImagen(buffer: Buffer): Promise<string> {
    // se configura aca adentro (no a nivel de modulo) porque a nivel de
    // modulo se ejecuta al importar el archivo, antes de que ConfigModule
    // llegue a cargar el .env (mismo problema que tuvimos con JWT_SECRET)
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({ folder: 'bookface' }, (error, resultado) => {
        if (error || !resultado) {
          reject(error ?? new Error('No se pudo subir la imagen a Cloudinary.'));
          return;
        }
        resolve(resultado.secure_url);
      });
      stream.end(buffer);
    });
  }
}
