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
    path: 'knockout/:id',
    loadComponent: () =>
      import('./tournaments/knockout.page').then((m) => m.KnockoutPage),
  },
  {
    path: 'match-control/:id',
    loadComponent: () =>
      import('./tournaments/match-control.page').then((m) => m.MatchControlPage),
  },
  {
    path: 'sports',
    loadComponent: () =>
      import('./sports/sports.page').then((m) => m.SportsPage),
  },
  {
    path: 'scoreboard/:id',
    loadComponent: () =>
      import('./scoreboard/scoreboard.page').then((m) => m.ScoreboardPage),
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
