import { Component, Input } from '@angular/core';
import { 
  IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonIcon 
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-match-header',
  templateUrl: './match-header.component.html',
  styleUrls: ['./match-header.component.scss'],
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonIcon
  ]
})
export class MatchHeaderComponent {
  @Input() team1Name = '';
  @Input() team2Name = '';
  @Input() status = 'pending';
  @Input() elapsedTime = 0;

  getStatusClass(): string {
    switch (this.status?.toLowerCase()) {
      case 'started':
        return 'status-ongoing';
      case 'pending':
        return 'status-scheduled';
      case 'finished':
        return 'status-completed';
      case 'paused':
        return 'status-paused';
      default:
        return 'status-scheduled';
    }
  }

  getStatusText(): string {
    switch (this.status?.toLowerCase()) {
      case 'started':
        return 'Live';
      case 'pending':
        return 'Scheduled';
      case 'finished':
        return 'Completed';
      case 'paused':
        return 'Paused';
      default:
        return 'Scheduled';
    }
  }

  getStatusIcon(): string {
    switch (this.status?.toLowerCase()) {
      case 'started':
        return 'radio-button-on';
      case 'pending':
        return 'time-outline';
      case 'finished':
        return 'checkmark-circle';
      case 'paused':
        return 'pause-circle';
      default:
        return 'time-outline';
    }
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}