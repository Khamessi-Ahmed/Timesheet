import { Component,OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-login',
  imports: [CommonModule,FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  showPassword = false;
  errorMessage: string = '';
  isLoading: boolean = false;
loginObj = {
  email: '',
  password: ''
};
  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {

  }



  login() { // Modifier pour utiliser NgForm
    if (this.loginObj.email==""||this.loginObj.password=="") {
      this.errorMessage = 'Veuillez remplir tous les champs';
      return;
    }
    
    this.isLoading = true;
    this.errorMessage = '';
    console.log(this.loginObj);
    
    this.authService.login(this.loginObj.email, this.loginObj.password).subscribe({
      next: (response) => {
        const userRole = this.authService.getUserRole();
        this.redirectBasedOnRole(userRole);
    
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Email ou mot de passe incorrect';
        console.error('Login error:', err);
      },
      complete: () => this.isLoading = false
    });
  }
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
  
  private redirectBasedOnRole(role: string | null) {
    switch(role) {
      case 'ADMIN':
        this.router.navigate(['/adminLayout']);
        break;
      case 'MANAGER':
        this.router.navigate(['/manager']);
        break;
      case 'EMPLOYE': // Corriger 'employee' -> 'employe'
        this.router.navigate(['/employee']);
        break;
      default:
        this.router.navigate(['/']);
    }
    
  }

}
