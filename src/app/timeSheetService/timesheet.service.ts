import { Injectable } from "@angular/core"
import { HttpClient, type HttpErrorResponse } from "@angular/common/http"
import { type Observable, throwError, of } from "rxjs"
import { catchError, tap } from "rxjs/operators"

@Injectable({
  providedIn: "root",
})
export class TimesheetService {
  private apiUrl = "http://localhost:8080/api/timesheets"

  constructor(private http: HttpClient) {}

  getEmployeeTimesheet(employeeId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/byEmployee/${employeeId}`).pipe(
      tap((data) => console.log("Timesheet data:", data)),
      catchError(this.handleError),
    )
  }
  getUserTimesheet(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/byuser/${userId}`).pipe(
      tap((data) => console.log("Timesheet data:", data)),
      catchError(this.handleError),
    )
  }

  getTimesheetTasks(timesheetId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/byTimesheet/${timesheetId}`).pipe(
      tap((data) => console.log("Timesheet tasks:", data)),
      catchError(this.handleError),
    )
  }

  updateTaskStatus(
    taskId: number,
    userId: number,
    dates: { debutdateAffaire: string; FindateAffaire: string },
  ): Observable<any> {
    // Formater les dates au format attendu par le backend: yyyy-MM-dd HH:mm:ss.SSSSSS
    const formatDate = (dateStr: string): string => {
      const date = new Date(dateStr)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, "0")
      const day = String(date.getDate()).padStart(2, "0")
      const hours = String(date.getHours()).padStart(2, "0")
      const minutes = String(date.getMinutes()).padStart(2, "0")
      const seconds = String(date.getSeconds()).padStart(2, "0")
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.000000`
    }

    const url = `${this.apiUrl}/${taskId}/AddTacheToTimeSheetEtchangeStatu/${userId}`
    const body = {
      start: formatDate(dates.debutdateAffaire),
      end: formatDate(dates.FindateAffaire),
    }

    console.log("Body envoyé au backend:", body)
    return this.http.put(url, body)
  }

  // Nouvelles méthodes pour les congés
  addConges(userId: number, conges: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/conges/${userId}`, conges).pipe(
      tap((data) => console.log("Congé ajouté:", data)),
      catchError(this.handleError),
    )
  }
  getCongesGererByManager(managerId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/congesGererBymanager/${managerId}`).pipe(
      tap((data) => console.log(`Congés gérés par le manager ${managerId}:`, data)),
      catchError((error) => {
        console.error(`Erreur lors de la récupération des congés gérés par le manager ${managerId}:`, error)
        return of([])
      }),
    )
  }

  getCongesByEmployee(employeeId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/conges/employee/${employeeId}`).pipe(
      tap((data) => console.log("Congés de l'employé:", data)),
      catchError(this.handleError),
    )
  }

  getCongesByTimesheet(timesheetId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${timesheetId}/conges`).pipe(
      tap((data) => console.log("Congés du timesheet:", data)),
      catchError(this.handleError),
    )
  }

  updateCongesStatus(congesId: number, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/conges/${congesId}/status`, { status }).pipe(
      tap((data) => console.log("Statut du congé mis à jour:", data)),
      catchError(this.handleError),
    )
  }
  deleteConges(congesId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/conges/${congesId}`).pipe(
      tap(() => console.log(`Congé ${congesId} supprimé avec succès`)),
      catchError(this.handleError),
    )
  }
  // Méthode pour formater les dates correctement pour le backend
  private formatDate(date: Date): string {
    if (!(date instanceof Date)) {
      date = new Date(date)
    }
    return date.toISOString()
  }

  // Gestionnaire d'erreurs centralisé
  private handleError(error: HttpErrorResponse) {
    let errorMessage = ""
    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Error: ${error.error.message}`
    } else {
      // Erreur côté serveur
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`
    }
    console.error(errorMessage)
    return throwError(() => error)
  }
}
