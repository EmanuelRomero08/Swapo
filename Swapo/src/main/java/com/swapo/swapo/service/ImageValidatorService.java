package com.swapo.swapo.service;

import com.drew.imaging.ImageMetadataReader;
import com.drew.metadata.Metadata;
import com.drew.metadata.exif.ExifIFD0Directory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.InputStream;

@Service
public class ImageValidatorService
{
    public String validarImagen(MultipartFile imagen)
    {
        try
        {
            if (imagen == null || imagen.isEmpty())
            {
                return "IMAGEN INVÁLIDA - No se seleccionó ninguna imagen";
            }

            long fileSize = imagen.getSize();
            if (fileSize < 5 * 1024)
            {
                return "IMAGEN SOSPECHOSA - Archivo demasiado pequeño (" + (fileSize / 1024) + "KB)";
            }
            if (fileSize > 10 * 1024 * 1024)
            {
                return "⚠️ IMAGEN GRANDE - El archivo excede los 10MB (" + (fileSize / (1024 * 1024)) + "MB)";
            }

            try (InputStream inputStream = imagen.getInputStream())
            {
                BufferedImage bufferedImage = ImageIO.read(inputStream);
                if (bufferedImage == null)
                {
                    return "IMAGEN INVÁLIDA - No se pudo leer la imagen. Formato no soportado o archivo corrupto";
                }

                int width = bufferedImage.getWidth();
                int height = bufferedImage.getHeight();

                if (width < 200 || height < 200)
                {
                    return "⚠️ IMAGEN PEQUEÑA - Resolución " + width + "x" + height + " (mínimo recomendado 200x200 píxeles)";
                }
                if (width > 4000 || height > 4000)
                {
                    return "⚠️ IMAGEN MUY GRANDE - Resolución " + width + "x" + height + " (recomendado máximo 2000x2000)";
                }
            }

            String contentType = imagen.getContentType();
            if (contentType == null || !contentType.startsWith("image/"))
            {
                return "FORMATO INVÁLIDO - El archivo no es una imagen válida";
            }

            String originalFilename = imagen.getOriginalFilename();
            if (originalFilename != null)
            {
                int lastDot = originalFilename.lastIndexOf(".");
                if (lastDot > 0) {

                    String extension = originalFilename.substring(lastDot + 1).toLowerCase();
                    if (!extension.matches("jpg|jpeg|png|webp|bmp"))
                    {
                        return "⚠️ FORMATO NO RECOMENDADO - Usa JPG, PNG, WEBP o BMP para mejor compatibilidad";
                    }
                }
            }

            try (InputStream inputStream = imagen.getInputStream())
            {
                Metadata metadata = ImageMetadataReader.readMetadata(inputStream);
                ExifIFD0Directory exifDir = metadata.getFirstDirectoryOfType(ExifIFD0Directory.class);

                if (exifDir != null)
                {
                    String make = exifDir.getString(ExifIFD0Directory.TAG_MAKE);
                    String model = exifDir.getString(ExifIFD0Directory.TAG_MODEL);
                    if (make != null && model != null && !make.isEmpty() && !model.isEmpty())
                    {
                        return "IMAGEN VÁLIDA - Capturada con " + make + " " + model;
                    }
                }
            }
            catch (Exception e)
            {
                // No hay metadatos EXIF (imagen descargada de internet o editada)
            }

            return "IMAGEN VÁLIDA - La imagen cumple con todos los requisitos";

        } catch (Exception e) {
            return "⚠️ ERROR AL VALIDAR - No se pudo procesar la imagen: " + e.getMessage();
        }
    }
}