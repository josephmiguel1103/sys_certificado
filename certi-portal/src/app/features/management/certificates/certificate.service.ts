import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CertificateService {
  private apiUrl = `${environment.apiUrl}/certificates`;

  constructor(private http: HttpClient) { }

  getCertificates(params: any = {}): Observable<any> {
    return this.http.get(this.apiUrl, { params });
  }

  getCertificate(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  createCertificate(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  updateCertificate(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteCertificate(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  changeStatus(id: number, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/change-status`, { status });
  }

  downloadCertificate(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/download`, { responseType: 'blob' });
  }

  // Nuevo método para descargar en formato específico
  downloadCertificateFormat(id: number, format: 'pdf' | 'jpg'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/download?format=${format}`, { responseType: 'blob' });
  }

  sendEmail(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/send-email`, {});
  }

  // Método para obtener certificados del usuario actual
  getMyCertificates(): Observable<any> {
    return this.http.get(`${this.apiUrl}/my-certificates`);
  }

  // Método para obtener vista previa del certificado
  getCertificatePreview(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}/preview`);
  }
}