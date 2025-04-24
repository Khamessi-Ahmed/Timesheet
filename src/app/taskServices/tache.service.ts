import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
 interface Avertissement {
  id?: number;
  description: string;
  createdDate: Date;
  project?: {
    nom: string;
  };
}
@Injectable({
  providedIn: 'root'
})
export class TacheService {
  private apiUrl = 'http://localhost:8080/api/taches';

  constructor(private http: HttpClient) {}

  // Récupérer toutes les tâches
  getAllTaches(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      tap(data => console.log('All tasks:', data)),
      catchError(error => {
        console.error('Error fetching all tasks:', error);
        return of([]);
      })
    );
  }

  // Récupérer les tâches d'un employé spécifique
  getTachesByEmployee(employeeId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/byEmployee/${employeeId}`).pipe(
      tap(data => console.log(`Tasks for employee ${employeeId}:`, data)),
      catchError(error => {
        console.error(`Error fetching tasks for employee ${employeeId}:`, error);
        return of([]);
      })
    );
  }

  getTachesBymanager(managerId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/byManager/${managerId}`).pipe(
      tap(data => console.log(`Tasks for manager ${managerId}:`, data)),
      catchError(error => {
        console.error(`Error fetching tasks for manager ${managerId}:`, error);
        return of([]);
      })
    );
  }
  // Récupérer une tâche par son ID
  getTacheById(tacheId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${tacheId}`).pipe(
      tap(data => console.log(`Task ${tacheId}:`, data)),
      catchError(this.handleError)
    );
  }

  // Mettre à jour une tâche
  updateTache(tache: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${tache.id}`, tache).pipe(
      tap(data => console.log('Updated task:', data)),
      catchError(this.handleError)
    );
  }

  // Gestionnaire d'erreurs centralisé
  private handleError(error: HttpErrorResponse) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => error);
  }

  getAvertissementsByManager(managerId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/av/manager/${managerId}`).pipe(
      tap(data => console.log(`Avertissements pour manager ${managerId}:`, data)),
      catchError(error => {
        console.error(`Erreur lors de la récupération des avertissements pour manager ${managerId}:`, error);
        return of([]);
      })
    );
  }
  getAvertissementsByEmploye(employeId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/av/employe/${employeId}`).pipe(
      tap(data => console.log(`Avertissements pour employé ${employeId}:`, data)),
      catchError(error => {
        console.error(`Erreur lors de la récupération des avertissements pour employé ${employeId}:`, error);
        return of([]);
      })
    );
  }
  deleteAvertissement(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/av/${id}`);
  }
}