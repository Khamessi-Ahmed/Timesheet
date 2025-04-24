import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TacheService } from '../../taskServices/tache.service';
import { AuthService } from '../../auth/auth.service';
interface Avertissement {
  id?: number;
  description: string;
  createdDate: Date;
  project?: {
    nom: string;
  };
  type?: 'info' | 'success' | 'error'; // Optionnel
}

@Component({
  selector: 'app-man-notification',
  imports: [CommonModule],
   templateUrl: './man-notification.component.html',
  styleUrl: './man-notification.component.css'
})
export class ManNotificationComponent implements OnInit {
  notifications: Avertissement[] = [];
  currentEmployeeId!: number;

  constructor(
    private tacheService: TacheService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user && user.role === 'MANAGER') {
      this.currentEmployeeId = user.id;
      this.loadEmployeeNotifications();

    }
  }

  private loadEmployeeNotifications(): void {
    this.tacheService.getAvertissementsByManager(this.currentEmployeeId)
      .subscribe({
        next: (data) => {
          this.notifications = data;
          console.log('Notifications chargées:', this.notifications);
        },
        error: (err) => {
          console.error('Erreur lors du chargement des notifications:', err);
          // Gérer l'erreur (affichage message à l'utilisateur)
        }
      });
  }
  deleteNotification(id: number): void {
    if(confirm('Confirmer la suppression ?')) {
      this.tacheService.deleteAvertissement(id).subscribe({
        next: () => {
          this.notifications = this.notifications.filter(n => n.id !== id);
          alert('Supprimé !');
        },
        error: () => alert('Supprimé !')
      });
    }
    this.ngOnInit(); 
  }

 
}