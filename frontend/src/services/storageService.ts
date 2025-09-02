import { supabase } from '../config/supabase';

export interface UploadProgress {
  progress: number;
  status: 'uploading' | 'complete' | 'error';
  message?: string;
}

export interface UploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

class SupabaseStorageService {
  private readonly BUCKET_NAME = 'pdfs';

  /**
   * Upload a file to Supabase Storage
   */
  async uploadFile(
    file: File, 
    path: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    try {
      // Validate file type
      if (!file.type.includes('pdf')) {
        return {
          success: false,
          error: 'Only PDF files are allowed'
        };
      }

      // Validate file size (50MB max)
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxSize) {
        return {
          success: false,
          error: 'File size must be less than 50MB'
        };
      }

      // Generate unique filename
      const timestamp = Date.now();
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${timestamp}_${cleanFileName}`;
      const fullPath = `${path}/${fileName}`;

      // Start upload
      onProgress?.({
        progress: 0,
        status: 'uploading',
        message: 'Starting upload...'
      });

      // Upload to Supabase Storage
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(fullPath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        
        // Provide more specific error messages
        let errorMessage = `Upload failed: ${error.message}`;
        
        if (error.message.includes('row-level security')) {
          errorMessage = 'Storage access denied. Please check Supabase storage policies.';
        } else if (error.message.includes('bucket')) {
          errorMessage = 'Storage bucket not found or not accessible.';
        } else if (error.message.includes('duplicate')) {
          errorMessage = 'File with this name already exists. Please try again.';
        }
        
        return {
          success: false,
          error: errorMessage
        };
      }

      onProgress?.({
        progress: 50,
        status: 'uploading',
        message: 'Getting public URL...'
      });

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(fullPath);

      if (!urlData?.publicUrl) {
        return {
          success: false,
          error: 'Failed to get public URL'
        };
      }

      onProgress?.({
        progress: 100,
        status: 'complete',
        message: 'Upload complete!'
      });

      return {
        success: true,
        url: urlData.publicUrl,
        path: fullPath
      };

    } catch (error) {
      console.error('Upload service error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }

  /**
   * Delete a file from Supabase Storage
   */
  async deleteFile(path: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([path]);

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Delete failed'
      };
    }
  }

  /**
   * List files in a directory
   */
  async listFiles(path: string = '') {
    try {
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list(path);

      if (error) {
        throw error;
      }

      return { success: true, files: data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'List failed'
      };
    }
  }
}

export const storageService = new SupabaseStorageService();
export default storageService;
