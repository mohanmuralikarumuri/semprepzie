import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { auth } from '../config/firebase';

class ApiService {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: import.meta.env.PROD ? 'https://semprepzie.onrender.com/api' : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'),
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor to add auth token
    this.instance.interceptors.request.use(
      async (config) => {
        try {
          const user = auth.currentUser;
          if (user) {
            const token = await user.getIdToken();
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.error('Failed to get auth token:', error);
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error: AxiosError) => {
        this.handleError(error);
        return Promise.reject(error);
      }
    );
  }

  private handleError(error: AxiosError): void {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      auth.signOut();
      window.location.href = '/login';
    } else if (error.response && error.response.status >= 500) {
      // Handle server errors
      console.error('Server error:', error);
    }
  }

  // Auth endpoints
  async login(credentials: { email: string; password: string }) {
    const response = await this.instance.post('/auth/login', credentials);
    return response.data;
  }

  async signup(userData: { email: string; password: string; displayName?: string }) {
    const response = await this.instance.post('/auth/signup', userData);
    return response.data;
  }

  async verifyToken(token: string) {
    const response = await this.instance.post('/auth/verify-token', { token });
    return response.data;
  }

  async resetPassword(email: string) {
    const response = await this.instance.post('/auth/reset-password', { email });
    return response.data;
  }

  async getProfile() {
    const response = await this.instance.get('/auth/profile');
    return response.data;
  }

  async updateProfile(data: { displayName?: string }) {
    const response = await this.instance.put('/auth/profile', data);
    return response.data;
  }

  // Document endpoints
  async getDocuments(params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
  }) {
    const response = await this.instance.get('/documents', { params });
    return response.data;
  }

  async getDocument(id: string) {
    const response = await this.instance.get(`/documents/${id}`);
    return response.data;
  }

  async getDocumentMetadata(id: string) {
    const response = await this.instance.get(`/documents/${id}/metadata`);
    return response.data;
  }

  async uploadDocument(formData: FormData) {
    const response = await this.instance.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async deleteDocument(id: string) {
    const response = await this.instance.delete(`/documents/${id}`);
    return response.data;
  }

  // Contact endpoints
  async submitContactForm(data: {
    name: string;
    email: string;
    subject?: string;
    message: string;
  }) {
    const response = await this.instance.post('/contact/submit', data);
    return response.data;
  }

  // Device management endpoints
  async registerDevice(email: string, deviceId: string) {
    const response = await this.instance.post('/devices/register', { email, deviceId });
    return response.data;
  }

  async getDevices() {
    const response = await this.instance.get('/devices');
    return response.data;
  }

  async getDeviceCount(email: string) {
    const response = await this.instance.post('/devices/count', { email });
    return response.data;
  }

  async logoutOtherDevices(currentDeviceId: string) {
    const response = await this.instance.post('/devices/logout-others', { currentDeviceId });
    return response.data;
  }

  async revokeDevice(deviceId: string) {
    const response = await this.instance.delete(`/devices/${deviceId}`);
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;
