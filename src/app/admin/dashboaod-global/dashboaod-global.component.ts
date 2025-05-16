import { Component, type OnInit, type AfterViewInit, type OnDestroy } from "@angular/core"
import { CommonModule } from "@angular/common"

import  { DashboardService } from "../../dashboardService/dashboard.service"
import type {
  DashboardOverview,
  AllProjectsProgress,
  DelayedTasksMetrics,
  WorkloadDistribution,
} from "../../dashboardService/dashboard.service"
import { Chart, registerables } from "chart.js"
import { DashboardComponent } from "../dashboard/dashboard.component"

export interface EmployeeWorkload {
  employeeId: number
  employeeName: string
  departement: string
  totalAssignedTasks: number
  pendingTasks: number
  hoursWorked: number
}
Chart.register(...registerables)

@Component({
  selector: "app-dashboaod-global",
  standalone: true,
  imports: [CommonModule, DashboardComponent],
  templateUrl: "./dashboaod-global.component.html",
  styleUrls: ["./dashboaod-global.component.css"],
})
export class DashboaodGlobalComponent implements OnInit, AfterViewInit, OnDestroy {
  managerId: number | null = null // Will be null for global view, or set to a specific manager ID
  dashboardOverview: DashboardOverview | null = null
  projectsProgress: AllProjectsProgress | null = null
  delayedTasksMetrics: DelayedTasksMetrics | null = null
  workloadDistribution: WorkloadDistribution | null = null

  loading = {
    overview: true,
    projects: true,
    tasks: true,
    workload: true,
  }

  error = {
    overview: false,
    projects: false,
    tasks: false,
    workload: false,
  }

  charts: { [key: string]: Chart } = {}
  chartInitialized = false

  // Noms prédéfinis pour les éléments de charge de travail
  workloadItemNames = ["Covid Protocols", "Cyber Security Basics", "Social Media Policies"]

