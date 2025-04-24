import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../AdminService/admin.service';
import { finalize } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { DashboardComponent } from "../dashboard/dashboard.component";



@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ 
    FormsModule,DashboardComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  users: any[] = [];
  showModal = false;
  isEditMode = false;
  currentUserId: number | null = null;
  isLoading = false;
  errorMessage: string | null = null;
  
  newUser: any = {
    prenom: '',
    nom: '',
    email: '',
    password: '',
    role: 'EMPLOYE',
    departement: ''
  };

  constructor(private adminService: AdminService) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.adminService.getEmployees().pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (employees) => {
        const employeeUsers = employees.map((e: any) => ({ ...e, role: 'EMPLOYE' }));
        
        this.adminService.getManagers().subscribe(managers => {
          const managerUsers = managers.map((m: any) => ({ ...m, role: 'MANAGER' }));
          this.users = [...employeeUsers, ...managerUsers];
        });
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors du chargement des utilisateurs';
        console.error(err);
      }
    });
  }

  createUser(): void {
    this.showModal = true;
    this.isEditMode = false;
  }

  editUser(user: any): void {
    this.isEditMode = true;
    this.currentUserId = user.id;
    this.newUser = { 
      prenom: user.prenom,
      nom: user.nom,
      email: user.email,
      password: '', // Password intentionally left blank
      role: user.role,
      departement: user.departement
    };
    this.showModal = true;
  }

  submitForm(): void {
    if (!this.validateForm()) return;

    const userData = {
      ...this.newUser,
      ...(this.isEditMode && { id: this.currentUserId })
    };

    let request;
    
    if (this.isEditMode) {
      request = this.updateUser(userData);
    } else {
      request = this.createNewUser(userData);
    }

    request.subscribe({
      next: () => {
        this.loadUsers();
        this.closeModal();
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors de la sauvegarde';
        console.error(err);
      }
    });
  }

  private createNewUser(userData: any) {
    switch(userData.role) {
      case 'manager':
        return this.adminService.createManager(userData);
      case 'admin':
        return this.adminService.createAdmin(userData);
      default:
        return this.adminService.createEmployee(userData);
    }
  }

  private updateUser(userData: any) {
    switch(userData.role) {
      case 'manager':
        return this.adminService.updateManager(userData);
      case 'admin':
        // Implémenter updateAdmin si nécessaire
        throw new Error('Mise à jour admin non implémentée');
      default:
        return this.adminService.updateEmployee(userData);
    }
  }

  deleteUser(userId: number, role: string): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;

    const request = role === 'manager' 
      ? this.adminService.deleteManager(userId) 
      : this.adminService.deleteEmployee(userId);

    request.subscribe({
      next: () => this.loadUsers(),
      error: (err) => {
        this.errorMessage = 'Erreur lors de la suppression';
        console.error(err);
      }
    });
  }

  closeModal(): void {
    this.showModal = false;
    this.isEditMode = false;
    this.currentUserId = null;
    this.newUser = {
      prenom: '',
      nom: '',
      email: '',
      password: '',
      role: 'EMPLOYE',
      departement: ''
    };
  }

  private validateForm(): boolean {
    const requiredFields = ['prenom', 'nom', 'email', 'role', 'departement'];
    const isValid = requiredFields.every(field => !!this.newUser[field]);

    if (!isValid) {
      this.errorMessage = 'Tous les champs obligatoires doivent être remplis';
      return false;
    }

    if (!this.isEditMode && !this.newUser.password) {
      this.errorMessage = 'Le mot de passe est requis';
      return false;
    }

    return true;
  }
}