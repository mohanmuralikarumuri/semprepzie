// Utility functions for handling Supabase document URLs and caching

export interface DocumentItem {
  id: string;
  title: string;
  type: 'pdf' | 'doc' | 'docx' | 'ppt' | 'pptx' | 'xls' | 'xlsx';
  url: string;
  originalUrl: string;
  lastModified?: number;
  cachedAt?: number;
}

export interface Subject {
  id: string;
  name: string;
  icon: string;
  units: Unit[];
}

export interface Unit {
  id: string;
  name: string;
  documents: DocumentItem[];
}

// Convert Supabase URLs to embeddable formats
export const convertSupabaseUrl = (url: string): { embedUrl: string; viewerType: 'pdf' | 'office' } => {
  try {
    // Get document type from URL
    const docType = getDocumentType(url);
    
    if (docType === 'pdf') {
      // For PDFs, we'll use PDF.js viewer with the direct Supabase URL
      return {
        embedUrl: url, // PDF.js will handle this directly
        viewerType: 'pdf'
      };
    } else {
      // For Office documents, use Microsoft Office Online Viewer
      // We need to encode the Supabase URL for the Office viewer
      const encodedUrl = encodeURIComponent(url);
      return {
        embedUrl: `https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}`,
        viewerType: 'office'
      };
    }
  } catch (error) {
    console.error('Error converting Supabase URL:', error);
    return {
      embedUrl: url,
      viewerType: 'pdf'
    };
  }
};

// Get document type from URL or filename
export const getDocumentType = (url: string): DocumentItem['type'] => {
  const urlLower = url.toLowerCase();
  
  if (urlLower.includes('.pdf')) {
    return 'pdf';
  } else if (urlLower.includes('.doc') && !urlLower.includes('.docx')) {
    return 'doc';
  } else if (urlLower.includes('.docx')) {
    return 'docx';
  } else if (urlLower.includes('.ppt') && !urlLower.includes('.pptx')) {
    return 'ppt';
  } else if (urlLower.includes('.pptx')) {
    return 'pptx';
  } else if (urlLower.includes('.xls') && !urlLower.includes('.xlsx')) {
    return 'xls';
  } else if (urlLower.includes('.xlsx')) {
    return 'xlsx';
  }
  
  return 'pdf'; // Default fallback
};

// Generate cache key for document
export const generateCacheKey = (url: string): string => {
  return `doc_${btoa(url).replace(/[^a-zA-Z0-9]/g, '_')}`;
};

// Check if document is cached
export const isDocumentCached = async (url: string): Promise<boolean> => {
  try {
    const cacheKey = generateCacheKey(url);
    const cache = await caches.open('documents-cache');
    const cachedResponse = await cache.match(cacheKey);
    return !!cachedResponse;
  } catch (error) {
    console.error('Error checking cache:', error);
    return false;
  }
};

// Get cached document metadata
export const getCachedDocumentMetadata = async (url: string): Promise<{ lastModified?: number; cachedAt?: number } | null> => {
  try {
    const cacheKey = `${generateCacheKey(url)}_metadata`;
    const cache = await caches.open('documents-metadata');
    const response = await cache.match(cacheKey);
    if (response) {
      const metadata = await response.json();
      return metadata;
    }
    return null;
  } catch (error) {
    console.error('Error getting cached metadata:', error);
    return null;
  }
};

