import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { existsSync } from "fs";

// Interface for configuration options
interface ImageHandlerConfig {
  uploadDir: string;
  allowedTypes?: RegExp;
  maxFileSize?: number;
  prefix?: string;
}

// Main image handler class
class ImageHandler {
  private config: ImageHandlerConfig;
  private upload: multer.Multer;

  constructor(config: ImageHandlerConfig) {
    this.config = {
      uploadDir: config.uploadDir,
      allowedTypes: config.allowedTypes || /jpeg|jpg|png/,
      maxFileSize: config.maxFileSize || 5 * 1024 * 1024, // 5MB default
      prefix: config.prefix || "image",
    };

    // Configure multer
    this.upload = multer({
      storage: multer.diskStorage({
        destination: this.config.uploadDir,
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9);
          cb(
            null,
            `${this.config.prefix}-${uniqueSuffix}${path.extname(
              file.originalname
            )}`
          );
        },
      }),
      fileFilter: (req, file, cb) => {
        const extname = this.config.allowedTypes!.test(
          path.extname(file.originalname).toLowerCase()
        );
        const mimetype = this.config.allowedTypes!.test(file.mimetype);

        if (extname && mimetype) {
          cb(null, true);
        } else {
          cb(new Error(`Only ${this.config.allowedTypes} files are allowed`));
        }
      },
      limits: { fileSize: this.config.maxFileSize },
    });

    // Ensure upload directory exists
    this.createUploadDir();
  }

  private async createUploadDir() {
    const fullPath = path.join(process.cwd(), "public", this.config.uploadDir);
    if (!existsSync(fullPath)) {
      await fs.mkdir(fullPath, { recursive: true });
    }
  }

  async processImages(files: File[]): Promise<string[]> {
    if (!files || files.length === 0) {
      throw new Error("No images provided");
    }

    const basePath = path.join(process.cwd(), "public", this.config.uploadDir);

    try {
      const imageUrls = await Promise.all(
        files.map(async (file) => {
          if (!(file instanceof File)) {
            throw new Error("Invalid file object detected");
          }
          if (file.size === 0) {
            throw new Error("Empty file detected");
          }
          if (
            !this.config.allowedTypes!.test(
              path.extname(file.name).toLowerCase()
            )
          ) {
            throw new Error(
              `Only ${this.config.allowedTypes} files are allowed`
            );
          }
          if (file.size > this.config.maxFileSize!) {
            throw new Error(
              `File exceeds maximum size of ${
                this.config.maxFileSize! / (1024 * 1024)
              }MB`
            );
          }

          const filename = `${Date.now()}-${file.name || "upload"}`;
          const relativePath = `${this.config.uploadDir}/${filename}`;
          const fullPath = path.join(basePath, filename);

          await this.createUploadDir();
          const buffer = Buffer.from(await file.arrayBuffer());
          await fs.writeFile(fullPath, buffer);

          return relativePath;
        })
      );

      if (imageUrls.length === 0) {
        throw new Error("No images were processed successfully");
      }

      return imageUrls;
    } catch (error) {
      throw error instanceof Error
        ? error
        : new Error(`Image processing failed: ${String(error)}`);
    }
  }

  getMiddleware() {
    return this.upload.array("images");
  }

  async cleanupFiles(filePaths: string[]) {
    await Promise.all(
      filePaths.map(async (filePath) => {
        const fullPath = path.join(process.cwd(), "public", filePath);
        if (existsSync(fullPath)) {
          await fs.unlink(fullPath);
        }
      })
    );
  }
}

// Factory function to create instances
export const createImageHandler = (config: ImageHandlerConfig) => {
  return new ImageHandler(config);
};
