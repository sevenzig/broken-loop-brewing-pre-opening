import type { UploadResponse } from '../types/Admin';
export declare class FileService {
    private uploadPath;
    private maxFileSize;
    private allowedMimeTypes;
    constructor(uploadPath?: string, maxFileSize?: number);
    initialize(): Promise<void>;
    private ensureDirectoryExists;
    saveUploadedFile(file: any, subdirectory?: string): Promise<UploadResponse>;
    deleteFile(filePath: string): Promise<boolean>;
    listFiles(directory?: string): Promise<string[]>;
    getFileInfo(filePath: string): Promise<{
        exists: boolean;
        size?: number;
        mimeType?: string;
    }>;
    cleanupUnusedFiles(usedFiles: string[]): Promise<number>;
    copyFile(sourcePath: string, destinationPath: string): Promise<boolean>;
    moveFile(sourcePath: string, destinationPath: string): Promise<boolean>;
    private getFileExtension;
    private getMimeType;
    private getPublicPath;
    private getFullPath;
    validateImageFile(filePath: string): Promise<{
        isValid: boolean;
        errors: string[];
    }>;
    getUploadStats(): Promise<{
        totalFiles: number;
        totalSize: number;
        averageSize: number;
    }>;
}
//# sourceMappingURL=FileService.d.ts.map