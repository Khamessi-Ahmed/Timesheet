import { Component, type OnInit } from "@angular/core"
import  { AdminService } from "../../AdminService/admin.service"
import { finalize } from "rxjs/operators"
import { FormsModule, NgForm } from "@angular/forms"
import { DashboardComponent } from "../dashboard/dashboard.component"
import { CommonModule } from "@angular/common"

@Component({
  selector: "app-profile",
  standalone: true,
  imports: [FormsModule, DashboardComponent, CommonModule],
  templateUrl: "./profile.component.html",
  styleUrl: "./profile.component.css",
})
export class ProfileComponent implements OnInit {
  users: any[] = []
  showModal = false
  isEditMode = false
  currentUserId: number | null = null
  isLoading = false
  errorMessage: string | null = null

  // Expanded user object with all attributes from User entity and subclasses
  newUser: any = {
    prenom: "",
    nom: "",
    email: "",
    password: "",
    role: "EMPLOYE",
    departement: "",
    niveauScolaire: "",
    adresse: "",
    dateDenaissance: null,
    telefone: "",
    carteCin: "",
    datedelentree: new Date().toISOString().split("T")[0], // Current date in YYYY-MM-DD format
    hourswaorked: 0,
  }

  // Department options
  departmentOptions = [
    "Informatique",
    "Ressources Humaines",
    "Finance",
    "Marketing",
    "Ventes",
    "Production",
    "Recherche et Développement",
    "Service Client",
    "Logistique",
    "Autre",
  ]

  // Education level options
  educationLevelOptions = ["Baccalauréat", "Licence", "Master", "Doctorat", "BTS", "DUT", "Ingénieur", "Autre"]

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadUsers()
  }

  loadUsers(): void {
    this.isLoading = true
    this.errorMessage = null

    this.adminService
      .getEmployees()
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (employees) => {
          const employeeUsers = employees.map((e: any) => ({ ...e, role: "EMPLOYE" }))

          this.adminService.getManagers().subscribe((managers) => {
            const managerUsers = managers.map((m: any) => ({ ...m, role: "MANAGER" }))
            this.users = [...employeeUsers, ...managerUsers]
          })
        },
        error: (err) => {
          this.errorMessage = "Erreur lors du chargement des utilisateurs"
          console.error(err)
        },
      })
  }

  createUser(): void {
    this.showModal = true
    this.isEditMode = false
    // Set default date for new users
    this.newUser.datedelentree = new Date().toISOString().split("T")[0]
  }

  editUser(user: any): void {
    this.isEditMode = true
    this.currentUserId = user.id

    // Copy all user properties
    this.newUser = {
      prenom: user.prenom || "",
      nom: user.nom || "",
      email: user.email || "",
      password: "", // Password intentionally left blank
      role: user.role || "EMPLOYE",
      departement: user.departement || "",
      niveauScolaire: user.niveauScolaire || "",
      adresse: user.adresse || "",
      dateDenaissance: user.dateDenaissance ? new Date(user.dateDenaissance).toISOString().split("T")[0] : null,
      telefone: user.telefone || "",
      carteCin: user.carteCin || "",
      datedelentree: user.datedelentree
        ? new Date(user.datedelentree).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      hourswaorked: user.hourswaorked || 0,
    }

    this.showModal = true
  }

  submitForm(form: NgForm): void {
    if (form.invalid) {
      form.form.markAllAsTouched();
      return;
    }
  
    const userData = {
      ...this.newUser,
      ...(this.isEditMode && { id: this.currentUserId }),
    };

    // Ensure datedelentree is set to current date if not provided
    if (!userData.datedelentree) {
      userData.datedelentree = new Date().toISOString().split("T")[0]
    }

    let request

    if (this.isEditMode) {
      request = this.updateUser(userData)
    } else {
      request = this.createNewUser(userData)
    }

    request.subscribe({
      next: () => {
        this.loadUsers()
        this.closeModal()
      },
      error: (err) => {
        this.errorMessage = "Erreur lors de la sauvegarde"
        console.error(err)
      },
    })
  }

  private createNewUser(userData: any) {
    switch (userData.role) {
      case "MANAGER":
        return this.adminService.createManager(userData)
      case "ADMIN":
        return this.adminService.createAdmin(userData)
      default:
        return this.adminService.createEmployee(userData)
    }
  }

  private updateUser(userData: any) {
    switch (userData.role) {
      case "MANAGER":
        return this.adminService.updateManager(userData)
      case "ADMIN":
        // Implémenter updateAdmin si nécessaire
        throw new Error("Mise à jour admin non implémentée")
      default:
        return this.adminService.updateEmployee(userData)
    }
  }

  deleteUser(userId: number, role: string): void {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) return

    const request =
      role === "MANAGER" ? this.adminService.deleteManager(userId) : this.adminService.deleteEmployee(userId)

    request.subscribe({
      next: () => this.loadUsers(),
      error: (err) => {
        this.errorMessage = "Erreur lors de la suppression"
        console.error(err)
      },
    })
  }

  closeModal(): void {
    this.showModal = false
    this.isEditMode = false
    this.currentUserId = null
    this.newUser = {
      prenom: "",
      nom: "",
      email: "",
      password: "",
      role: "EMPLOYE",
      departement: "",
      niveauScolaire: "",
      adresse: "",
      dateDenaissance: null,
      telefone: "",
      carteCin: "",
      datedelentree: new Date().toISOString().split("T")[0],
      hourswaorked: 0,
    }
  }

  private validateForm(): boolean {
    const requiredFields = ["prenom", "nom", "email", "role", "departement"]
    const isValid = requiredFields.every((field) => !!this.newUser[field])

    if (!isValid) {
      this.errorMessage = "Tous les champs obligatoires doivent être remplis"
      return false
    }

    if (!this.isEditMode && !this.newUser.password) {
      this.errorMessage = "Le mot de passe est requis"
      return false
    }

    // Validate phone number format
    if (this.newUser.telefone && !/^\d{8,}$/.test(this.newUser.telefone)) {
      this.errorMessage = "Le numéro de téléphone doit contenir au moins 8 chiffres"
      return false
    }

    // Validate CIN format (assuming it's a number with specific length)
    if (this.newUser.carteCin && !/^\d{8}$/.test(this.newUser.carteCin)) {
      this.errorMessage = "Le numéro de carte CIN doit contenir 8 chiffres"
      return false
    }

    return true
  }

  // Helper method to format date for display
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
