import { Component, type OnInit } from "@angular/core"
import { ActivatedRoute, Router } from "@angular/router"
import { ProjectService } from "../../ProjectService/project.service"
import { HttpClient } from "@angular/common/http"
import { CommonModule } from "@angular/common"
import { DashboardComponent } from "../../admin/dashboard/dashboard.component"
import { FormsModule } from "@angular/forms"
import { AuthService } from "../../auth/auth.service"
import { Chart, registerables } from "chart.js"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

Chart.register(...registerables)

@Component({
  selector: "app-tache",
  standalone: true,
  imports: [CommonModule, DashboardComponent, CommonModule, FormsModule],
  templateUrl: "./tache.component.html",
  styleUrls: ["./tache.component.css"],
})
export class TacheComponent implements OnInit {
  projectId: number | null = null
  projectDetails: any = null
  tasks: any[] = []
  employees: any[] = []
  managers: any[] = []
  isLoading = true
  showTaskModal = false
  role: string | null = null
  isGeneratingPdf = false
  assignType: "employee" | "manager" = "employee"

  newTask = {
    description: "",
    debutdateAffaire: "",
    FindateAffaire: "",
    deadline: "",
    etat: false,
  }

  selectedEmployeeId: number | null = null
  selectedManagerId: number | null = null

  // Propriétés pour le suivi de progression
  projectProgress: any = null
  tasksDistribution: any = null
  projectTimeline: any = null
  showProgressSection = false
  progressCharts: any = {}

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private http: HttpClient,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.projectId = params["projectId"] ? Number(params["projectId"]) : null
      this.role = this.authService.getUserRole()

