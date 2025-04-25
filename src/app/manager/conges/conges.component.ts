import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { MatTableModule } from "@angular/material/table"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"
import { MatCardModule } from "@angular/material/card"
import { MatDividerModule } from "@angular/material/divider"
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner"
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar"
import { MatDialogModule } from "@angular/material/dialog"
import { MatTooltipModule } from "@angular/material/tooltip"
import { MatChipsModule } from "@angular/material/chips"
import { TimesheetService } from "../../timeSheetService/timesheet.service"
import { AuthService } from "../../auth/auth.service"
import { DashboardComponent } from "../../admin/dashboard/dashboard.component"

@Component({
  selector: "app-conges",
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatTooltipModule,
    MatChipsModule,
    DashboardComponent,
  ],
  templateUrl: "./conges.component.html",
  styleUrl: "./conges.component.css",
})
export class CongesComponent implements OnInit {
  conges: any[] = []
  displayedColumns: string[] = ["employe", "type", "dateDebut", "dateFin", "status", "actions"]
  loading = false
  error: string | null = null
  managerId = 1 // Valeur par défaut pour le développement

  constructor(
    private timesheetService: TimesheetService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.initializeManagerData()
  }

  initializeManagerData(): void {
    try {
      const user = this.authService.getCurrentUser()
      if (user && user.id) {
        this.managerId = user.id
      } else {
        console.warn("Utilisateur non trouvé, utilisation de l'ID par défaut:", this.managerId)
      }
      this.loadConges()
    } catch (error) {
      console.error("Erreur lors de l'initialisation des données:", error)
      // Continuer avec l'ID par défaut
      this.loadConges()
    }
  }

  loadConges(): void {
    this.loading = true
    this.error = null

    this.timesheetService.getCongesGererByManager(this.managerId).subscribe({
      next: (conges) => {
        this.conges = conges
        this.loading = false
      },
      error: (err) => {
        this.error = "Erreur lors du chargement des congés. Veuillez réessayer."
        console.error("Erreur lors du chargement des congés:", err)
        this.loading = false
      },
    })
  }

  approveConge(congeId: number): void {
    this.updateCongeStatus(congeId, "APPROUVE")
  }

  rejectConge(congeId: number): void {
    this.updateCongeStatus(congeId, "REFUSE")
  }

  updateCongeStatus(congeId: number, status: string): void {
    this.loading = true
    this.timesheetService.updateCongesStatus(congeId, status).subscribe({
      next: () => {
        this.snackBar.open(`Congé ${status === "APPROUVE" ? "approuvé" : "refusé"} avec succès!`, "Fermer", {
          duration: 3000,
        })
        this.loading = false
        this.loadConges()
      },
      error: (err) => {
        this.snackBar.open(`Erreur lors de la mise à jour du statut du congé.`, "Fermer", {
          duration: 5000,
        })
        console.error("Erreur:", err)
        this.loading = false
      },
    })
  }

  deleteConge(congeId: number): void {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce congé ?")) {
      this.loading = true
      this.timesheetService.deleteConges(congeId).subscribe({
        next: () => {
          this.snackBar.open("Congé supprimé avec succès!", "Fermer", {
            duration: 3000,
          })
          this.loading = false
          this.loadConges()
        },
        error: (err) => {
          this.snackBar.open("Erreur lors de la suppression du congé.", "Fermer", {
            duration: 5000,
          })
          console.error("Erreur:", err)
          this.loading = false
        },
      })
    }
  }

  getStatusClass(status: string): string {
    switch (status.toUpperCase()) {
      case "APPROUVE":
        return "status-approved"
      case "REFUSE":
        return "status-rejected"
      case "EN_ATTENTE":
      default:
        return "status-pending"
    }
  }

  getStatusIcon(status: string): string {
    switch (status.toUpperCase()) {
      case "APPROUVE":
        return "check_circle"
      case "REFUSE":
        return "cancel"
      case "EN_ATTENTE":
      default:
        return "schedule"
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }
}
