import { Component, AfterViewInit, ElementRef, ViewChild, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DashboardComponent } from "../../admin/dashboard/dashboard.component";
import { AuthService } from '../../auth/auth.service';
import { DashboardService, DashboardOverview, AllProjectsProgress, DelayedTasksMetrics, WorkloadDistribution } from "../../dashboardService/dashboard.service";

import Chart from 'chart.js/auto';

@Component({
  selector: "app-man-dashboard",
  standalone: true,
  imports: [DashboardComponent, CommonModule],
  templateUrl: "./man-dashboard.component.html",
  styleUrl: "./man-dashboard.component.css",
})
export class ManDashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('activeUsersChart') activeUsersChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('salesChart') salesChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('deviceChart') deviceChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('locationChart') locationChartRef!: ElementRef<HTMLCanvasElement>;
  
  private activeUsersChart!: Chart;
  private salesChart!: Chart;
  private deviceChart!: Chart;
  private locationChart!: Chart;

  currentManagerId!: number;
  currentYear: number = new Date().getFullYear();
  
  // Dashboard data
  dashboardOverview: DashboardOverview | null = null;
  projectsProgress: AllProjectsProgress | null = null;
  delayedTasks: DelayedTasksMetrics | null = null;
  workloadDistribution: WorkloadDistribution | null = null;

  constructor(private dashboardService: DashboardService, private authService: AuthService) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user && user.role === 'MANAGER') {
      this.currentManagerId = user.id;
    }
 
    this.loadDashboardData();
  }

  ngAfterViewInit(): void {
    // Charts will be initialized after data is loaded
  }

  private loadDashboardData(): void {
    // Load dashboard overview for the current manager
    this.dashboardService.getDashboardOverviewByManager(this.currentManagerId).subscribe(data => {
      this.dashboardOverview = data;
      
      // Initialize charts after data is loaded
      if (this.salesChartRef) {
        this.initTasksOverviewChart();
      }
    });

    // Load projects progress for the current manager
    this.dashboardService.getProjectsProgressByManager(this.currentManagerId).subscribe(data => {
      this.projectsProgress = data;
      if (this.activeUsersChartRef) {
        this.initProjectsProgressChart();
      }
    });

    // Load workload distribution for the current manager's team
    this.dashboardService.getWorkloadDistributionByManager(this.currentManagerId).subscribe(data => {
      this.workloadDistribution = data;
      if (this.deviceChartRef) {
        this.initWorkloadDistributionChart();
      }
    });

    // Load delayed tasks for the current manager's projects
    this.dashboardService.getDelayedTasksMetricsByManager(this.currentManagerId).subscribe(data => {
      this.delayedTasks = data;
      if (this.locationChartRef) {
        this.initDashboardOverviewChart();
      }
    });
  }

  private initProjectsProgressChart(): void {
    if (!this.activeUsersChartRef || !this.projectsProgress) return;
    
    const ctx = this.activeUsersChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    // Extract project names and progress percentages (limit to 10 for readability)
    const projects = this.projectsProgress.projects.slice(0, 10);
    const labels = projects.map(p => p.projectName);
    const data = projects.map(p => p.progressPercentage);

    this.activeUsersChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          borderColor: 'rgba(255, 255, 255, 1)',
          borderWidth: 0,
          borderRadius: 4,
          barThickness: 20,
          maxBarThickness: 30
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.7)',
              font: {
                size: 10
              }
            },
            border: {
              display: false
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              display: false
            },
            border: {
              display: false
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            titleColor: '#333',
            bodyColor: '#333',
            padding: 10,
            cornerRadius: 6,
            callbacks: {
              title: function(tooltipItems) {
                return projects[tooltipItems[0].dataIndex]?.projectName || '';
              },
              label: function(context) {
                return `Progression: ${context.raw}%`;
              }
            }
          }
        }
      }
    });
  }

  private initTasksOverviewChart(): void {
    if (!this.salesChartRef || !this.dashboardOverview) return;
    
    const ctx = this.salesChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    
    // Create simulated monthly data for current and previous year
    const currentYearData = months.map((_, index) => {
      return Math.round(50 + Math.random() * 30 + index * 5);
    });
    
    const previousYearData = months.map((_, index) => {
      return Math.round(40 + Math.random() * 20 + index * 3);
    });

    this.salesChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: months,
        datasets: [
          {
            label: `${this.currentYear}`,
            data: currentYearData,
            borderColor: 'rgba(75, 222, 216, 1)',
            backgroundColor: 'rgba(75, 222, 216, 0.2)',
            tension: 0.4,
            fill: true,
            pointRadius: 0
          },
          {
            label: `${this.currentYear - 1}`,
            data: previousYearData,
            borderColor: 'rgba(100, 100, 100, 0.8)',
            backgroundColor: 'rgba(100, 100, 100, 0.1)',
            tension: 0.4,
            fill: true,
            pointRadius: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)',
            },
            border: {
              display: false
            }
          },
          x: {
            grid: {
              display: false
            },
            border: {
              display: false
            }
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            align: 'end',
            labels: {
              boxWidth: 12,
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            titleColor: '#333',
            bodyColor: '#333',
            padding: 10,
            cornerRadius: 6,
            callbacks: {
              label: function(context) {
                return `${context.dataset.label}: ${context.raw} tâches`;
              }
            }
          }
        }
      }
    });
  }

  private initWorkloadDistributionChart(): void {
    if (!this.deviceChartRef || !this.workloadDistribution) return;
    
    const ctx = this.deviceChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    // Get department workloads
    const departments = this.workloadDistribution.departmentWorkloads.map(d => d.departement);
    const taskCounts = this.workloadDistribution.departmentWorkloads.map(d => d.totalTasks);

    // Generate colors for each department
    const backgroundColors = [
      'rgba(113, 142, 251, 0.8)', // blue
      'rgba(157, 236, 158, 0.8)', // green
      'rgba(52, 52, 52, 0.8)',    // black
      'rgba(111, 207, 255, 0.8)', // light blue
      'rgba(170, 170, 170, 0.8)', // gray
      'rgba(255, 187, 107, 0.8)'  // orange
    ];

    this.deviceChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: departments,
        datasets: [{
          label: 'Tâches',
          data: taskCounts,
          backgroundColor: backgroundColors,
          borderRadius: 6,
          borderWidth: 0,
          maxBarThickness: 50
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)',
            },
            border: {
              display: false
            }
          },
          x: {
            grid: {
              display: false
            },
            border: {
              display: false
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            titleColor: '#333',
            bodyColor: '#333',
            padding: 10,
            cornerRadius: 6,
            callbacks: {
              label: function(context) {
                return `${context.dataset.label}: ${context.raw}`;
              }
            }
          }
        }
      }
    });
  }

  private initDashboardOverviewChart(): void {
    if (!this.locationChartRef || !this.delayedTasks) return;
    
    const ctx = this.locationChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    // Use delayed tasks by project for the manager
    const projectNames = this.delayedTasks.delaysByProject.slice(0, 4).map(p => p.projectName);
    const delayedTasksCounts = this.delayedTasks.delaysByProject.slice(0, 4).map(p => p.delayedTasksCount);

    // Colors similar to the reference image
    const backgroundColors = [
      '#333333',    // dark gray/black
      '#6fcfff',    // light blue
      '#9dec9e',    // light green
      '#c8dcf0'     // very light blue
    ];

    this.locationChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: projectNames,
        datasets: [{
          data: delayedTasksCounts,
          backgroundColor: backgroundColors,
          borderWidth: 0,
          hoverOffset: 5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            titleColor: '#333',
            bodyColor: '#333',
            padding: 10,
            cornerRadius: 6,
            callbacks: {
              label: function(context) {
                const total = delayedTasksCounts.reduce((sum, val) => sum + val, 0);
                const percentage = total > 0 ? ((context.raw as number) / total * 100).toFixed(1) : '0';
                return `${context.label}: ${context.raw} tâches (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }

  // Helper methods for the template
  getProjectCompletionRate(): string {
    if (!this.dashboardOverview) return '0%';
    return this.dashboardOverview.projectCompletionRate.toFixed(1) + '%';
  }

  getTaskCompletionRate(): string {
    if (!this.dashboardOverview) return '0%';
    return this.dashboardOverview.taskCompletionRate.toFixed(1) + '%';
  }

  getDelayPercentage(index: number): string {
    if (!this.delayedTasks || !this.delayedTasks.delaysByProject[index]) return '0%';
    
    const project = this.delayedTasks.delaysByProject[index];
    const totalDelayed = this.delayedTasks.totalDelayedTasks;
    
    if (totalDelayed === 0) return '0%';
    return ((project.delayedTasksCount / totalDelayed) * 100).toFixed(1) + '%';
  }

  getColorClass(index: number): string {
    const classes = ['us', 'ca', 'mx', 'other'];
    return classes[index % classes.length];
  }
}