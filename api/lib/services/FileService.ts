import { promises as fs } from 'fs';
import path from 'path';
import type { UploadResponse } from '../types/Admin';
import { validateImageUpload } from '../utils/validation';

export class FileService {
  private uploadPath: string;
  private maxFileSize: number;
  private allowedMimeTypes: string[];

  constructor(uploadPath: string = 'public/uploads', maxFileSize: number = 5 * 1024 * 1024) {
    this.uploadPath = uploadPath;
    this.maxFileSize = maxFileSize;
    this.allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/svg+xml',
      'image/webp'
    ];
  }

  async initialize(): Promise<void> {
    try {
      // In serverless environments (like Vercel), we can't create directories
      // Skip directory creation and just log the upload path
      if (this.isServerlessEnvironment()) {
        console.log(`File service initialized for serverless environment with upload path: ${this.uploadPath}`);
        return;
      }
      
      // Ensure upload directory exists in non-serverless environments
      await this.ensureDirectoryExists(this.uploadPath);
      console.log(`File service initialized with upload path: ${this.uploadPath}`);
    } catch (error) {
      console.error('Failed to initialize FileService:', error);
      throw error;
    }
  }

  private isServerlessEnvironment(): boolean {
    // Check if we're running in a serverless environment
    return !!(
      process.env.VERCEL ||
      process.env.AWS_LAMBDA_FUNCTION_NAME ||
      process.env.FUNCTION_NAME ||
      process.env.K_SERVICE ||
      process.env.FUNCTIONS_EMULATOR
    );
  }

  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        await fs.mkdir(dirPath, { recursive: true });
      } else {
        throw error;
      }
    }
  }

  async saveUploadedFile(file: any, subdirectory?: string): Promise<UploadResponse> {
    await this.initialize();

    // In serverless environments, file uploads are not supported
    if (this.isServerlessEnvironment()) {
      return {
        success: false,
        filePath: '',
        fileName: '',
        fileSize: 0,
        mimeType: file.mimetype || '',
        error: 'File uploads are not supported in serverless environments. Please use a cloud storage service.'
      };
    }

    try {
      // Validate file
      const validationErrors = validateImageUpload(file);
      if (validationErrors.length > 0) {
        return {
          success: false,
          filePath: '',
          fileName: '',
          fileSize: 0,
          mimeType: file.mimetype || '',
          error: validationErrors.map(e => e.message).join(', ')
        };
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const extension = this.getFileExtension(file.originalname || file.name);
      const fileName = `${timestamp}-${randomSuffix}${extension}`;

      // Determine upload path
      const uploadDir = subdirectory ? path.join(this.uploadPath, subdirectory) : this.uploadPath;
      await this.ensureDirectoryExists(uploadDir);

      const filePath = path.join(uploadDir, fileName);
      const publicPath = this.getPublicPath(filePath);

      // Save file
      if (file.buffer) {
        // File is already in memory (from formidable)
        await fs.writeFile(filePath, file.buffer);
      } else if (file.path) {
        // File is on disk (from multer)
        await fs.copyFile(file.path, filePath);
        await fs.unlink(file.path); // Clean up temp file
      } else {
        throw new Error('Invalid file object: no buffer or path');
      }

      // Get file stats
      const stats = await fs.stat(filePath);

      console.log(`File uploaded successfully: ${fileName} (${stats.size} bytes)`);

      return {
        success: true,
        filePath: publicPath,
        fileName,
        fileSize: stats.size,
        mimeType: file.mimetype || this.getMimeType(extension)
      };
    } catch (error) {
      console.error('Failed to save uploaded file:', error);
      return {
        success: false,
        filePath: '',
        fileName: '',
        fileSize: 0,
        mimeType: file.mimetype || '',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async deleteFile(filePath: string): Promise<boolean> {
    if (this.isServerlessEnvironment()) {
      console.log('File deletion not supported in serverless environment:', filePath);
      return false;
    }
    
    try {
      const fullPath = this.getFullPath(filePath);
      await fs.unlink(fullPath);
      console.log(`File deleted: ${filePath}`);
      return true;
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        console.warn(`File not found for deletion: ${filePath}`);
        return true; // File doesn't exist, consider it deleted
      }
      console.error(`Failed to delete file ${filePath}:`, error);
      return false;
    }
  }

  async listFiles(directory?: string): Promise<string[]> {
    if (this.isServerlessEnvironment()) {
      console.log('File listing not supported in serverless environment');
      return [];
    }
    
    try {
      const dirPath = directory ? path.join(this.uploadPath, directory) : this.uploadPath;
      const files = await fs.readdir(dirPath);
      
      // Filter for image files only
      const imageFiles = files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.svg', '.webp'].includes(ext);
      });

      return imageFiles.map(file => this.getPublicPath(path.join(dirPath, file)));
    } catch (error) {
      console.error('Failed to list files:', error);
      return [];
    }
  }

  async getFileInfo(filePath: string): Promise<{ exists: boolean; size?: number; mimeType?: string }> {
    try {
      const fullPath = this.getFullPath(filePath);
      const stats = await fs.stat(fullPath);
      
      return {
        exists: true,
        size: stats.size,
        mimeType: this.getMimeType(path.extname(filePath))
      };
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return { exists: false };
      }
      throw error;
    }
  }

  async cleanupUnusedFiles(usedFiles: string[]): Promise<number> {
    try {
      const allFiles = await this.listFiles();
      const unusedFiles = allFiles.filter(file => !usedFiles.includes(file));
      
      let deletedCount = 0;
      for (const file of unusedFiles) {
        if (await this.deleteFile(file)) {
          deletedCount++;
        }
      }
      
      console.log(`Cleaned up ${deletedCount} unused files`);
      return deletedCount;
    } catch (error) {
      console.error('Failed to cleanup unused files:', error);
      return 0;
    }
  }

  async copyFile(sourcePath: string, destinationPath: string): Promise<boolean> {
    try {
      const sourceFullPath = this.getFullPath(sourcePath);
      const destFullPath = this.getFullPath(destinationPath);
      
      // Ensure destination directory exists
      const destDir = path.dirname(destFullPath);
      await this.ensureDirectoryExists(destDir);
      
      await fs.copyFile(sourceFullPath, destFullPath);
      console.log(`File copied: ${sourcePath} -> ${destinationPath}`);
      return true;
    } catch (error) {
      console.error(`Failed to copy file ${sourcePath}:`, error);
      return false;
    }
  }

  async moveFile(sourcePath: string, destinationPath: string): Promise<boolean> {
    try {
      const sourceFullPath = this.getFullPath(sourcePath);
      const destFullPath = this.getFullPath(destinationPath);
      
      // Ensure destination directory exists
      const destDir = path.dirname(destFullPath);
      await this.ensureDirectoryExists(destDir);
      
      await fs.rename(sourceFullPath, destFullPath);
      console.log(`File moved: ${sourcePath} -> ${destinationPath}`);
      return true;
    } catch (error) {
      console.error(`Failed to move file ${sourcePath}:`, error);
      return false;
    }
  }

  private getFileExtension(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    if (!ext || !['.jpg', '.jpeg', '.png', '.svg', '.webp'].includes(ext)) {
      return '.jpg'; // Default extension
    }
    return ext;
  }

  private getMimeType(extension: string): string {
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.svg': 'image/svg+xml',
      '.webp': 'image/webp'
    };
    return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
  }

  private getPublicPath(fullPath: string): string {
    // Convert full path to public URL path
    const relativePath = path.relative('public', fullPath);
    return `/${relativePath.replace(/\\/g, '/')}`;
  }

  private getFullPath(publicPath: string): string {
    // Convert public URL path to full filesystem path
    const relativePath = publicPath.startsWith('/') ? publicPath.slice(1) : publicPath;
    return path.join('public', relativePath);
  }

  async validateImageFile(filePath: string): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];
    
    try {
      const fileInfo = await this.getFileInfo(filePath);
      
      if (!fileInfo.exists) {
        errors.push('File does not exist');
        return { isValid: false, errors };
      }
      
      if (fileInfo.size && fileInfo.size > this.maxFileSize) {
        errors.push(`File size (${fileInfo.size} bytes) exceeds maximum allowed size (${this.maxFileSize} bytes)`);
      }
      
      if (fileInfo.mimeType && !this.allowedMimeTypes.includes(fileInfo.mimeType)) {
        errors.push(`File type (${fileInfo.mimeType}) is not allowed`);
      }
      
      return {
        isValid: errors.length === 0,
        errors
      };
    } catch (error) {
      errors.push(`Failed to validate file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { isValid: false, errors };
    }
  }

  async getUploadStats(): Promise<{ totalFiles: number; totalSize: number; averageSize: number }> {
    try {
      const files = await this.listFiles();
      let totalSize = 0;
      
      for (const file of files) {
        const fileInfo = await this.getFileInfo(file);
        if (fileInfo.size) {
          totalSize += fileInfo.size;
        }
      }
      
      return {
        totalFiles: files.length,
        totalSize,
        averageSize: files.length > 0 ? Math.round(totalSize / files.length) : 0
      };
    } catch (error) {
      console.error('Failed to get upload stats:', error);
      return { totalFiles: 0, totalSize: 0, averageSize: 0 };
    }
  }
}
