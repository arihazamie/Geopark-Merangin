import { put, del } from "@vercel/blob";
import { v4 as uuidv4 } from "uuid";

type ImageHandlerOptions = {
  uploadDir: string;
  allowedTypes: RegExp;
  maxFileSize: number;
  prefix: string;
};

export function createImageHandler(options: ImageHandlerOptions) {
  const { uploadDir, allowedTypes, maxFileSize, prefix } = options;

  return {
    async processImages(files: File[]): Promise<string[]> {
      const uploadedUrls: string[] = [];

      for (const file of files) {
        // Validate file type
        if (!file.type.match(allowedTypes)) {
          throw new Error(
            `File type not allowed: ${file.type}. Allowed types: ${allowedTypes}`
          );
        }

        // Validate file size
        if (file.size > maxFileSize) {
          throw new Error(
            `File too large: ${file.size} bytes. Maximum size: ${maxFileSize} bytes`
          );
        }

        // Generate unique filename
        const fileExtension = file.name.split(".").pop() || "jpg";
        const fileName = `${prefix}-${uuidv4()}.${fileExtension}`;
        const filePath = `${uploadDir}/${fileName}`;

        // Upload to Vercel Blob
        const blob = await put(filePath, file, {
          access: "public",
          contentType: file.type,
        });

        uploadedUrls.push(blob.url);
      }

      return uploadedUrls;
    },

    /**
     * Clean up image files from Vercel Blob
     * @param urls Array of image URLs to delete
     */
    async cleanupFiles(urls: string[]): Promise<void> {
      const deletePromises = urls.map(async (url) => {
        try {
          // Extract the pathname from the URL
          const urlObj = new URL(url);
          const pathname = urlObj.pathname;

          // Delete the file from Vercel Blob
          await del(pathname);
        } catch (error) {
          console.error(`Failed to delete file ${url}:`, error);
        }
      });

      await Promise.all(deletePromises);
    },

    /**
     * Process a single image file
     * @param file File object to process
     * @returns Uploaded image URL
     */
    async processImage(file: File): Promise<string> {
      const urls = await this.processImages([file]);
      return urls[0];
    },
  };
}
