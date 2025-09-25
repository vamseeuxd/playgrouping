import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { IonAvatar, IonButton, IonLabel, IonImg } from '@ionic/angular/standalone';
import { TitleCasePipe } from '@angular/common';
import { APP_CONSTANTS } from '../../constants/app.constants';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  imports: [IonImg, IonLabel, RouterLink, IonAvatar, IonButton, TitleCasePipe],
  styles: [
    `
      :host {
        display: flex;
        background: #f8f9fa;
        padding: 2rem 0;
        flex-direction: column;
        flex-wrap: nowrap;
        justify-content: center;
        width: 100%;
        align-items: center;
        text-align: center;
        font-size: 1rem;
        font-weight: normal;
      }
      .action-bar {
        display: flex;
      }
      .profile-info {
        display: flex;
        flex-direction: column;
        flex-wrap: nowrap;
        align-items: center;
        justify-content: center;
        .name {
          font-weight: bold;
        }
      }
    `,
  ],
})
export class UserProfileComponent {
  @Input() user: any;
  @Output() logoutClick = new EventEmitter<void>();
  @Output() closeMenu = new EventEmitter<void>();
  constants = APP_CONSTANTS;

  constructor(private router: Router) {}

  logout() {
    this.logoutClick.emit();
    this.router.navigate([this.constants.ROUTES.LOGIN]);
  }
}
