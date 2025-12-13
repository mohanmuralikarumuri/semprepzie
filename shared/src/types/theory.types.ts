// Theory module types for branch-wise curriculum

export interface Unit {
  id: string;
  unitNumber: number;
  title: string;
  topics: string[];
  syllabus: string;
  materials?: {
    notes?: string;
    videos?: string[];
    assignments?: string[];
  };
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  credits: number;
  type: 'core' | 'elective' | 'lab' | 'project';
  units: Unit[];
  description?: string;
}

export interface Semester {
  id: string;
  semesterNumber: number;
  name: string;
  subjects: Subject[];
}

export interface Branch {
  id: string;
  code: string;
  name: string;
  fullName: string;
  icon: string;
  color: string;
  description: string;
  semesters: Semester[];
}

export interface TheoryData {
  branches: Branch[];
  lastUpdated: string;
}
