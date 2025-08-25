import { Request, Response } from 'express';
import { createError } from '../middlewares/error.middleware';
import { logger } from '../utils/logger';

// Mock document data (in production, use a database)
interface DocumentData {
  id: string;
  title: string;
  description?: string;
  type: string;
  url: string;
  googleDriveId?: string;
  fileSize?: number;
  mimeType: string;
  uploadedAt: string;
  uploadedBy: string;
  category: string;
  tags: string[];
  isPublic: boolean;
  viewCount: number;
}

const documents: DocumentData[] = [
  {
    id: '1',
    title: 'Computer Networks Unit 1',
    description: 'Introduction to Computer Networks',
    type: 'pdf',
    url: 'https://drive.google.com/file/d/1abc123/view',
    googleDriveId: '1abc123',
    fileSize: 2048000,
    mimeType: 'application/pdf',
    uploadedAt: new Date().toISOString(),
    uploadedBy: 'admin@aitsrajampet.ac.in',
    category: 'lecture-notes',
    tags: ['networks', 'unit1'],
    isPublic: true,
    viewCount: 0
  }
];

class DocumentController {
  public async getDocuments(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 20, category, search } = req.query;
      
      let filteredDocs = documents.filter(doc => doc.isPublic);

      // Filter by category
      if (category) {
        filteredDocs = filteredDocs.filter(doc => doc.category === category);
      }

      // Search functionality
      if (search) {
        const searchTerm = (search as string).toLowerCase();
        filteredDocs = filteredDocs.filter(doc => 
          doc.title.toLowerCase().includes(searchTerm) ||
          doc.description?.toLowerCase().includes(searchTerm) ||
          doc.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
      }

      // Pagination
      const startIndex = (Number(page) - 1) * Number(limit);
      const endIndex = startIndex + Number(limit);
      const paginatedDocs = filteredDocs.slice(startIndex, endIndex);

      res.json({
        success: true,
        data: paginatedDocs,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: filteredDocs.length,
          pages: Math.ceil(filteredDocs.length / Number(limit))
        }
      });
    } catch (error) {
      throw createError('Failed to fetch documents', 500);
    }
  }

  public async getDocument(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    try {
      const document = documents.find(doc => doc.id === id);

      if (!document) {
        throw createError('Document not found', 404);
      }

      if (!document.isPublic) {
        throw createError('Document not accessible', 403);
      }

      // Increment view count
      document.viewCount += 1;

      res.json({
        success: true,
        data: document
      });
    } catch (error) {
      throw createError('Failed to fetch document', 500);
    }
  }

  public async getDocumentMetadata(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    try {
      const document = documents.find(doc => doc.id === id);

      if (!document) {
        throw createError('Document not found', 404);
      }

      // Return metadata for viewer configuration
      const metadata = {
        id: document.id,
        title: document.title,
        type: document.type,
        mimeType: document.mimeType,
        fileSize: document.fileSize,
        googleDriveId: document.googleDriveId,
        viewerConfig: this.getViewerConfig(document)
      };

      res.json({
        success: true,
        data: metadata
      });
    } catch (error) {
      throw createError('Failed to fetch document metadata', 500);
    }
  }

  public async uploadDocument(req: Request, res: Response): Promise<void> {
    // This would typically handle file upload to Google Drive or other storage
    // For now, we'll return a mock response
    
    const { title, description, category, tags } = req.body;

    if (!title) {
      throw createError('Document title is required', 400);
    }

    try {
      const newDocument: DocumentData = {
        id: Date.now().toString(),
        title,
        description,
        type: 'pdf', // Would be determined from uploaded file
        url: 'https://drive.google.com/file/d/mock123/view',
        googleDriveId: 'mock123',
        fileSize: 1024000,
        mimeType: 'application/pdf',
        uploadedAt: new Date().toISOString(),
        uploadedBy: req.user!.email,
        category: category || 'other',
        tags: tags ? tags.split(',').map((tag: string) => tag.trim()) : [],
        isPublic: true,
        viewCount: 0
      };

      documents.push(newDocument);

      logger.info(`Document uploaded: ${title} by ${req.user!.email}`);

      res.status(201).json({
        success: true,
        message: 'Document uploaded successfully',
        data: newDocument
      });
    } catch (error) {
      throw createError('Failed to upload document', 500);
    }
  }

  public async deleteDocument(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    try {
      const documentIndex = documents.findIndex(doc => doc.id === id);

      if (documentIndex === -1) {
        throw createError('Document not found', 404);
      }

      const document = documents[documentIndex];

      // Check if user has permission to delete
      if (document.uploadedBy !== req.user!.email) {
        throw createError('You do not have permission to delete this document', 403);
      }

      documents.splice(documentIndex, 1);

      logger.info(`Document deleted: ${document.title} by ${req.user!.email}`);

      res.json({
        success: true,
        message: 'Document deleted successfully'
      });
    } catch (error) {
      throw createError('Failed to delete document', 500);
    }
  }

  private getViewerConfig(document: DocumentData) {
    const { type, url, googleDriveId } = document;

    switch (type) {
      case 'pdf':
        return {
          viewer: 'pdfjs',
          src: googleDriveId ? `https://drive.google.com/file/d/${googleDriveId}/preview` : url
        };
      
      case 'doc':
      case 'docx':
      case 'ppt':
      case 'pptx':
      case 'xls':
      case 'xlsx':
        return {
          viewer: 'office',
          src: googleDriveId 
            ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(`https://drive.google.com/uc?id=${googleDriveId}&export=download`)}`
            : `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`
        };
      
      default:
        return {
          viewer: 'browser',
          src: url
        };
    }
  }
}

export const documentController = new DocumentController();
