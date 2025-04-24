import { Component,OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-notification',
  imports: [DatePipe,CommonModule],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.css'
})
export class NotificationComponent implements OnInit {

  notifications = [
    {
      title: 'New comment on your post',
      message: 'John Doe commented on your recent post. Check it out!',
      type: 'info',
      date: new Date()
    },
    {
      title: 'Password changed successfully',
      message: 'Your password has been successfully updated.',
      type: 'success',
      date: new Date()
    },
    {
      title: 'Error with your submission',
      message: 'There was an error processing your request. Please try again later.',
      type: 'error',
      date: new Date()
    }
  ];

  constructor() { }

  ngOnInit(): void { }

  // Delete Notification Function
  deleteNotification(index: number): void {
    this.notifications.splice(index, 1);
  }

}