      if (this.projectId) {
        this.loadProjectDetails()
        this.loadProjectTasks()
        this.loadEmployees()
        this.loadManager()
        this.loadProjectProgress()
        this.loadTasksDistribution()
        this.loadProjectTimeline()
      } else {
        console.log("Project ID is not available in query params")
      }
    })
  }

  loadProjectDetails(): void {
    if (!this.projectId) alert("Project ID is not available")
    else {
      this.projectService.getProjectById(this.projectId).subscribe({
        next: (project) => {
          this.projectDetails = project
        },
        error: (err) => {
          console.error("Error loading project details:", err)
        },
      })
    }
  }

  rout() {
    switch (this.role) {
      case "ADMIN":
        this.router.navigate(["/adminLayout"])
        break
      case "MANAGER":
        this.router.navigate(["/manager"])
        break
      case "EMPLOYE":
        this.router.navigate(["/employee"])
        break
      default:
        this.router.navigate(["/"])
    }
  }

  loadProjectTasks(): void {
    if (!this.projectId) {
      alert("Project ID is not available")
      return
    }

    console.log("Loading tasks for projectId:", this.projectId)
    this.isLoading = true

    this.projectService.getTasksByProject(Number(this.projectId)).subscribe({
      next: (data) => {
        console.log("Tasks loaded:", data)
        this.tasks = data

        if (this.tasks.length === 0) {
          console.warn("No tasks found for this project.")
        }
        this.isLoading = false
      },
      error: (err) => {
        console.error("Error loading tasks:", err)
        this.isLoading = false
      },
    })
  }

  openTaskModal(): void {
    this.showTaskModal = true
    this.newTask = {
      description: "",
      debutdateAffaire: "",
      FindateAffaire: "",
      deadline: "",
      etat: false,
    }
    this.selectedEmployeeId = null
    this.selectedManagerId = null
    this.assignType = "employee"
  }

  closeTaskModal(): void {
    this.showTaskModal = false
  }

  submitTask(): void {
    if (!this.projectId) {
      alert("ID du projet manquant")
      return
    }

    // Vérifier si un utilisateur est sélectionné selon le type d'assignation
    if (this.assignType === "employee" && !this.selectedEmployeeId) {
      alert("Veuillez sélectionner un employé")
      return
    }

    if (this.assignType === "manager" && !this.selectedManagerId) {
      alert("Veuillez sélectionner un manager")
      return
    }

    const taskToSubmit = {
      ...this.newTask,
  
      deadline: new Date(this.newTask.deadline).toISOString(),
    }

    // Déterminer l'ID de l'utilisateur à utiliser
    const userId = this.assignType === "employee" ? this.selectedEmployeeId : this.selectedManagerId

    this.projectService.addTaskWithUser(this.projectId, taskToSubmit, userId!).subscribe({
      next: (response) => {
        this.closeTaskModal()
        this.loadProjectTasks()
        this.loadProjectProgress()
        this.loadTasksDistribution()
      },
      error: (err) => {
        console.error("Error adding task:", err)
        alert("Erreur lors de l'ajout de la tâche")
      },
    })
  }

  getStatusColor(status: string): string {
    switch (status) {
      case "Done":
        return "#10B981"
      case "Working":
        return "#3B82F6"
      case "Canceled":
        return "#EF4444"
      default:
        return "#6B7280"
    }
  }

  getStatus(task: any): string {
    return task.etat ? "Done" : "Working"
  }

  loadEmployees(): void {
    this.http.get<any[]>("http://localhost:8080/api/employees").subscribe({
      next: (employees) => {
        this.employees = employees
      },
      error: (err) => {
        console.error("Error loading employees:", err)
      },
    })
  }

  loadManager(): void {
    this.http.get<any[]>("http://localhost:8080/api/listmanager").subscribe({
      next: (managers) => {
        this.managers = managers
      },
      error: (err) => {
        console.error("Error loading managers:", err)
      },
    })
  }

  // Méthodes pour le suivi de progression
  loadProjectProgress(): void {
    if (!this.projectId) return

    this.projectService.getProjectProgress(this.projectId).subscribe({
      next: (data) => {
        this.projectProgress = data
        setTimeout(() => this.renderProgressChart(), 100)
      },
      error: (err) => {
        console.error("Error loading project progress:", err)
      },
    })
  }

  loadTasksDistribution(): void {
    if (!this.projectId) return

    this.projectService.getProjectTasksDistribution(this.projectId).subscribe({
      next: (data) => {
        this.tasksDistribution = data
        setTimeout(() => this.renderDistributionChart(), 100)
      },
      error: (err) => {
        console.error("Error loading tasks distribution:", err)
      },
    })
  }

  loadProjectTimeline(): void {
    if (!this.projectId) return

    this.projectService.getProjectTimeline(this.projectId).subscribe({
      next: (data) => {
        this.projectTimeline = data
      },
      error: (err) => {
        console.error("Error loading project timeline:", err)
      },
    })
  }

  toggleProgressSection(): void {
    this.showProgressSection = !this.showProgressSection
    if (this.showProgressSection) {
      setTimeout(() => {
        this.renderProgressChart()
        this.renderDistributionChart()
      }, 100)
    }
  }

  renderProgressChart(): void {
    if (!this.projectProgress || !document.getElementById("progressChart")) return

    if (this.progressCharts.progress) {
      this.progressCharts.progress.destroy()
    }

    this.progressCharts.progress = new Chart("progressChart", {
      type: "doughnut",
      data: {
        labels: ["Terminées", "En cours"],
        datasets: [
          {
            data: [
              this.projectProgress.completedTasks,
              this.projectProgress.totalTasks - this.projectProgress.completedTasks,
            ],
            backgroundColor: ["#4ECDC4", "#F7F7F7"],
            borderWidth: 0,
            borderRadius: 5,
            spacing: 2,
            hoverOffset: 5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "75%",
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              usePointStyle: true,
              padding: 20,
              font: {
                size: 12,
                family: "'Segoe UI', sans-serif",
              },
            },
          },
          tooltip: {
            backgroundColor: "white",
            titleColor: "#64748b",
            bodyColor: "#2d3748",
            bodyFont: {
              size: 14,
              weight: "bold",
            },
            padding: 12,
            boxPadding: 8,
            cornerRadius: 8,
            displayColors: false,
            borderColor: "#e2e8f0",
            borderWidth: 1,
            callbacks: {
              label: (context) => {
                const label = context.label || ""
                const value = context.raw || 0
                const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
                const percentage = Math.round((Number(value) / Number(total)) * 100)
                return `${label}: ${value} (${percentage}%)`
              },
            },
          },
        },
      },
    })
  }

  renderDistributionChart(): void {
    if (!this.tasksDistribution || !document.getElementById("distributionChart")) return

    if (this.progressCharts.distribution) {
      this.progressCharts.distribution.destroy()
    }

    const employeeNames = this.tasksDistribution.employeeDistribution.map((e: any) => e.employeeName)
    const taskCounts = this.tasksDistribution.employeeDistribution.map((e: any) => e.tasksCount)

    this.progressCharts.distribution = new Chart("distributionChart", {
      type: "bar",
      data: {
        labels: employeeNames,
        datasets: [
          {
            label: "Tâches assignées",
            data: taskCounts,
            backgroundColor: "#C7F464",
            borderWidth: 0,
            borderRadius: 6,
            barThickness: 20,
            maxBarThickness: 30,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0,
              font: {
                size: 12,
                family: "'Segoe UI', sans-serif",
              },
              color: "#64748b",
            },
            grid: {
              color: "#f1f5f9",
            },
          },
          x: {
            ticks: {
              font: {
                size: 12,
                family: "'Segoe UI', sans-serif",
              },
              color: "#64748b",
            },
            grid: {
              display: false,
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: "white",
            titleColor: "#64748b",
            bodyColor: "#2d3748",
            bodyFont: {
              size: 14,
              weight: "bold",
            },
            padding: 12,
            boxPadding: 8,
            cornerRadius: 8,
            displayColors: false,
            borderColor: "#e2e8f0",
            borderWidth: 1,
          },
        },
      },
    })
  }

  generatePdfReport(): void {
    if (!this.projectDetails || !this.tasks) {
      alert("Données manquantes")
      return
    }

    this.isGeneratingPdf = true

    // Create PDF container
    const pdfContainer = document.createElement("div")
    pdfContainer.className = "pdf-container"
    pdfContainer.style.width = "794px"
    pdfContainer.style.margin = "0 auto"
    document.body.appendChild(pdfContainer)

    // Header
    const reportHeader = document.createElement("div")
    reportHeader.className = "pdf-header"
    reportHeader.innerHTML = `
      <div class="pdf-logo">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="#4ECDC4"/>
          <path d="M15.5 9L10.5 14L8.5 12" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <h1>Rapport Projet</h1>
      <div class="project-name">${this.projectDetails.name || "Sans nom"}</div>
    `
    pdfContainer.appendChild(reportHeader)

    // Metadata
    const metaSection = document.createElement("div")
    metaSection.className = "pdf-meta"
    metaSection.innerHTML = `
      <div>Généré le: ${new Date().toLocaleDateString()}</div>
      <div>Période: ${this.projectDetails.startDate ? new Date(this.projectDetails.startDate).toLocaleDateString() : "-"} 
      à ${this.projectDetails.endDate ? new Date(this.projectDetails.endDate).toLocaleDateString() : "-"}</div>
      <div>Avancement: ${this.projectProgress?.progressPercentage || 0}%</div>
    `
    pdfContainer.appendChild(metaSection)

    // Progress indicators
    if (this.projectProgress) {
      const progressSection = document.createElement("div")
      progressSection.className = "pdf-progress"
      progressSection.innerHTML = `
       
        <div class="progress-item">
          <div>${this.projectProgress.remainingDays || 0}</div>
          <div>Jours restants</div>
        </div>
        <div class="progress-item">
          <div>${this.projectProgress.averageDelay || 0}</div>
          <div>Retard moyen</div>
        </div>
      `
      pdfContainer.appendChild(progressSection)
    }

    // Tasks table
    const tasksSection = document.createElement("div")
    tasksSection.className = "pdf-table-section"
    tasksSection.innerHTML = `
      <h2>Tâches (${this.tasks.length})</h2>
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Début</th>
            <th>Fin</th>
            <th>État</th>
          </tr>
        </thead>
        <tbody>
          ${this.tasks
            .map(
              (task: any) => `
            <tr>
              <td>${task.description}</td>
              <td>${task.debutdateAffaire ? new Date(task.debutdateAffaire).toLocaleDateString() : "-"}</td>
              <td>${task.FindateAffaire ? new Date(task.FindateAffaire).toLocaleDateString() : "-"}</td>
              <td class="${task.etat ? "done" : "pending"}">${task.etat ? "Terminé" : "En cours"}</td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>
    `
    pdfContainer.appendChild(tasksSection)

    // Employee distribution
    if (this.tasksDistribution?.employeeDistribution) {
      const distSection = document.createElement("div")
      distSection.className = "pdf-table-section"
      distSection.innerHTML = `
        <h2>Répartition par employé</h2>
        <table>
          <thead>
            <tr>
              <th>Employé</th>
              <th>Tâches</th>
              <th>%</th>
            </tr>
          </thead>
          <tbody>
            ${this.tasksDistribution.employeeDistribution
              .map(
                (emp: any) => `
              <tr>
                <td>${emp.employeeName}</td>
                <td>${emp.tasksCount}</td>
                <td>
                  <div class="progress-container">
                    <div class="progress-bar" style="width:${emp.percentage}%">${emp.percentage}%</div>
                  </div>
                </td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
      `
      pdfContainer.appendChild(distSection)
    }

    // Footer
    const footer = document.createElement("div")
    footer.className = "pdf-footer"
    footer.innerHTML = `<div>Page 1</div>`
    pdfContainer.appendChild(footer)

    // Generate PDF
    setTimeout(() => {
      html2canvas(pdfContainer, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      }).then((canvas) => {
        const imgData = canvas.toDataURL("image/png")
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
        })

        const imgWidth = 210
        const imgHeight = (canvas.height * imgWidth) / canvas.width

        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight)
        pdf.save(`Rapport_${this.projectId}_${new Date().toISOString().slice(0, 10)}.pdf`)

        document.body.removeChild(pdfContainer)
        this.isGeneratingPdf = false
      })
    }, 500)
  }
}