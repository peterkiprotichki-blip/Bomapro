import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { RentiumUser, PaginatedResponse, PermissionsResponse } from '../../interfaces/models';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<RentiumUser[]> {
    return this.http.get<RentiumUser[]>(`${this.apiUrl}/users`);
  }

  getById(id: string): Observable<RentiumUser> {
    return this.http.get<RentiumUser>(`${this.apiUrl}/users/${id}`);
  }

  invite(data: { email: string; role: string; permissions: string[] }): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/invite`, data);
  }

  approve(userId: string): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/users/${userId}/approve`, {});
  }

  reject(userId: string): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/users/${userId}/reject`, {});
  }

  getPermissions(): Observable<PermissionsResponse> {
    return this.http.get<PermissionsResponse>(`${this.apiUrl}/permissions`);
  }
}
