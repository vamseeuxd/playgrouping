import { Component, inject, OnInit } from '@angular/core';
import {
  IonHeader,
  IonContent,
  IonTitle,
  IonToolbar,
  IonButton,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { APP_CONSTANTS } from '../constants/app.constants';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [
    IonButton,
    IonToolbar,
    IonTitle,
    IonContent,
    IonHeader
],
  standalone: true,
})
export class LoginComponent implements OnInit {
  private authService: AuthService = inject(AuthService);
  private router: Router = inject(Router);
  constants = APP_CONSTANTS;

  constructor() {}

  ngOnInit() {}

  async signInWithGoogle() {
    try {
      await this.authService.signInWithGoogle();
      this.router.navigate([this.constants.ROUTES.TOURNAMENTS]);
    } catch (error) {
      console.error('Google sign-in error:', error);
    }
  }

  async signInAnonymously() {
    try {
      await this.authService.setViewAccess(this.constants.PERMISSIONS.GUEST);
      this.router.navigate([this.constants.ROUTES.TOURNAMENTS]);
    } catch (error) {
      console.error('Anonymous sign-in error:', error);
    }
  }
}
