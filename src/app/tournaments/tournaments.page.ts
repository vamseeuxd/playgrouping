import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonButton, IonIcon, IonFab, IonFabButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trophyOutline, addOutline, settingsOutline } from 'ionicons/icons';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tournaments',
  templateUrl: './tournaments.page.html',
  styleUrls: ['./tournaments.page.scss'],
  imports: [CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonButton, IonIcon, IonFab, IonFabButton]
})
export class TournamentsPage {
  private firestore = inject(Firestore);
  private router = inject(Router);
  
  tournaments$: Observable<any[]>;

  constructor() {
    addIcons({ trophyOutline, addOutline, settingsOutline });
    const tournamentsCollection = collection(this.firestore, 'tournaments');
    this.tournaments$ = collectionData(tournamentsCollection, { idField: 'id' });
  }

  addTournament() {
    this.router.navigate(['/tournaments/add']);
  }

  editTournament(id: string) {
    this.router.navigate(['/tournaments/edit', id]);
  }
}