import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DashboardOverview {
  totalProjects: number;
  completedProjects: number;
  projectCompletionRate: number;
  totalTasks: number;
  completedTasks: number;
  taskCompletionRate: number;
  totalEmployees: number;
  totalManagers: number;
  delayedTasks: number;
  delayRate: number;
  totalWarnings: number;
}
export interface EmployeeWorkload {
  employeeName: string;
  departement: string;
  totalAssignedTasks: number;
  pendingTasks: number;
  hoursWorked: number;
}

export interface AllProjectsProgress {
  projects: {
    projectId: number;
    projectName: string;
    totalTasks: number;
    completedTasks: number;
    progressPercentage: number;
    averageDelay: number;
    remainingDays: number;
    isValidated: boolean;
  }[];
  totalProjects: number;
  completedProjects: number;
  completionRate: number;
}

export interface DelayedTasksMetrics {
  totalDelayedTasks: number;
  delayedTasksDetails: {
    taskId: number;
    taskDescription: string;
    projectId: number;
    projectName: string;
    deadline: Date;
    delayDays: number;
    assignedEmployees: string[];
  }[];
  delaysByProject: {
    projectId: number;
    projectName: string;
    delayedTasksCount: number;
  }[];
}

export interface WorkloadDistribution {
  employeeWorkloads: {
    employeeId: number;
    employeeName: string;
    departement: string;
    totalAssignedTasks: number;
    pendingTasks: number;
    hoursWorked: number;
  }[];
  departmentWorkloads: {
    departement: string;
    employeesCount: number;
    totalTasks: number;
    pendingTasks: number;
    averageTasksPerEmployee: number;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'http://localhost:8080/api/dashboard';

  constructor(private http: HttpClient) { }

  // Global dashboard methods
  getDashboardOverview(): Observable<DashboardOverview> {
    return this.http.get<DashboardOverview>(`${this.apiUrl}/overview`);
  }

  getAllProjectsProgress(): Observable<AllProjectsProgress> {
    return this.http.get<AllProjectsProgress>(`${this.apiUrl}/projects/progress`);
  }

  getDelayedTasksMetrics(): Observable<DelayedTasksMetrics> {
    return this.http.get<DelayedTasksMetrics>(`${this.apiUrl}/tasks/delayed`);
  }

  getWorkloadDistribution(): Observable<WorkloadDistribution> {
    return this.http.get<WorkloadDistribution>(`${this.apiUrl}/workload`);
  }

  // Manager-specific dashboard methods
  getDashboardOverviewByManager(managerId: number): Observable<DashboardOverview> {
    return this.http.get<DashboardOverview>(`${this.apiUrl}/overview/manager/${managerId}`);
  }

  getProjectsProgressByManager(managerId: number): Observable<AllProjectsProgress> {
    return this.http.get<AllProjectsProgress>(`${this.apiUrl}/projects/progress/manager/${managerId}`);
  }

  getDelayedTasksMetricsByManager(managerId: number): Observable<DelayedTasksMetrics> {
    return this.http.get<DelayedTasksMetrics>(`${this.apiUrl}/tasks/delayed/manager/${managerId}`);
  }

  getWorkloadDistributionByManager(managerId: number): Observable<WorkloadDistribution> {
    return this.http.get<WorkloadDistribution>(`${this.apiUrl}/workload/manager/${managerId}`);
  }

  // Additional methods for team progress based on timesheets
  getTeamProgressByManager(managerId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/team/progress/manager/${managerId}`);
  }

  getTotalManagers(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/managers/count`)
  }

  getTotalEmployees(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/employees/count`)
  }

  getTotalProjects(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/projects/count`)
  }
}