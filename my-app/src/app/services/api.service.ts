import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {
    // Existing presentation scripts share the Angular HTTP pipeline.
    (window as any).angularApiRequest = this.request.bind(this);
  }
  async request<T = any>(url: string, method = 'GET', body?: unknown): Promise<T> {
    try {
      return await firstValueFrom(this.http.request<T>(method, url, {
        body, withCredentials: true, headers: { 'X-Requested-With': 'TuQuyGarden' }
      }));
    } catch (error: any) {
      throw new Error(error.error?.message || 'Không kết nối được máy chủ. Vui lòng thử lại.');
    }
  }
}