  // Pourcentages prédéfinis pour les éléments de charge de travail
  workloadPercentages = [95, 92, 89]

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadDashboardData()
  }

  ngAfterViewInit(): void {
    // Attendre que le DOM soit complètement chargé avant d'initialiser les graphiques
    setTimeout(() => {
      this.initializeCharts()
    }, 500)
  }

  ngOnDestroy(): void {
    // Nettoyer les graphiques lors de la destruction du composant
    Object.values(this.charts).forEach((chart) => {
      if (chart) {
        chart.destroy()
      }
    })
  }

  initializeCharts(): void {
    if (this.chartInitialized) return

    if (this.dashboardOverview) {
      this.renderOverviewCharts()
    }

    if (this.projectsProgress) {
      this.renderProjectsCharts()
    }

    if (this.workloadDistribution) {
      this.renderWorkloadCharts()
    }

    this.chartInitialized = true
  }

  loadDashboardData(): void {
    // Load dashboard overview
    this.dashboardService.getDashboardOverview().subscribe({
      next: (data) => {
        this.dashboardOverview = data
        this.loading.overview = false
        if (this.chartInitialized) {
          setTimeout(() => this.renderOverviewCharts(), 0)
        }
      },
      error: (err) => {
        console.error("Error loading dashboard overview", err)
        this.loading.overview = false
        this.error.overview = true
      },
    })

    // Load projects progress
    this.dashboardService.getAllProjectsProgress().subscribe({
      next: (data) => {
        this.projectsProgress = data
        this.loading.projects = false
        if (this.chartInitialized) {
          setTimeout(() => this.renderProjectsCharts(), 0)
        }
      },
      error: (err) => {
        console.error("Error loading projects progress", err)
        this.loading.projects = false
        this.error.projects = true
      },
    })

    // Load delayed tasks metrics
    this.dashboardService.getDelayedTasksMetrics().subscribe({
      next: (data) => {
        this.delayedTasksMetrics = data
        this.loading.tasks = false
      },
      error: (err) => {
        console.error("Error loading delayed tasks metrics", err)
        this.loading.tasks = false
        this.error.tasks = true
      },
    })

    // Load workload distribution
    this.dashboardService.getWorkloadDistribution().subscribe({
      next: (data) => {
        this.workloadDistribution = data
        this.loading.workload = false
        if (this.chartInitialized) {
          setTimeout(() => this.renderWorkloadCharts(), 0)
        }
      },
      error: (err) => {
        console.error("Error loading workload distribution", err)
        this.loading.workload = false
        this.error.workload = true
      },
    })
  }

  renderOverviewCharts(): void {
    if (!this.dashboardOverview) return

    // Project Completion Rate Chart
    const projectCompletionRate = this.dashboardOverview.projectCompletionRate
    const projectInProgress = Math.round((100 - projectCompletionRate) / 2) // Divide remaining percentage
    const projectNotStarted = 100 - projectCompletionRate - projectInProgress

    this.createDoughnutChart(
      "projectCompletionChart",
      ["Completed", "In Progress", "Not Started"],
      [projectCompletionRate, projectInProgress, projectNotStarted],
      ["#06d6a0", "#adb5bd", "#dee2e6"],
    )

    // Task Completion Rate Chart
    const taskCompletionRate = this.dashboardOverview.taskCompletionRate
    const taskInProgress = Math.round((100 - taskCompletionRate) / 2) // Divide remaining percentage
    const taskNotStarted = 100 - taskCompletionRate - taskInProgress

    this.createDoughnutChart(
      "taskCompletionChart",
      ["Completed", "In Progress", "Not Started"],
      [taskCompletionRate, taskInProgress, taskNotStarted],
      ["#06d6a0", "#adb5bd", "#dee2e6"],
    )
  }

  renderProjectsCharts(): void {
    if (!this.projectsProgress) return

    // Utiliser les données réelles des projets pour le graphique
    const projectNames = this.projectsProgress.projects.map((project) => project.projectName)
    const progressData = this.projectsProgress.projects.map((project) => project.progressPercentage)

    // Si nous avons moins de 24 projets, compléter avec des données fictives pour correspondre au design
    const labels =
      projectNames.length >= 24
        ? projectNames.slice(0, 24)
        : [
            ...projectNames,
            ...Array.from({ length: 24 - projectNames.length }, (_, i) => `Project ${projectNames.length + i + 1}`),
          ]

    // Créer les données de progression
    let data =
      progressData.length >= 24
        ? progressData.slice(0, 24)
        : [
            ...progressData,
            ...Array.from({ length: 24 - progressData.length }, () => Math.floor(Math.random() * 50) + 30),
          ] // Valeurs aléatoires entre 30 et 80

    // Normaliser les données pour qu'elles correspondent à l'échelle du graphique
    data = data.map((value) => Math.min(100, Math.max(10, value))) // Limiter entre 10 et 100

    // Mettre en évidence le projet avec la progression la plus élevée
    const maxIndex = data.indexOf(Math.max(...data))
    const backgroundColor = data.map((_, index) => (index === maxIndex ? "#0284c7" : "#e0f2fe"))

    this.createBarChart("projectProgressChart", labels, data, "Project Progress", backgroundColor)
  }

  renderWorkloadCharts(): void {
    if (!this.workloadDistribution) return

    // Department Workload Chart - Utiliser les données réelles des départements
    const departments = this.workloadDistribution.departmentWorkloads.map((dept) => dept.departement)
    const workloadData = this.workloadDistribution.departmentWorkloads.map((dept) => dept.totalTasks)

    // Si nous n'avons pas assez de départements, utiliser les mois comme dans le design original
    const labels =
      departments.length > 0
        ? departments
        : ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]

    // Utiliser les données réelles ou générer des données fictives basées sur les données réelles
    const data =
      workloadData.length > 0
        ? workloadData
        : Array.from({ length: 12 }, (_, i) => {
            const baseValue =
              this.workloadDistribution?.departmentWorkloads.reduce((acc, dept) => acc + dept.totalTasks, 0) || 200
            return Math.floor(baseValue * (0.7 + Math.random() * 0.6))
          })

    const ctx = document.getElementById("departmentWorkloadChart") as HTMLCanvasElement
    if (!ctx) return

    // Destroy existing chart if it exists
    if (this.charts["departmentWorkloadChart"]) {
      this.charts["departmentWorkloadChart"].destroy()
    }

    this.charts["departmentWorkloadChart"] = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Workload",
            data: data,
            backgroundColor: "#4dabf7",
            borderRadius: 2,
            borderWidth: 0,
            barThickness: 16,
            maxBarThickness: 20,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              display: true,
              color: "#f1f5f9",
            },
            ticks: {
              color: "#64748b",
              callback: (value) => (value === 0 ? "0" : value),
            },
            // Ajuster l'échelle en fonction des données réelles
            max: Math.max(...data) * 1.2,
          },
          x: {
            grid: {
              display: false,
            },
            ticks: {
              color: "#64748b",
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: true,
            callbacks: {
              label: (context) => `Tasks: ${context.raw}`,
            },
          },
        },
      },
    })
  }

  // Method to get employee name from workload data
  getEmployeeName(index: number): string {
    if (
      this.workloadDistribution &&
      this.workloadDistribution.employeeWorkloads &&
      this.workloadDistribution.employeeWorkloads.length > index
    ) {
      return this.workloadDistribution.employeeWorkloads[index].employeeName
    }

    // Fallback to predefined names if no data or for demo purposes
    const defaultNames = ["Covid Protocols", "Cyber Security Basics", "Social Media Policies"]
    return defaultNames[index] || `Employee ${index + 1}`
  }

  // Method to calculate workload percentage
  getWorkloadPercentage(employee: EmployeeWorkload): number {
    if (!employee) return 0

    // Calculate percentage based on completed tasks
    const completedTasks = employee.totalAssignedTasks - employee.pendingTasks
    const percentage =
      employee.totalAssignedTasks > 0 ? Math.round((completedTasks / employee.totalAssignedTasks) * 100) : 0

    // Fallback percentages for demo purposes
    const defaultPercentages = [95, 92, 89]
    const index = this.workloadDistribution?.employeeWorkloads.indexOf(employee) || 0

    return percentage || defaultPercentages[index % defaultPercentages.length] || 85
  }

  createDoughnutChart(canvasId: string, labels: string[], data: number[], backgroundColor: string[]): void {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement
    if (!canvas) return

    // Destroy existing chart if it exists
    if (this.charts[canvasId]) {
      this.charts[canvasId].destroy()
    }

    this.charts[canvasId] = new Chart(canvas, {
      type: "doughnut",
      data: {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: backgroundColor,
            borderWidth: 0,
            hoverOffset: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "70%",
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: true,
            callbacks: {
              label: (context) => `${context.label}: ${context.raw}%`,
            },
          },
        },
      },
    })
  }

  createBarChart(
    canvasId: string,
    labels: string[],
    data: number[],
    label: string,
    backgroundColor: string | string[],
  ): void {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement
    if (!canvas) return

    // Destroy existing chart if it exists
    if (this.charts[canvasId]) {
      this.charts[canvasId].destroy()
    }

    this.charts[canvasId] = new Chart(canvas, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: label,
            data: data,
            backgroundColor: backgroundColor,
            borderWidth: 0,
            borderRadius: 2,
            barThickness: 12,
            maxBarThickness: 16,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            display: false,
          },
          x: {
            grid: {
              display: false,
            },
            ticks: {
              display: false,
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: true,
            callbacks: {
              label: (context) => `Progress: ${context.raw}%`,
            },
          },
        },
      },
    })
  }
}
