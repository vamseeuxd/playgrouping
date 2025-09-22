import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonBadge,
  IonCheckbox,
  IonModal,
  IonIcon,
  IonAvatar,
  IonPopover,
  LoadingController,
  ToastController,
  AlertController, IonChip } from '@ionic/angular/standalone';
import { FirestoreService } from '../services/firestore.service';
import { Tournament, TournamentWithId, Team, PlayerRegistration, UserProfile, TeamPlayerWithUser } from '../interfaces';
import { addIcons } from 'ionicons';
import { addOutline, peopleOutline } from 'ionicons/icons';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-team-management',
  templateUrl: './team-management.page.html',

  imports: [IonChip, 
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonBackButton,
    IonButtons,
    IonButton,
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonBadge,
    IonCheckbox,
    IonModal,
    IonIcon,
    IonAvatar,
    IonPopover,
  ],
})
export class TeamManagementPage {
  private firestoreService = inject(FirestoreService);
  private route = inject(ActivatedRoute);
  private loadingController = inject(LoadingController);
  private toastController = inject(ToastController);
  private alertController = inject(AlertController);
  private authService = inject(AuthService);

  tournamentId = '';
  tournament: TournamentWithId | null = null;
  registrations: (PlayerRegistration & UserProfile)[] = [];
  teams: (Team & { players: TeamPlayerWithUser[] })[] = [];
  showTeamModal = false;
  currentTeam: { name: string; players: { id: string; name: string }[] } = { name: '', players: [] };
  editingTeam: (Team & { players: TeamPlayerWithUser[] }) | null = null;

  constructor() {
    addIcons({ 
      addOutline, 
      peopleOutline, 
      ellipsisVerticalOutline: 'ellipsis-vertical-outline',
      checkmarkOutline: 'checkmark-outline',
      closeOutline: 'close-outline',
      trashOutline: 'trash-outline',
      createOutline: 'create-outline'
    });
  }

  async ngOnInit() {
    this.tournamentId = this.route.snapshot.params['id'];
    await this.loadData();
  }

  async loadData() {
    const loading = await this.loadingController.create({
      message: 'Loading team data...'
    });
    await loading.present();

    try {
      this.tournament = await this.firestoreService.getTournament(this.tournamentId);
      
      // Subscribe to live updates for registrations
      this.firestoreService.getPlayerRegistrationsLive(this.tournamentId).subscribe(registrations => {
        this.registrations = registrations;
      });
      
      this.teams = await this.firestoreService.getTeamsWithPlayers(this.tournamentId);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      await loading.dismiss();
    }
  }

  get approvedRegistrations() {
    return this.registrations.filter(reg => reg.status === 'approved');
  }

  get availableRegistrations() {
    const assignedPlayerIds = new Set();
    this.teams.forEach(team => {
      team.players.forEach(player => {
        assignedPlayerIds.add(player.userId);
      });
    });
    
    return this.approvedRegistrations.filter(reg => 
      !assignedPlayerIds.has(reg.userId) || 
      (this.editingTeam && this.editingTeam.players.some(p => p.userId === reg.userId))
    );
  }

  openTeamModal(team?: Team & { players: TeamPlayerWithUser[] }) {
    this.editingTeam = team || null;
    this.currentTeam = team ? { 
      name: team.name, 
      players: team.players.map(p => ({ id: p.userId, name: p.name })) 
    } : { name: '', players: [] };
    this.showTeamModal = true;
  }

  async saveTeam() {
    if (!this.currentTeam.name.trim()) return;

    const loading = await this.loadingController.create({
      message: this.editingTeam ? 'Updating team...' : 'Creating team...'
    });
    await loading.present();

    try {
      const playerIds = this.currentTeam.players.map(p => p.id);
      
      if (this.editingTeam) {
        await this.firestoreService.updateTeam(this.tournamentId, this.editingTeam.id!, 
          { name: this.currentTeam.name }, playerIds);
      } else {
        await this.firestoreService.createTeam(this.tournamentId, 
          { name: this.currentTeam.name }, playerIds);
      }
      
      await this.loadData();
      this.showTeamModal = false;
      
      const toast = await this.toastController.create({
        message: `Team ${this.editingTeam ? 'updated' : 'created'} successfully!`,
        duration: 2000,
        color: 'success'
      });
      await toast.present();
    } catch (error) {
      console.error('Error saving team:', error);
      const toast = await this.toastController.create({
        message: 'Error saving team',
        duration: 3000,
        color: 'danger'
      });
      await toast.present();
    } finally {
      await loading.dismiss();
    }
  }

