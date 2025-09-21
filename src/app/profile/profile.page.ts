import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonBackButton,
  IonButtons,
  IonButton,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonAvatar,
  LoadingController,
  ToastController,
} from '@ionic/angular/standalone';
import { AuthService } from '../services/auth.service';
import { FirestoreService } from '../services/firestore.service';
import { UserProfile } from '../interfaces';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonBackButton,
    IonButtons,
    IonButton,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonTextarea,
    IonAvatar,
  ],
})
export class ProfilePage {
  private authService = inject(AuthService);
  private firestoreService = inject(FirestoreService);
  private router = inject(Router);
  private loadingController = inject(LoadingController);
  private toastController = inject(ToastController);

  profile: UserProfile = {
    id: '',
    email: '',
    name: '',
    gender: '',
    remarks: '',
    photoURL: '',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  async ngOnInit() {
    const user = this.authService.user;
    if (user) {
      this.profile.id = user.uid;
      this.profile.email = user.email || '';
      
      const existingProfile = await this.firestoreService.getUserProfile(user.uid);
      if (existingProfile) {
        this.profile = existingProfile;
      } else {
        this.profile.name = user.displayName || '';
        this.profile.photoURL = user.photoURL || '';
      }
    }
  }

  async saveProfile() {
    const loading = await this.loadingController.create({
      message: 'Updating profile...'
    });
    await loading.present();

    try {
      // Check if profile exists, create if not
      const existingProfile = await this.firestoreService.getUserProfile(this.profile.id);
      
      if (existingProfile) {
        await this.firestoreService.updateUserProfile(this.profile.id, {
          name: this.profile.name,
          gender: this.profile.gender,
          remarks: this.profile.remarks
        });
      } else {
        await this.firestoreService.createUserProfile(this.profile.id, {
          email: this.profile.email,
          name: this.profile.name,
          gender: this.profile.gender,
          remarks: this.profile.remarks,
          photoURL: this.profile.photoURL,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }

      await this.authService.updateUserProfile(this.profile.name);

      const toast = await this.toastController.create({
        message: 'Profile updated successfully!',
        duration: 2000,
        color: 'success'
      });
      await toast.present();

      this.router.navigate(['/tournaments']);
    } catch (error) {
      console.error('Error updating profile:', error);
      const toast = await this.toastController.create({
        message: 'Error updating profile',
        duration: 3000,
        color: 'danger'
      });
      await toast.present();
    } finally {
      await loading.dismiss();
    }
  }
}