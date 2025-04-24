import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

interface Task {
  description: string;
  debutdateAffaire: string;
  FindateAffaire: string;
  etat: boolean;
}

interface Project {
  id: number;
  nom: string;
  startDate: string;
  endDate: string;
  idmanager: string;
  valider: boolean;
  taches1: Task[];
}

interface ProjectProgress {
  projectId: number;
  projectName: string;
  totalTasks: number;
  completedTasks: number;
  progressPercentage: number;
  averageDelay: number;
  remainingDays: number;
  isValidated: boolean;
}

interface TaskDistribution {
  projectId: number;
  projectName: string;
  totalTasks: number;
  statusDistribution: {
    completed: number;
    pending: number;
    completedPercentage: number;
    pendingPercentage: number;
  };
  employeeDistribution: Array<{
    employeeId: number;
    employeeName: string;
    tasksCount: number;
    percentage: number;
  }>;
}

interface ProjectTimeline {
  projectId: number;
  projectName: string;
  startDate: string;
  endDate: string;
  timeline: Array<{
    date: string;
    completedTasks: number;
    progressPercentage: number;
    taskDescription: string;
  }>;
  totalDuration: number;
  elapsedDuration: number;
}

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private apiUrl = 'http://localhost:8080/api/projects';

  constructor(private http: HttpClient) {}

  // Méthodes existantes
  createProject(project: Project, managerId: number): Observable<Project> {
    return this.http.post<Project>(`${this.apiUrl}/add/${managerId}`, project);
  }

  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.apiUrl}/all`);
  }

  getProjectById(id: number): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}/${id}`);
  }

  updateProject(id: number, project: Project): Observable<Project> {
    return this.http.put<Project>(`${this.apiUrl}/update/${id}`, project);
  }

  deleteProject(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }

  addTaskToProject(projectId: number, task: Task): Observable<Task> {
    return this.http.post<Task>(`${this.apiUrl}/${projectId}/addTache`, task);
  }

  assignEmployeesToTask(taskId: number, employeeIds: number[]): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${taskId}/assigner-employes`, employeeIds);
  }

  getProjectsByManager(managerId: number): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.apiUrl}/byManager/${managerId}`);
  }
  
  getTasksByProject(projectId: number): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/${projectId}/tasks`);
  }

  addTaskWithUser(projectId: number, task: Task, userid: number): Observable<Task> {
    return this.http.post<Task>(`${this.apiUrl}/${projectId}/tasks/assign/${userid}`, task)
  }
  
  getProjectsByEmployee(employeeId: number): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.apiUrl}/byEmployee/${employeeId}`);
  }

  // Nouvelles méthodes pour le suivi de progression
  getProjectProgress(projectId: number): Observable<ProjectProgress> {
    return this.http.get<ProjectProgress>(`${this.apiUrl}/${projectId}/progress`);
  }

  getProjectsProgressByManager(managerId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/manager/${managerId}/progress`);
  }

  getProjectsProgressByEmployee(employeeId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/employee/${employeeId}/progress`);
  }

  getProjectTasksDistribution(projectId: number): Observable<TaskDistribution> {
    return this.http.get<TaskDistribution>(`${this.apiUrl}/${projectId}/tasks-distribution`);
  }

  getProjectTimeline(projectId: number): Observable<ProjectTimeline> {
    return this.http.get<ProjectTimeline>(`${this.apiUrl}/${projectId}/timeline`);
  }
}