// Subject data based on your updated Google Docs structure with Supabase URLs
export const subjectsData: Subject[] = [
  {
    id: 'ooad',
    name: 'Object Oriented Analysis & Design',
    icon: '🏗️',
    units: [
      {
        id: 'ooad-unit1',
        name: 'Unit 1',
        documents: [
          {
            id: 'ooad-unit1-doc1',
            title: 'OOAD Unit 1',
            type: 'pdf',
            url: 'https://lnbjkowlhordgyhzhpgi.supabase.co/storage/v1/object/public/pdfs/ooadunit-1.pdf',
            originalUrl: 'https://lnbjkowlhordgyhzhpgi.supabase.co/storage/v1/object/public/pdfs/ooadunit-1.pdf'
          }
        ]
      },
      {
        id: 'ooad-unit2',
        name: 'Unit 2',
        documents: [
          {
            id: 'ooad-unit2-part1',
            title: 'OOAD Unit 2 Part 1',
            type: 'pdf',
            url: 'https://lnbjkowlhordgyhzhpgi.supabase.co/storage/v1/object/public/pdfs/ooadunit2-1.pdf',
            originalUrl: 'https://lnbjkowlhordgyhzhpgi.supabase.co/storage/v1/object/public/pdfs/ooadunit2-1.pdf'
          },
          {
            id: 'ooad-unit2-part1-2',
            title: 'OOAD Unit 2 Part 1-2',
            type: 'pdf',
            url: 'https://lnbjkowlhordgyhzhpgi.supabase.co/storage/v1/object/public/pdfs/ooadunit2-1-2.pdf',
            originalUrl: 'https://lnbjkowlhordgyhzhpgi.supabase.co/storage/v1/object/public/pdfs/ooadunit2-1-2.pdf'
          },
          {
            id: 'ooad-unit2-part2',
            title: 'OOAD Unit 2 Part 2',
            type: 'pdf',
            url: 'https://lnbjkowlhordgyhzhpgi.supabase.co/storage/v1/object/public/pdfs/ooadunit2-2.pdf',
            originalUrl: 'https://lnbjkowlhordgyhzhpgi.supabase.co/storage/v1/object/public/pdfs/ooadunit2-2.pdf'
          }
        ]
      }
    ]
  },
  {
    id: 'ai',
    name: 'Artificial Intelligence',
    icon: '🤖',
    units: [
      {
        id: 'ai-unit1',
        name: 'Unit 1',
        documents: [
          {
            id: 'ai-unit1-doc1',
            title: 'AI Unit 1',
            type: 'pdf',
            url: 'https://lnbjkowlhordgyhzhpgi.supabase.co/storage/v1/object/public/pdfs/AI%20Unit%201.pdf',
            originalUrl: 'https://lnbjkowlhordgyhzhpgi.supabase.co/storage/v1/object/public/pdfs/AI%20Unit%201.pdf'
          }
        ]
      }
    ]
  },
  {
    id: 'atcd',
    name: 'Automata Theory & Compiler Design',
    icon: '⚙️',
    units: [
      // Add units as they become available
    ]
  },
  {
    id: 'cn',
    name: 'Computer Networks',
    icon: '🌐',
    units: [
      {
        id: 'cn-unit1',
        name: 'Unit 1',
        documents: [
          {
            id: 'cn-unit1-doc1',
            title: 'Computer Networks Unit 1',
            type: 'pdf',
            url: 'https://lnbjkowlhordgyhzhpgi.supabase.co/storage/v1/object/public/pdfs/cnunit1.pdf',
            originalUrl: 'https://lnbjkowlhordgyhzhpgi.supabase.co/storage/v1/object/public/pdfs/cnunit1.pdf'
          }
        ]
      },
      {
        id: 'cn-unit2',
        name: 'Unit 2',
        documents: [
          {
            id: 'cn-unit2-part1',
            title: 'Computer Networks Unit 2 Part 1',
            type: 'pdf',
            url: 'https://lnbjkowlhordgyhzhpgi.supabase.co/storage/v1/object/public/pdfs/cnunit2.pdf',
            originalUrl: 'https://lnbjkowlhordgyhzhpgi.supabase.co/storage/v1/object/public/pdfs/cnunit2.pdf'
          },
          {
            id: 'cn-unit2-part2',
            title: 'Computer Networks Unit 2 Part 2',
            type: 'pdf',
            url: 'https://lnbjkowlhordgyhzhpgi.supabase.co/storage/v1/object/public/pdfs/cnunit2-2.pdf',
            originalUrl: 'https://lnbjkowlhordgyhzhpgi.supabase.co/storage/v1/object/public/pdfs/cnunit2-2.pdf'
          }
        ]
      }
    ]
  },
  {
    id: 'english',
    name: 'English for Competitive Exam',
    icon: '📖',
    units: [
      {
        id: 'english-part1',
        name: 'Part 1',
        documents: [
          {
            id: 'english-part1-doc1',
            title: 'English for Competitive Exam',
            type: 'pdf',
            url: 'https://lnbjkowlhordgyhzhpgi.supabase.co/storage/v1/object/public/pdfs/english.pdf',
            originalUrl: 'https://lnbjkowlhordgyhzhpgi.supabase.co/storage/v1/object/public/pdfs/english.pdf'
          }
        ]
      }
    ]
  },
  {
    id: 'qp',
    name: 'Quantum Physics',
    icon: '⚛️',
    units: [
      {
        id: 'qp-unit1',
        name: 'Unit 1',
        documents: [
          {
            id: 'qp-unit1-doc1',
            title: 'Quantum Physics Unit 1',
            type: 'pdf',
            url: 'https://lnbjkowlhordgyhzhpgi.supabase.co/storage/v1/object/public/pdfs/quantumunit1.pdf',
            originalUrl: 'https://lnbjkowlhordgyhzhpgi.supabase.co/storage/v1/object/public/pdfs/quantumunit1.pdf'
          }
        ]
      },
      {
        id: 'qp-unit2',
        name: 'Unit 2',
        documents: [
          {
            id: 'qp-unit2-doc1',
            title: 'Quantum Physics Unit 2',
            type: 'pdf',
            url: 'https://lnbjkowlhordgyhzhpgi.supabase.co/storage/v1/object/public/pdfs/quantumunit2.pdf',
            originalUrl: 'https://lnbjkowlhordgyhzhpgi.supabase.co/storage/v1/object/public/pdfs/quantumunit2.pdf'
          }
        ]
      }
    ]
  }
];

// Helper function to get all documents for a subject
export const getSubjectDocuments = (subjectId: string): DocumentItem[] => {
  const subject = subjectsData.find(s => s.id === subjectId);
  if (!subject) return [];
  
  return subject.units.flatMap(unit => unit.documents);
};

// Helper function to get document by ID
export const getDocumentById = (documentId: string): DocumentItem | null => {
  for (const subject of subjectsData) {
    for (const unit of subject.units) {
      const document = unit.documents.find(doc => doc.id === documentId);
      if (document) return document;
    }
  }
  return null;
};
