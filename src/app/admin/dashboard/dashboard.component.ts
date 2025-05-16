import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import  { DashboardService } from "../../dashboardService/dashboard.service"

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./dashboard.component.html",
  styleUrl: "./dashboard.component.css",
})
export class DashboardComponent implements OnInit {
  totalEmployees = 0
  totalManagers = 0
  totalProjects = 0
  loading = true
  error = false

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadCounts()
  }

  loadCounts(): void {
    this.loading = true
    this.error = false

    // Charger le nombre d'employés
    this.dashboardService.getTotalEmployees().subscribe({
      next: (count) => {
        this.totalEmployees = count
        this.checkLoadingComplete()
      },
      error: (err) => {
        console.error("Erreur lors du chargement du nombre d'employés:", err)
        this.error = true
        this.loading = false
      },
    })

    // Charger le nombre de managers
    this.dashboardService.getTotalManagers().subscribe({
      next: (count) => {
        this.totalManagers = count
        this.checkLoadingComplete()
      },
      error: (err) => {
        console.error("Erreur lors du chargement du nombre de managers:", err)
        this.error = true
        this.loading = false
      },
    })

    // Charger le nombre de projets
    this.dashboardService.getTotalProjects().subscribe({
      next: (count) => {
        this.totalProjects = count
        this.checkLoadingComplete()
      },
      error: (err) => {
        console.error("Erreur lors du chargement du nombre de projets:", err)
        this.error = true
        this.loading = false
      },
    })
  }

  private checkLoadingComplete(): void {
    // Vérifier si toutes les données sont chargées
    if (this.totalEmployees > 0 && this.totalManagers > 0 && this.totalProjects > 0) {
      this.loading = false
    }
  }
}
