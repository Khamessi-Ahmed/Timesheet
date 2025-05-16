import { Component, ViewChild, OnInit, AfterViewInit } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { CommonModule } from "@angular/common"
import {
  FormBuilder,
  type FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
  type AbstractControl,
} from "@angular/forms"
import { MatDialogModule, MatDialog } from "@angular/material/dialog"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"
import { MatFormFieldModule } from "@angular/material/form-field"
import { MatInputModule } from "@angular/material/input"
import { MatSelectModule } from "@angular/material/select"
import { MatDatepickerModule } from "@angular/material/datepicker"
import { MatNativeDateModule } from "@angular/material/core"
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar"
import { FullCalendarComponent, FullCalendarModule } from "@fullcalendar/angular"
import { CalendarOptions, EventInput } from "@fullcalendar/core"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"
import { Draggable } from "@fullcalendar/interaction"
import { DragDropModule } from "@angular/cdk/drag-drop"
import { TacheService } from "../../taskServices/tache.service"
import { TimesheetService } from "../../timeSheetService/timesheet.service"
import { AuthService } from "../../auth/auth.service"

@Component({
  selector: "app-timesheet",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    FullCalendarModule,
    DragDropModule,
  ],
  templateUrl: "./timesheet.component.html",
  styleUrl: "./timesheet.component.css",
})
export class TimesheetComponent implements OnInit, AfterViewInit {
  @ViewChild("calendar") calendarComponent!: FullCalendarComponent

  // Propriétés existantes
  tasks: any[] = []
  timesheet: any = null
  timesheetId!: number
  employeeId = 0 // Valeur par défaut pour le développement
  calendarEvents: EventInput[] = []
  selectedTask: any = null
  loading = false
  error: string | null = null

  // Nouvelles propriétés pour les projets
  projects: any[] = []
  selectedProject: any = null
  projectTasks: any[] = []
  draggableInitialized = false // Nouvelle propriété pour suivre l'initialisation du draggable

