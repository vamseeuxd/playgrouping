import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { IonAvatar, IonText, IonNote, IonButton } from '@ionic/angular/standalone';
import { TitleCasePipe } from '@angular/common';
import { APP_CONSTANTS } from '../../constants/app.constants';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  imports: [RouterLink, IonAvatar, IonText, IonNote, IonButton, TitleCasePipe]
})
export class UserProfileComponent {
  @Input() user: any;
  @Output() logoutClick = new EventEmitter<void>();
  constants = APP_CONSTANTS;

  constructor(private router: Router) {}

  logout() {
    this.logoutClick.emit();
    this.router.navigate([this.constants.ROUTES.LOGIN]);
  }
}
