import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((response: any) => {
        // Stockage du token et du rôle
        if (response.token && response.role) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('role', response.role);
          
          // Stockage des données utilisateur selon le rôle
          const userKey = response.role + 'Data';
          localStorage.setItem(userKey, JSON.stringify(response.data));
        }
      })
    );
  }

  logout(): void {
    // Nettoyage de toutes les données d'authentification
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('adminData');
    localStorage.removeItem('employeData');
    localStorage.removeItem('managerData');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUserRole(): string | null {
    return localStorage.getItem('role');
  }

  getCurrentUser(): any {
    const role = this.getUserRole();
    if (!role) return null;
    
    const userData = localStorage.getItem(role + 'Data');
    return userData ? JSON.parse(userData) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}