
import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ActivatedRoute, Router } from "@angular/router"
import { TacheService } from "../../taskServices/tache.service"
import { TimesheetService } from "../../timeSheetService/timesheet.service"
import { AuthService } from "../../auth/auth.service"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"
import { FullCalendarModule } from "@fullcalendar/angular"
import type { CalendarOptions, EventInput } from "@fullcalendar/core"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"

@Component({
  selector: "app-timesheet-user",
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, FullCalendarModule],
  templateUrl: "./timesheet-user.component.html",
  styleUrl: "./timesheet-user.component.css",
})
export class TimesheetUserComponent implements OnInit {
  employeeId = 0
  timesheetId = 0
  timesheet: any = null
  tasks: any[] = []
  conges: any[] = []
  loading = false
  error: string | null = null
  calendarEvents: EventInput[] = []

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: "dayGridMonth",
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,timeGridWeek,timeGridDay",
    },
    editable: false, // Lecture seule
    events: [],
    eventClick: this.handleEventClick.bind(this),
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private timesheetService: TimesheetService,
    private tacheService: TacheService,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.employeeId = +params["employeeId"] || 0
      this.timesheetId = +params["timesheetId"] || 0

      if (this.employeeId && this.timesheetId) {
        this.loadEmployeeTimesheet()
      } else {
        this.error = "Paramètres manquants: ID de l'employé ou du timesheet"
      }
    })
  }

  loadEmployeeTimesheet(): void {
    this.loading = true
    this.error = null

    // Charger le timesheet
    this.timesheetService.getTimesheetById(this.timesheetId).subscribe({
      next: (timesheet) => {
        this.timesheet = timesheet
        this.loadTimesheetTasks()
        this.loadEmployeeConges()
      },
      error: (err) => {
        console.error("Erreur lors du chargement du timesheet:", err)
        this.error = "Impossible de charger le timesheet. Veuillez réessayer plus tard."
        this.loading = false
      },
    })
  }

  loadTimesheetTasks(): void {
    this.timesheetService.getTimesheetTasks(this.timesheetId).subscribe({
      next: (tasks) => {
        this.tasks = tasks
        this.updateCalendarEvents()
      },
      error: (err) => {
        console.error("Erreur lors du chargement des tâches:", err)
        this.loading = false
      },
    })
  }

  loadEmployeeConges(): void {
    this.timesheetService.getCongesByEmployee(this.employeeId).subscribe({
      next: (conges) => {
        this.conges = conges
        this.updateCalendarEvents()
      },
      error: (err) => {
        console.error("Erreur lors du chargement des congés:", err)
        this.loading = false
      },
    })
  }

  updateCalendarEvents(): void {
    // Créer les événements pour les tâches
    const taskEvents = this.tasks.map((task) => ({
      id: `task-${task.id}`,
      title: `Tâche: ${task.description || "Sans titre"}`,
      start: task.debutdateAffaire || new Date(),
      end: task.FindateAffaire,
      backgroundColor: task.etat ? "#4CAF50" : "#2196F3",
      extendedProps: { type: "task", task },
    }))

    // Créer les événements pour les congés
    const congeEvents = this.conges.map((conge) => ({
      id: `conge-${conge.id}`,
      title: `Congé: ${conge.type || "Non spécifié"}`,
      start: new Date(conge.dateDebut),
      end: new Date(conge.dateFin),
      backgroundColor: this.getCongeColor(conge.status),
      borderColor: this.getCongeColor(conge.status),
      extendedProps: { type: "conge", conge },
      allDay: true,
    }))

    // Combiner tous les événements
    this.calendarEvents = [...taskEvents, ...congeEvents]

    // Mettre à jour le calendrier
    this.calendarOptions.events = this.calendarEvents

    this.loading = false
  }

  getCongeColor(status: string): string {
    switch (status) {
      case "APPROUVE":
        return "#4CAF50" // Vert
      case "REFUSE":
        return "#F44336" // Rouge
      case "EN_ATTENTE":
      default:
        return "#FFC107" // Jaune/Orange
    }
  }

  handleEventClick(info: any): void {
    const eventType = info.event.extendedProps ? info.event.extendedProps.type : null

    if (eventType === "task") {
      const task = info.event.extendedProps.task
      alert(`Tâche: ${task.description}\nStatut: ${task.etat ? "Terminée" : "En cours"}`)
    } else if (eventType === "conge") {
      const conge = info.event.extendedProps.conge
      alert(
        `Congé: ${conge.type}\nStatut: ${conge.status}\nPériode: ${new Date(conge.dateDebut).toLocaleDateString()} - ${new Date(conge.dateFin).toLocaleDateString()}`,
      )
    }
  }

  goBack(): void {
    this.router.navigate(["/manager"])
  }

  formatDate(dateString: string): string {
    if (!dateString) return "Non défini"

    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }
}

