import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NavBarComponent } from "../../nav-bar/nav-bar.component";
import { TimesheetComponent } from "../timesheet/timesheet.component";
import { NotificationComponent } from "../../admin/notification/notification.component";
import { ProjectComponent } from "../project/project.component";
import { EmpNotificationComponent } from "../emp-notification/emp-notification.component";
import { TacheComponent } from '../tache/tache.component';

@Component({
  selector: 'app-emp-layout',
  imports: [CommonModule, NavBarComponent, TimesheetComponent, ProjectComponent, EmpNotificationComponent],
  templateUrl: './emp-layout.component.html',
  styleUrl: './emp-layout.component.css'
})
export class EmpLayoutComponent {
  currentView: string = 'project'; // Default view

  // Method to change the current view (optional, can be used for additional logic)
  changeView(view: string): void {
    this.currentView = view;
  }
}
