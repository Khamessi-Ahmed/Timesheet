import { Component, OnInit } from '@angular/core';
import { ProjectService } from '../../ProjectService/project.service';
import { Router, ActivatedRoute } from '@angular/router';
import { DashboardComponent } from "../../admin/dashboard/dashboard.component";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../auth/auth.service';


@Component({
  selector: 'app-project',
  standalone: true,
  imports: [
    DashboardComponent, 
    CommonModule,
    FormsModule // Ajout nécessaire pour les formulaires
  ],
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.css']
})
export class ProjectComponent implements OnInit {
  projects: any[] = [];
  showProjectModal = false;
  currentProject: any = {};
  isEditMode = false;
  isLoading = true;
  currentEmployeeId!: number;

  constructor(
    private projectService: ProjectService,
    private router: Router,
    private route: ActivatedRoute,private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user && user.role === 'EMPLOYE') {
      this.currentEmployeeId = user.id;
    }
    this.loadAllProjects();
  }

  loadAllProjects(): void {
    this.isLoading = true;
    this.projectService.getProjectsByEmployee(this.currentEmployeeId).subscribe({
      next: (projects) => {
        this.projects = projects;
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Error loading projects:", err);
        this.isLoading = false;
      },
    });
  }

  openProjectForm(project?: any): void {
    this.isEditMode = !!project;
    this.currentProject = project ? { 
      ...project,
      idmanager: project.idmanager // Correction du nom de propriété
    } : {
      nom: "",
      startDate: "",
      endDate: "",
      idmanager: "" // Nom de propriété corrigé
    };
    this.showProjectModal = true;
  }

  handleProjectSubmit(): void {
    if (!this.currentProject.idmanager) {
      alert("Veuillez sélectionner un manager");
      return;
    }

    const operation = this.isEditMode 
      ? this.projectService.updateProject(this.currentProject.id, this.currentProject)
      : this.projectService.createProject(
          this.currentProject, 
          Number(this.currentProject.idmanager) // Conversion en number
        );

    operation.subscribe({
      next: () => {
        this.loadAllProjects();
        this.closeModal();
      },
      error: (err) => {
        console.error("Error saving project:", err);
        alert("Erreur lors de la sauvegarde du projet");
      },
    });
  }

  deleteProject(id: number): void {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce projet ?")) {
      this.projectService.deleteProject(id).subscribe({
        next: () => this.loadAllProjects(),
        error: (err) => {
          console.error("Error deleting project:", err);
          alert("Erreur lors de la suppression du projet");
        },
      });
    }
  }

  closeModal(): void {
    this.showProjectModal = false;
    this.currentProject = {};
    this.isEditMode = false;
  }

  // Navigation vers les tâches du projet
  enterProject(projectId: number): void {
    this.router.navigate(['EmpeloyeeTache'], {
      queryParams: { 
        projectId: projectId,
        projectName: this.getProjectName(projectId) 
      }
    });
  }

  private getProjectName(projectId: number): string {
    return this.projects.find(p => p.id === projectId)?.nom || '';
  }

  getStatus(project: any): string {
    return project.valider ? 'Validé' : 'En attente';
  }

  getCompletion(project: any): number {
    if (!project.taches1?.length) return 0;
    const completedTasks = project.taches1.filter((t: any) => t.etat).length;
    return Math.round((completedTasks / project.taches1.length) * 100);
  }

  // Nouvelle méthode pour la recherche de manager
  searchManagers(event: any): void {
    // Implémentez la logique de recherche API si nécessaire
  }
  




  
}