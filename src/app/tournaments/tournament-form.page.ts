import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonDatetime,
  IonButton,
  IonBackButton,
  IonButtons,
  IonTextarea,
  IonDatetimeButton,
  IonModal,
} from '@ionic/angular/standalone';
import {
  Firestore,
  collection,
  addDoc,
  doc,
  updateDoc,
  getDoc,
  deleteDoc,
} from '@angular/fire/firestore';
import { inject } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tournament-form',
  templateUrl: './tournament-form.page.html',
  styleUrls: ['./tournament-form.page.scss'],
  imports: [
    CommonModule,
    IonModal,
    IonDatetimeButton,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonDatetime,
    IonButton,
    IonBackButton,
    IonButtons,
    IonTextarea,
  ],
})
export class TournamentFormPage {
  private firestore = inject(Firestore);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  tournament = {
    name: '',
    sport: '',
    startDate: '',
    players: '',
  };

  isEdit = false;
  tournamentId = '';

  async ngOnInit() {
    this.tournamentId = this.route.snapshot.params['id'];
    this.isEdit = !!this.tournamentId;

    if (this.isEdit) {
      const docRef = doc(this.firestore, 'tournaments', this.tournamentId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        this.tournament = docSnap.data() as any;
      }
    }
  }

  async onSubmit() {
    try {
      if (this.isEdit) {
        const docRef = doc(this.firestore, 'tournaments', this.tournamentId);
        await updateDoc(docRef, this.tournament);
      } else {
        await addDoc(
          collection(this.firestore, 'tournaments'),
          this.tournament
        );
      }
      this.router.navigate(['/tournaments']);
    } catch (error) {
      console.error('Error saving tournament:', error);
    }
  }

  async deleteTournament() {
    if (confirm('Are you sure you want to delete this tournament?')) {
      try {
        const docRef = doc(this.firestore, 'tournaments', this.tournamentId);
        await deleteDoc(docRef);
        this.router.navigate(['/tournaments']);
      } catch (error) {
        console.error('Error deleting tournament:', error);
      }
    }
  }
}
