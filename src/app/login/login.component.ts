import { Component, inject, OnInit } from '@angular/core';
import {
  IonContent,
  IonButton,
  IonIcon,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonList,
  IonItem,
  IonItemGroup,
  IonItemDivider,
  IonLabel,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { APP_CONSTANTS } from '../constants/app.constants';
import { UserCredential } from '@angular/fire/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [
    IonButtons,
    IonTitle,
    IonToolbar,
    IonHeader,
    IonModal,
    IonIcon,
    IonButton,
    IonContent,
    IonList,
    IonItem,
    IonItemGroup,
    IonItemDivider,
    IonLabel,
  ],
  standalone: true,
})
export class LoginComponent implements OnInit {
  private authService: AuthService = inject(AuthService);
  private router: Router = inject(Router);
  constants = APP_CONSTANTS;

  isTermsOpen = false;

  openTermsModal() {
    this.isTermsOpen = true;
  }

  closeTermsModal() {
    this.isTermsOpen = false;
  }

  constructor() {}

  ngOnInit() {
    this.authService.user$.subscribe((user) => {
      if (user) {
        this.router.navigate([this.constants.ROUTES.TOURNAMENTS]);
      }
    });
  }

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
      const x: UserCredential = await this.authService.signInAnonymously();
      console.log(x);
      await this.authService.setViewAccess(this.constants.PERMISSIONS.GUEST);
      this.router.navigate([this.constants.ROUTES.TOURNAMENTS]);
    } catch (error) {
      console.error('Anonymous sign-in error:', error);
    }
  }
}