  // Propriétés pour les congés
  congesForm!: FormGroup
  conges: any[] = []
  selectedConge: any = null
  showCongesForm = false
  typeOptions = [
    { value: "CONGE_PAYE", label: "Congé payé" },
    { value: "MALADIE", label: "Congé maladie" },
    { value: "SANS_SOLDE", label: "Congé sans solde" },
    { value: "FORMATION", label: "Formation" },
    { value: "AUTRE", label: "Autre" },
  ]

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: "dayGridMonth",
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,timeGridWeek,timeGridDay",
    },
    editable: true,
    droppable: true, // Permettre le drop externe
    events: [],
    dateClick: this.handleDateClick.bind(this),
    eventClick: this.handleEventClick.bind(this),
    eventReceive: this.handleEventReceive.bind(this),
    eventDrop: this.handleEventDrop.bind(this),
  }

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private tacheService: TacheService,
    private timesheetService: TimesheetService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.initCongesForm()
    this.initializeEmployeeData()
  }

  ngAfterViewInit(): void {
    // Attendre que le DOM soit complètement chargé
    setTimeout(() => {
      // S'assurer que les événements sont chargés avant de mettre à jour le calendrier
      if (this.calendarEvents.length > 0) {
        this.updateCalendar()
      } else {
        console.log("Aucun événement disponible lors de l'initialisation du calendrier")
      }

      // Configurer le calendrier avec les options
      if (this.calendarComponent) {
        const calendarApi = this.calendarComponent.getApi()
        calendarApi.setOption("eventTimeFormat", {
          hour: "2-digit",
          minute: "2-digit",
          meridiem: false,
        })
      }
    }, 500)
  }

  // Méthode modifiée pour initialiser le draggable
  setupDraggable(): void {
    // Si déjà initialisé, ne pas réinitialiser
    if (this.draggableInitialized) {
      return
    }

    console.log("Initialisation du draggable...")
    
    // Attendre que le DOM soit prêt
    setTimeout(() => {
      const containerEl = document.getElementById("task-list-container")
      if (containerEl) {
        try {
          new Draggable(containerEl, {
            itemSelector: ".task",
            eventData: (eventEl) => {
              try {
                const taskJson = eventEl.getAttribute("data-task")
                if (!taskJson) {
                  console.error("Attribut data-task manquant sur l'élément", eventEl)
                  return { title: "Tâche inconnue" }
                }
                
                const task = JSON.parse(taskJson)
                console.log("Tâche en cours de glisser-déposer:", task)
                
                return {
                  title: task.description || "Tâche sans titre",
                  start: new Date(),
                  end: new Date(new Date().getTime() + 60 * 60 * 1000), // 1 heure par défaut
                  extendedProps: { task },
                }
              } catch (error) {
                console.error("Erreur lors de la création des données d'événement:", error)
                return { title: "Erreur" }
              }
            },
          })
          
          this.draggableInitialized = true
          console.log("Draggable initialisé avec succès")
        } catch (error) {
          console.error("Erreur lors de l'initialisation du draggable:", error)
        }
      } else {
        console.error("Conteneur de tâches non trouvé dans le DOM")
      }
    }, 1000) // Délai plus long pour s'assurer que le DOM est prêt
  }

  // Initialisation du formulaire de congés avec validation améliorée
  initCongesForm(): void {
    this.congesForm = this.fb.group(
      {
        description: ["", [Validators.required, Validators.minLength(5)]],
        dateDebut: ["", Validators.required],
        dateFin: ["", Validators.required],
        type: ["", Validators.required],
      },
      { validators: this.dateRangeValidator },
    )
  }

  // Validateur personnalisé pour vérifier que la date de fin est après la date de début
  dateRangeValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const dateDebut = control.get("dateDebut")?.value
    const dateFin = control.get("dateFin")?.value

    if (dateDebut && dateFin) {
      const start = new Date(dateDebut)
      const end = new Date(dateFin)

      if (end < start) {
        control.get("dateFin")?.setErrors({ dateInvalid: true })
        return { dateInvalid: true }
      }
    }

    return null
  }

  // Méthode modifiée pour charger les tâches disponibles
  loadAvailableTasks(callback?: () => void): void {
    this.loading = true
    console.log("Chargement des tâches disponibles pour l'employé:", this.employeeId)
    
    this.tacheService.getTachesByEmployee(this.employeeId).subscribe({
      next: (tasks) => {
        if (Array.isArray(tasks)) {
          this.tasks = tasks
          console.log("Tâches disponibles chargées:", this.tasks.length)
          
          // Initialiser le draggable après avoir chargé les tâches
          this.setupDraggable()
        } else {
          console.error("Données des tâches disponibles invalides :", tasks)
          this.tasks = []
        }
        this.loading = false
  
        // Execute the callback if provided
        if (callback) {
          callback()
        }
      },
      error: (err) => {
        console.error("Erreur lors du chargement des tâches disponibles :", err)
        this.tasks = []
        this.loading = false
  
        // Execute the callback even in case of an error
        if (callback) {
          callback()
        }
      },
    })
  }

  initializeEmployeeData(): void {
    try {
      const user = this.authService.getCurrentUser()
      if (user && user.id) {
        this.employeeId = user.id
      } else {
        console.warn("Utilisateur non trouvé, utilisation de l'ID par défaut:", this.employeeId)
      }
      this.loadTimesheet()
      this.loadProjects()
      this.loadAvailableTasks() // Charger les tâches disponibles
      this.loadConges()
    } catch (error) {
      console.error("Erreur lors de l'initialisation des données:", error)
      // Continuer avec l'ID par défaut
      this.loadTimesheet()
      this.loadProjects()
      this.loadAvailableTasks()
      this.loadConges()
    }
  }

  loadTimesheet(): void {
    this.loading = true
    this.error = null

    this.timesheetService.getEmployeeTimesheet(this.employeeId).subscribe({
      next: (timesheet) => {
        if (timesheet && timesheet.id) {
          this.timesheet = timesheet
          this.timesheetId = timesheet.id
          this.loadTimesheetTasks()
        } else {
          this.error = "Les données du timesheet sont invalides ou vides."
          console.error("Données timesheet invalides :", timesheet)
        }
        this.loading = false
      },
      error: (err) => {
        this.error = "Échec du chargement du timesheet. Veuillez réessayer."
        console.error("Erreur lors du chargement du timesheet :", err)
        this.loading = false
      },
    })
  }

  // Nouvelle méthode pour charger les projets
  loadProjects(): void {
    this.loading = true
    console.log("Chargement des projets pour l'employé:", this.employeeId)
   
    this.http.get(`http://localhost:8080/api/projects/byEmployee/${this.employeeId}`).subscribe({
      next: (projects: any) => {
        if (Array.isArray(projects)) {
          this.projects = projects
          console.log("Projets chargés:", this.projects.length)
        } else {
          console.error("Données des projets invalides :", projects)
          this.projects = []
        }
        this.loading = false
      },
      error: (err) => {
        console.error("Erreur lors du chargement des projets :", err)
        this.projects = []
        this.loading = false
      },
    })
  }

  // Méthode pour sélectionner un projet et afficher ses tâches
  selectProject(project: any): void {
    this.selectedProject = project
    console.log("Projet sélectionné:", project)
    this.loadProjectTasks(project.id)
  }

  // Méthode pour désélectionner un projet
  deselectProject(): void {
    this.selectedProject = null
    this.projectTasks = []
  }

  // Méthode modifiée pour charger les tâches d'un projet
  loadProjectTasks(projectId: number): void {
    this.loading = true
    console.log("Chargement des tâches pour le projet:", projectId)
  
    // Fetch all tasks of the project
    this.http.get(`http://localhost:8080/api/projects/${projectId}/tasks`).subscribe({
      next: (tasks: any) => {
        if (Array.isArray(tasks)) {
          console.log("Tâches du projet chargées:", tasks.length)
          
          // Filter tasks based on the employee ID using loadAvailableTasks
          this.loadAvailableTasks(() => {
            // Filtrer les tâches qui sont assignées à l'employé
            this.projectTasks = tasks.filter((task: any) =>
              this.tasks.some((employeeTask: any) => employeeTask.id === task.id)
            )
            
            console.log("Tâches filtrées pour l'employé:", this.projectTasks.length)
            
            // Réinitialiser le draggable après avoir mis à jour les tâches du projet
            this.draggableInitialized = false
            this.setupDraggable()
          })
        } else {
          console.error("Données des tâches du projet invalides :", tasks)
          this.projectTasks = []
          this.loading = false
        }
      },
      error: (err) => {
        console.error("Erreur lors du chargement des tâches du projet :", err)
        this.projectTasks = []
        this.loading = false
      },
    })
  }

  // Méthode pour obtenir le nombre de tâches d'un projet
  getProjectTasksCount(project: any): number {
    // Si vous avez déjà cette information dans l'objet projet, utilisez-la
    if (project.taskCount !== undefined) {
      return project.taskCount
    }

    // Sinon, retournez une valeur par défaut
    return 0
  }

  loadTimesheetTasks(): void {
    if (!this.timesheetId) {
      console.error("Impossible de charger les tâches : ID du timesheet manquant")
      return
    }

    this.loading = true
    this.timesheetService.getTimesheetTasks(this.timesheetId).subscribe({
      next: (tasks) => {
        if (Array.isArray(tasks)) {
          console.log("Tâches du timesheet chargées:", tasks.length)
          this.calendarEvents = tasks.map((task) => ({
            id: task.id?.toString() || `task-${Math.random()}`,
            title: task.description || "Tâche sans titre",
            start: task.debutdateAffaire || new Date(),
            end: task.FindateAffaire,
            backgroundColor: task.etat ? "#4CAF50" : "#2196F3",
            extendedProps: { task, type: "task" },
          }))
          this.updateCalendar()
        } else {
          console.error("Données des tâches invalides :", tasks)
        }
        this.loading = false
      },
      error: (err) => {
        console.error("Erreur lors du chargement des tâches :", err)
        this.loading = false
      },
    })
  }

  // Chargement des congés
  loadConges(): void {
    if (!this.employeeId) {
      console.error("Impossible de charger les congés : ID de l'employé manquant")
      return
    }

    this.loading = true
    this.timesheetService.getCongesByEmployee(this.employeeId).subscribe({
      next: (conges) => {
        if (Array.isArray(conges)) {
          this.conges = conges
          console.log("Congés chargés:", this.conges.length)

          // Filtrer les événements existants pour ne garder que les tâches (pas les congés)
          this.calendarEvents = this.calendarEvents.filter(
            (event) => !event.id || !String(event.id).startsWith("conge-"),
          )

          // Ajouter les congés au calendrier
          if (conges.length > 0) {
            console.log("Ajout de", conges.length, "congés au calendrier")
            const congesEvents = conges.map((conge) => ({
              id: `conge-${conge.id}`,
              title: `Congé: ${conge.type || "Non spécifié"}`,
              start: new Date(conge.dateDebut),
              end: new Date(conge.dateFin),
              backgroundColor: this.getCongeColor(conge.status),
              borderColor: this.getCongeColor(conge.status),
              extendedProps: { conge, type: "conge" },
              allDay: true,
            }))

            // Fusionner avec les événements existants
            this.calendarEvents = [...this.calendarEvents, ...congesEvents]
          }

          // Mettre à jour le calendrier avec un délai pour s'assurer qu'il est initialisé
          setTimeout(() => this.updateCalendar(), 100)
        }
        this.loading = false
      },
      error: (err) => {
        console.error("Erreur lors du chargement des congés :", err)
        this.loading = false
      },
    })
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

  // Méthode pour obtenir la classe CSS du statut du timesheet
  getStatusClass(status: string): string {
    if (!status) return "status-pending"

    switch (status.toUpperCase()) {
      case "VALIDATED":
        return "status-validated"
      case "REJECTED":
        return "status-rejected"
      default:
        return "status-pending"
    }
  }

  // Méthode pour obtenir le libellé du statut du timesheet
  getStatusLabel(status: string): string {
    if (!status) return "En attente"

    switch (status.toUpperCase()) {
      case "VALIDATED":
        return "Validé"
      case "REJECTED":
        return "Rejeté"
      default:
        return "En attente"
    }
  }

  // Méthode améliorée pour gérer la réception d'un événement
  handleEventReceive(info: any): void {
    console.log("Événement reçu:", info)
    
    const task = info.event.extendedProps ? info.event.extendedProps.task : null
    if (task) {
      console.log("Tâche associée à l'événement:", task)
      
      const startDate = info.event.start
      const endDate = info.event.end || new Date(startDate.getTime() + 60 * 60 * 1000)
      
      console.log("Mise à jour de la tâche sur le calendrier:", {
        taskId: task.id,
        startDate,
        endDate
      })
      
      this.updateTaskOnCalendar(task.id, startDate, endDate)
    } else {
      console.error("Impossible de trouver la tâche associée à l'événement reçu")
    }
  }

  // Méthode améliorée pour mettre à jour une tâche sur le calendrier
  updateTaskOnCalendar(taskId: number, startDate: Date, endDate: Date): void {
    this.loading = true
    console.log("Mise à jour de la tâche:", taskId)

    const startIso = startDate.toISOString()
    const endIso = endDate.toISOString()

    console.log("Dates formatées:", {
      start: startIso,
      end: endIso
    })

    this.timesheetService
      .updateTaskStatus(taskId, this.employeeId, {
        debutdateAffaire: startIso,
        FindateAffaire: endIso,
      })
      .subscribe({
        next: (response) => {
          console.log("Tâche mise à jour avec succès :", response)
          
          // Afficher un message de succès
          this.snackBar.open("Tâche ajoutée au calendrier avec succès", "Fermer", {
            duration: 3000,
            panelClass: ["success-snackbar"],
          })
          
          // Recharger les tâches du timesheet pour mettre à jour l'affichage
          this.loadTimesheetTasks()
          
          this.loading = false
        },
        error: (err) => {
          console.error("Erreur lors de la mise à jour de la tâche :", err)
          
          // Afficher un message d'erreur
          this.snackBar.open("Erreur lors de l'ajout de la tâche au calendrier", "Fermer", {
            duration: 5000,
            panelClass: ["error-snackbar"],
          })
          
          this.loading = false
        },
      })
  }

  // Méthode améliorée pour mettre à jour le calendrier
  updateCalendar(): void {
    try {
      if (!this.calendarComponent) {
        console.warn("Composant calendrier non initialisé, nouvelle tentative dans 500ms")
        setTimeout(() => this.updateCalendar(), 500)
        return
      }

      console.log("Mise à jour du calendrier avec", this.calendarEvents.length, "événements")

      const calendarApi = this.calendarComponent.getApi()
      calendarApi.removeAllEvents()

      // Vérifier si les événements sont valides avant de les ajouter
      if (this.calendarEvents && this.calendarEvents.length > 0) {
        // Afficher les détails des événements pour le débogage
        this.calendarEvents.forEach((event) => {
          console.log(
            `Événement: ${event.title}, Début: ${event.start}, Fin: ${event.end}, Type: ${event.extendedProps ? event.extendedProps['type'] : "inconnu"}`,
          )
        })

        calendarApi.addEventSource(this.calendarEvents)
      } else {
        console.warn("Aucun événement à afficher dans le calendrier")
      }

      calendarApi.refetchEvents()
    } catch (error) {
      console.error("Erreur lors de la mise à jour du calendrier:", error)
    }
  }

  handleDateClick(arg: any): void {
    console.log("Date cliquée :", arg.dateStr)
  }

  handleEventClick(arg: any): void {
    const eventType = arg.event.extendedProps ? arg.event.extendedProps.type : null

    if (eventType === "conge") {
      const conge = arg.event.extendedProps.conge
      this.showCongeDetails(conge)
    } else {
      const task = arg.event.extendedProps ? arg.event.extendedProps.task : null
      this.showTaskDetails(task)
    }
  }

  handleEventDrop(event: any): void {
    console.log("Événement déplacé:", event)
    
    const { event: droppedEvent } = event
    const task = droppedEvent.extendedProps ? droppedEvent.extendedProps.task : null
    
    if (task) {
      console.log("Tâche associée à l'événement déplacé:", task)
      
      const startDate = droppedEvent.start
      const endDate = droppedEvent.end || new Date(startDate.getTime() + 60 * 60 * 1000)
      
      console.log("Nouvelles dates:", {
        start: startDate,
        end: endDate
      })
      
      this.updateTaskOnCalendar(task.id, startDate, endDate)
    } else {
      console.error("Impossible de trouver la tâche associée à l'événement déplacé")
    }
  }

  showTaskDetails(task: any): void {
    this.selectedTask = task
    this.selectedConge = null
  }

  showCongeDetails(conge: any): void {
    this.selectedConge = conge
    this.selectedTask = null
  }

  toggleCongesForm(): void {
    this.showCongesForm = !this.showCongesForm
    if (this.showCongesForm) {
      this.congesForm.reset()
    }
  }

  submitCongesForm(): void {
    if (this.congesForm.invalid) {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      Object.keys(this.congesForm.controls).forEach((key) => {
        const control = this.congesForm.get(key)
        control?.markAsTouched()
      })
      return
    }

    this.loading = true
    const formValues = this.congesForm.value

    // Convertir les dates au format SQL
    const dateDebut = new Date(formValues.dateDebut)
    const dateFin = new Date(formValues.dateFin)

    const congesData = {
      description: formValues.description,
      dateDebut: this.formatDateForBackend(dateDebut),
      dateFin: this.formatDateForBackend(dateFin),
      type: formValues.type,
      status: "EN_ATTENTE",
    }

    this.timesheetService.addConges(this.employeeId, congesData).subscribe({
      next: (response) => {
        this.snackBar.open("Demande de congé soumise avec succès!", "Fermer", {
          duration: 3000,
          panelClass: ["success-snackbar"],
        })
        this.congesForm.reset()
        this.showCongesForm = false
        this.loading = false

        // Recharger les congés pour mettre à jour l'affichage
        this.loadConges()
      },
      error: (err) => {
        this.snackBar.open("Erreur lors de la soumission de la demande de congé.", "Fermer", {
          duration: 5000,
          panelClass: ["error-snackbar"],
        })
        console.error("Erreur:", err)
        this.loading = false
      },
    })
  }

  formatDateForBackend(date: Date): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  changeView(view: string): void {
    if (this.calendarComponent) {
      this.calendarComponent.getApi().changeView(view)
    }
  }

  goToToday(): void {
    if (this.calendarComponent) {
      this.calendarComponent.getApi().today()
    }
  }

  reloadConges(): void {
    console.log("Rechargement des congés...")
    // Vider les événements de congés existants
    this.calendarEvents = this.calendarEvents.filter((event) => !event.id || !String(event.id).startsWith("conge-"))

    // Recharger les congés
    this.loadConges()
  }
  
  // Nouvelle méthode pour recharger les tâches
  reloadTasks(): void {
    console.log("Rechargement des tâches...")
    this.loadAvailableTasks()
    
    if (this.selectedProject) {
      this.loadProjectTasks(this.selectedProject.id)
    }
    
    this.loadTimesheetTasks()
  }
}
