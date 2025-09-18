import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'tournaments',
    pathMatch: 'full',
  },
  {
    path: 'tournaments',
    loadComponent: () =>
      import('./tournaments/tournaments.page').then((m) => m.TournamentsPage),
  },
  {
    path: 'tournaments/add',
    loadComponent: () =>
      import('./tournaments/tournament-form.page').then((m) => m.TournamentFormPage),
  },
  {
    path: 'tournaments/edit/:id',
    loadComponent: () =>
      import('./tournaments/tournament-form.page').then((m) => m.TournamentFormPage),
  },
  {
    path: 'folder/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./folder/folder.page').then((m) => m.FolderPage),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
];
