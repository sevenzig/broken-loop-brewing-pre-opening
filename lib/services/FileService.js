import { promises as fs } from 'fs';
import path from 'path';
import { validateImageUpload } from '../utils/validation';
export class FileService {
    constructor(uploadPath = 'public/uploads', maxFileSize = 5 * 1024 * 1024) {
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
    async initialize() {
        try {
            // Ensure upload directory exists
            await this.ensureDirectoryExists(this.uploadPath);
            console.log(`File service initialized with upload path: ${this.uploadPath}`);
        }
        catch (error) {
            console.error('Failed to initialize FileService:', error);
            throw error;
        }
    }
    async ensureDirectoryExists(dirPath) {
        try {
            await fs.access(dirPath);
        }
        catch (error) {
            if (error.code === 'ENOENT') {
                await fs.mkdir(dirPath, { recursive: true });
            }
            else {
                throw error;
            }
        }
    }
    async saveUploadedFile(file, subdirectory) {
        await this.initialize();
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
            }
            else if (file.path) {
                // File is on disk (from multer)
                await fs.copyFile(file.path, filePath);
                await fs.unlink(file.path); // Clean up temp file
            }
            else {
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
        }
        catch (error) {
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
    async deleteFile(filePath) {
        try {
            const fullPath = this.getFullPath(filePath);
            await fs.unlink(fullPath);
            console.log(`File deleted: ${filePath}`);
            return true;
        }
        catch (error) {
            if (error.code === 'ENOENT') {
                console.warn(`File not found for deletion: ${filePath}`);
                return true; // File doesn't exist, consider it deleted
            }
            console.error(`Failed to delete file ${filePath}:`, error);
            return false;
        }
    }
    async listFiles(directory) {
        try {
            const dirPath = directory ? path.join(this.uploadPath, directory) : this.uploadPath;
            const files = await fs.readdir(dirPath);
            // Filter for image files only
            const imageFiles = files.filter(file => {
                const ext = path.extname(file).toLowerCase();
                return ['.jpg', '.jpeg', '.png', '.svg', '.webp'].includes(ext);
            });
            return imageFiles.map(file => this.getPublicPath(path.join(dirPath, file)));
        }
        catch (error) {
            console.error('Failed to list files:', error);
            return [];
        }
    }
    async getFileInfo(filePath) {
        try {
            const fullPath = this.getFullPath(filePath);
            const stats = await fs.stat(fullPath);
            return {
                exists: true,
                size: stats.size,
                mimeType: this.getMimeType(path.extname(filePath))
            };
        }
        catch (error) {
            if (error.code === 'ENOENT') {
                return { exists: false };
            }
            throw error;
        }
    }
    async cleanupUnusedFiles(usedFiles) {
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
        }
        catch (error) {
            console.error('Failed to cleanup unused files:', error);
            return 0;
        }
    }
    async copyFile(sourcePath, destinationPath) {
        try {
            const sourceFullPath = this.getFullPath(sourcePath);
            const destFullPath = this.getFullPath(destinationPath);
            // Ensure destination directory exists
            const destDir = path.dirname(destFullPath);
            await this.ensureDirectoryExists(destDir);
            await fs.copyFile(sourceFullPath, destFullPath);
            console.log(`File copied: ${sourcePath} -> ${destinationPath}`);
            return true;
        }
        catch (error) {
            console.error(`Failed to copy file ${sourcePath}:`, error);
            return false;
        }
    }
    async moveFile(sourcePath, destinationPath) {
        try {
            const sourceFullPath = this.getFullPath(sourcePath);
            const destFullPath = this.getFullPath(destinationPath);
            // Ensure destination directory exists
            const destDir = path.dirname(destFullPath);
            await this.ensureDirectoryExists(destDir);
            await fs.rename(sourceFullPath, destFullPath);
            console.log(`File moved: ${sourcePath} -> ${destinationPath}`);
            return true;
        }
        catch (error) {
            console.error(`Failed to move file ${sourcePath}:`, error);
            return false;
        }
    }
    getFileExtension(filename) {
        const ext = path.extname(filename).toLowerCase();
        if (!ext || !['.jpg', '.jpeg', '.png', '.svg', '.webp'].includes(ext)) {
            return '.jpg'; // Default extension
        }
        return ext;
    }
    getMimeType(extension) {
        const mimeTypes = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.svg': 'image/svg+xml',
            '.webp': 'image/webp'
        };
        return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
    }
    getPublicPath(fullPath) {
        // Convert full path to public URL path
        const relativePath = path.relative('public', fullPath);
        return `/${relativePath.replace(/\\/g, '/')}`;
    }
    getFullPath(publicPath) {
        // Convert public URL path to full filesystem path
        const relativePath = publicPath.startsWith('/') ? publicPath.slice(1) : publicPath;
        return path.join('public', relativePath);
    }
    async validateImageFile(filePath) {
        const errors = [];
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
        }
        catch (error) {
            errors.push(`Failed to validate file: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return { isValid: false, errors };
        }
    }
    async getUploadStats() {
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
        }
        catch (error) {
            console.error('Failed to get upload stats:', error);
            return { totalFiles: 0, totalSize: 0, averageSize: 0 };
        }
    }
}
//# sourceMappingURL=FileService.js.map