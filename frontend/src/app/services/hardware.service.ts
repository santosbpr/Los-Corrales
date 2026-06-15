import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HardwareService {
  private apiUrl = `${environment.apiUrl}/hardware`;

  constructor(private http: HttpClient) {}

  // Envia o código lido pelo aparelho físico para a nuvem
  processScan(tagId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/scan`, { tag_id: tagId });
  }
}