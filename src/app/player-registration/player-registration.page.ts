import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonBackButton,
  IonButtons,
  IonTextarea,
  LoadingController,
  ToastController, IonCardContent, IonCard, IonCardHeader, IonCardTitle } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FirestoreService } from '../services/firestore.service';
import { AuthService } from '../services/auth.service';
import { PlayerRegistration } from '../interfaces';

@Component({
  selector: 'app-player-registration',
  templateUrl: './player-registration.page.html',
  imports: [IonCardTitle, IonCardHeader, IonCard, IonCardContent, 
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonBackButton,
    IonButtons,
    IonTextarea
],
})
export class PlayerRegistrationPage {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private firestoreService = inject(FirestoreService);
  private authService = inject(AuthService);
  private loadingController = inject(LoadingController);
  private toastController = inject(ToastController);

  tournamentId = '';
  tournamentName = '';
  
  playerData = {
    name: '',
    gender: '',
    remarks: ''
  };

  async ngOnInit() {
    this.tournamentId = this.route.snapshot.params['tournamentId'];
    this.tournamentName = this.route.snapshot.queryParams['tournamentName'] || 'Tournament';
    
    if (this.authService.user) {
      this.playerData.name = this.authService.user.displayName || '';
    }
  }

  async registerPlayer() {
    if (!this.playerData.name.trim() || !this.playerData.gender || !this.authService.user?.uid) {
      const toast = await this.toastController.create({
        message: 'Please fill in all required fields',
        duration: 3000,
        color: 'warning'
      });
      await toast.present();
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Registering player...'
    });
    await loading.present();

    try {
      // Create/update user profile first
      await this.firestoreService.createUserProfile(this.authService.user.uid, {
        email: this.authService.user.email || '',
        name: this.playerData.name,
        gender: this.playerData.gender,
        remarks: this.playerData.remarks,
        photoURL: this.authService.user.photoURL || '',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Create registration with userId reference
      await this.firestoreService.createPlayerRegistration(this.tournamentId, this.authService.user.uid);

      const toast = await this.toastController.create({
        message: 'Registration submitted successfully! Waiting for approval.',
        duration: 3000,
        color: 'success'
      });
      await toast.present();

      this.router.navigate(['/tournaments']);
    } catch (error) {
      console.error('Error registering player:', error);
      const message = error instanceof Error && error.message.includes('already has a registration') 
        ? 'You have already registered for this tournament'
        : 'Error submitting registration';
      
      const toast = await this.toastController.create({
        message,
        duration: 3000,
        color: 'danger'
      });
      await toast.present();
    } finally {
      await loading.dismiss();
    }
  }

  cancel() {
    this.router.navigate(['/tournaments']);
  }
}
