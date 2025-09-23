import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  IonApp,
  IonSplitPane,
  IonMenu,
  IonContent,
  IonList,
  IonListHeader,
  IonNote,
  IonMenuToggle,
  IonItem,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonRouterLink, IonButton, IonAvatar, IonText } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  mailOutline,
  mailSharp,
  paperPlaneOutline,
  paperPlaneSharp,
  heartOutline,
  heartSharp,
  archiveOutline,
  archiveSharp,
  trashOutline,
  trashSharp,
  warningOutline,
  warningSharp,
  bookmarkOutline,
  bookmarkSharp,
  trophyOutline,
  trophySharp,
  albumsOutline,
  gridOutline,
  listOutline,
  checkmark,
  ellipsisVerticalOutline,
  personOutline,
  peopleCircleOutline,
  peopleOutline,
  lockOpenOutline,
  personAddOutline,
  lockClosedOutline,
  checkmarkOutline,
  closeOutline,
  createOutline,
  apertureOutline,
  stopCircleOutline,
  pauseCircleOutline,
  refreshCircleOutline,
  checkmarkCircle,
  timeOutline,
  timerOutline,
  radioButtonOn,
  pauseCircle,
  downloadOutline,
  chevronDownOutline,
  chevronUpOutline,
  heart,
  woman,
  man,
  warning,
  chevronForward,
  checkmarkCircleOutline,
  addOutline,
  searchOutline,
} from 'ionicons/icons';
import { UpdateService } from './services/update.service';
import { InstallPromptService } from './services/install-prompt.service';
import { Observable } from 'rxjs';
import { AuthService } from './services/auth.service';
import { CommonModule } from '@angular/common';
import { UserProfileComponent } from './components/user-profile/user-profile.component';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',

  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    IonApp,
    IonSplitPane,
    IonMenu,
    IonContent,
    IonList,
    IonListHeader,
    IonMenuToggle,
    IonItem,
    IonIcon,
    IonLabel,
    IonRouterLink,
    IonRouterOutlet,
    UserProfileComponent],
})
export class AppComponent {
  private authService: AuthService = inject(AuthService);
  user$: Observable<any> = this.authService.user$;
  public appPages = [
    { title: 'Tournaments', url: '/tournaments', icon: 'trophy' },
  ];
  private updateService = inject(UpdateService);
  private installPromptService = inject(InstallPromptService);

  constructor() {
    addIcons({
      mailOutline,
      mailSharp,
      paperPlaneOutline,
      paperPlaneSharp,
      heartOutline,
      heartSharp,
      archiveOutline,
      archiveSharp,
      trashOutline,
      trashSharp,
      warningOutline,
      warningSharp,
      bookmarkOutline,
      bookmarkSharp,
      trophyOutline,
      trophySharp,
      albumsOutline,
      gridOutline,
      listOutline,
      checkmark,
      ellipsisVerticalOutline,
      personOutline,
      peopleCircleOutline,
      peopleOutline,
      lockOpenOutline,
      personAddOutline,
      lockClosedOutline,
      checkmarkOutline,
      closeOutline,
      createOutline,
      apertureOutline,
      stopCircleOutline,
      pauseCircleOutline,
      refreshCircleOutline,
      checkmarkCircle,
      timeOutline,
      timerOutline,
      radioButtonOn,
      pauseCircle,
      downloadOutline,
      chevronDownOutline,
      chevronUpOutline,
      woman,
      man,
      warning,
      chevronForward,
      checkmarkCircleOutline,
      addOutline,
      searchOutline,
    });
  }

  async logout() {
    await this.authService.logout();
  }
}
