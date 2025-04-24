import { Component } from '@angular/core';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { ProfileComponent } from '../profile/profile.component';
import { ProjetComponent } from '../projet/projet.component';
import { NotificationComponent } from '../notification/notification.component';
import { RapportComponent } from '../rapport/rapport.component';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavBarComponent } from "../../nav-bar/nav-bar.component";
@Component({
  selector: 'app-layout',
  imports: [DashboardComponent, ProjetComponent, ProfileComponent, NotificationComponent, RapportComponent, CommonModule, NavBarComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {
  currentView: string = 'dashboard'; // Default view

  // Method to change the current view (optional, can be used for additional logic)
  changeView(view: string): void {
    this.currentView = view;
  }
}
