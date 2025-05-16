import { Component, type OnInit } from "@angular/core"
import { TimesheetService } from "../../timeSheetService/timesheet.service"
import { AuthService } from "../../auth/auth.service"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { Router } from "@angular/router"
import { DashboardComponent } from "../../admin/dashboard/dashboard.component";

interface Timesheet {
  id: number
  dateSoumission: string
  hoursPrevent: number
  status: string
  employe?: {
    id: number
    nom: string
    prenom: string
    email: string
    departement: string
  }
  taches?: any[]
}

@Component({
  selector: "app-list-timesheet",
  standalone: true,
  imports: [CommonModule, FormsModule, DashboardComponent],
  templateUrl: "./list-timesheet.component.html",
  styleUrl: "./list-timesheet.component.css",
})
export class ListTimesheetComponent implements OnInit {
  timesheets: Timesheet[] = []
  loading = false
  error = ""
  successMessage = ""

  // Options de statut pour la validation
  statusOptions = [
    { value: "VALIDATED", label: "Validé" },
    { value: "REJECTED", label: "Rejeté" },
    { value: "PENDING", label: "En attente" },
  ]

  constructor(
    private timesheetService: TimesheetService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadTimesheets()
  }

  loadTimesheets(): void {
    this.loading = true
    this.error = ""

    const currentUser = this.authService.getCurrentUser()
    if (!currentUser || !currentUser.id) {
      this.error = "Utilisateur non connecté ou ID non disponible"
      this.loading = false
      return
    }

    this.timesheetService.getTimesheetsByManager(currentUser.id).subscribe({
      next: (data) => {
        this.timesheets = data
        this.loading = false
      },
      error: (err) => {
        console.error("Erreur lors du chargement des timesheets:", err)
        this.error = "Impossible de charger les timesheets. Veuillez réessayer plus tard."
        this.loading = false
      },
    })
  }

  validateTimesheet(timesheet: Timesheet, status: string): void {
    this.loading = true
    this.successMessage = ""
    this.error = ""

    this.timesheetService.validateTimesheet(timesheet.id, status).subscribe({
      next: (updatedTimesheet) => {
        // Mettre à jour le timesheet dans la liste
        const index = this.timesheets.findIndex((t) => t.id === timesheet.id)
        if (index !== -1) {
          this.timesheets[index] = updatedTimesheet
        }

        this.successMessage = `Le timesheet a été ${status === "VALIDATED" ? "validé" : "rejeté"} avec succès.`
        this.loading = false
      },
      error: (err) => {
        console.error("Erreur lors de la validation du timesheet:", err)
        this.error = "Impossible de valider le timesheet. Veuillez réessayer plus tard."
        this.loading = false
      },
    })
  }

  // Nouvelle méthode pour naviguer vers le timesheet de l'utilisateur
  enterTimesheet(employeeId: number, timesheetId: number): void {
    this.router.navigate(["/timesheet-user"], {
      queryParams: {
        employeeId: employeeId,
        timesheetId: timesheetId,
      },
    })
  }

  // Formater la date pour l'affichage
  formatDate(dateString: string): string {
    if (!dateString) return "Non défini"

    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  // Obtenir la classe CSS en fonction du statut
  getStatusClass(status: string): string {
    switch (status) {
      case "VALIDATED":
        return "status-validated"
      case "REJECTED":
        return "status-rejected"
      case "PENDING":
      default:
        return "status-pending"
    }
  }
}