  async deleteTeam(team: Team & { players: TeamPlayerWithUser[] }) {
    const alert = await this.alertController.create({
      header: 'Delete Team',
      message: `Are you sure you want to permanently delete the team "${team.name}"? This action cannot be undone.`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Delete', role: 'destructive', handler: () => this.performDeleteTeam(team) }
      ]
    });
    await alert.present();
  }

  async performDeleteTeam(team: Team & { players: TeamPlayerWithUser[] }) {
    const loading = await this.loadingController.create({
      message: 'Deleting team...'
    });
    await loading.present();

    try {
      await this.firestoreService.deleteTeam(this.tournamentId, team.id!);
      await this.loadData();
      
      const toast = await this.toastController.create({
        message: 'Team deleted successfully!',
        duration: 2000,
        color: 'success'
      });
      await toast.present();
    } catch (error) {
      console.error('Error deleting team:', error);
      const toast = await this.toastController.create({
        message: 'Error deleting team',
        duration: 3000,
        color: 'danger'
      });
      await toast.present();
    } finally {
      await loading.dismiss();
    }
  }

  onPlayerSelectionChange(registration: PlayerRegistration & UserProfile, checked: boolean) {
    if (checked) {
      this.currentTeam.players.push({
        id: registration.userId,
        name: registration.name
      });
    } else {
      this.currentTeam.players = this.currentTeam.players.filter(p => p.id !== registration.userId);
    }
    this.generateTeamName();
  }

  generateTeamName() {
    if (this.currentTeam.players.length > 0) {
      this.currentTeam.name = this.currentTeam.players.map(p => p.name).join(' & ');
    } else {
      this.currentTeam.name = '';
    }
  }

  isPlayerSelected(registration: PlayerRegistration & UserProfile): boolean {
    return this.currentTeam.players.some(p => p.id === registration.userId);
  }

  async approveRegistration(registration: PlayerRegistration & UserProfile) {
    const alert = await this.alertController.create({
      header: 'Approve Registration',
      message: `Are you sure you want to approve ${registration.name}'s registration?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Approve', handler: () => this.performApproveRegistration(registration) }
      ]
    });
    await alert.present();
  }

  async performApproveRegistration(registration: PlayerRegistration & UserProfile) {
    const loading = await this.loadingController.create({
      message: 'Approving registration...'
    });
    await loading.present();

    try {
      await this.firestoreService.updatePlayerRegistration(this.tournamentId, registration.id!, { status: 'approved' });
      
      const toast = await this.toastController.create({
        message: 'Registration approved successfully!',
        duration: 2000,
        color: 'success'
      });
      await toast.present();
    } catch (error) {
      console.error('Error approving registration:', error);
    } finally {
      await loading.dismiss();
    }
  }

  async rejectRegistration(registration: PlayerRegistration & UserProfile) {
    const alert = await this.alertController.create({
      header: 'Reject Registration',
      message: `Are you sure you want to reject ${registration.name}'s registration?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Reject', handler: () => this.performRejectRegistration(registration) }
      ]
    });
    await alert.present();
  }

  async performRejectRegistration(registration: PlayerRegistration & UserProfile) {
    const loading = await this.loadingController.create({
      message: 'Rejecting registration...'
    });
    await loading.present();

    try {
      await this.firestoreService.updatePlayerRegistration(this.tournamentId, registration.id!, { status: 'rejected' });
      
      const toast = await this.toastController.create({
        message: 'Registration rejected.',
        duration: 2000,
        color: 'warning'
      });
      await toast.present();
    } catch (error) {
      console.error('Error rejecting registration:', error);
    } finally {
      await loading.dismiss();
    }
  }

  async deleteRegistration(registration: PlayerRegistration & UserProfile) {
    const alert = await this.alertController.create({
      header: 'Delete Registration',
      message: `Are you sure you want to permanently delete ${registration.name}'s registration? This action cannot be undone.`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Delete', role: 'destructive', handler: () => this.performDeleteRegistration(registration) }
      ]
    });
    await alert.present();
  }

  async performDeleteRegistration(registration: PlayerRegistration & UserProfile) {
    const loading = await this.loadingController.create({
      message: 'Deleting registration...'
    });
    await loading.present();

    try {
      await this.firestoreService.deletePlayerRegistration(this.tournamentId, registration.id!);
      
      const toast = await this.toastController.create({
        message: 'Registration deleted.',
        duration: 2000,
        color: 'success'
      });
      await toast.present();
    } catch (error) {
      console.error('Error deleting registration:', error);
    } finally {
      await loading.dismiss();
    }
  }

  get canEdit() {
    if (this.tournament && this.tournament.id) {
      return this.authService.hasPermission('editor', this.tournament);
    } else {
      return false;
    }
  }
}
