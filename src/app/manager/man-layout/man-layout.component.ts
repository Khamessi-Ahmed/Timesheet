import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ManNotificationComponent } from "../man-notification/man-notification.component";
import { ManProjectComponent } from "../man-project/man-project.component";
import { ManTimesheetComponent } from "../man-timesheet/man-timesheet.component";
import { NavBarComponent } from "../../nav-bar/nav-bar.component";
import { ManDashboardComponent } from "../man-dashboard/man-dashboard.component";
import { CongesComponent } from "../conges/conges.component";
import { ListTimesheetComponent } from "../list-timesheet/list-timesheet.component";

@Component({
  selector: 'app-man-layout',
  imports: [CommonModule, ManNotificationComponent, ManProjectComponent, ManTimesheetComponent, NavBarComponent, ManDashboardComponent, CongesComponent,ListTimesheetComponent,],
  templateUrl: './man-layout.component.html',
  styleUrl: './man-layout.component.css'
})
export class ManLayoutComponent {
  currentView: string = 'dashboard'; // Default view

  // Method to change the current view (optional, can be used for additional logic)
  changeView(view: string): void {
    this.currentView = view;
  }
}
