import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'tournaments',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./tournaments/tournaments.page').then((m) => m.TournamentsPage),
  },
  {
    path: 'tournaments/add',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./tournaments/tournament-form.page').then(
        (m) => m.TournamentFormPage
      ),
  },
  {
    path: 'tournaments/edit/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./tournaments/tournament-form.page').then(
        (m) => m.TournamentFormPage
      ),
  },
  {
    path: 'knockout/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./tournaments/knockout.page').then((m) => m.KnockoutPage),
  },
  {
    path: 'match-control/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./tournaments/match-control.page').then(
        (m) => m.MatchControlPage
      ),
  },
  {
    path: 'sports',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./sports/sports.page').then((m) => m.SportsPage),
  },
  {
    path: 'scoreboard/:id',
    loadComponent: () =>
      import('./scoreboard/scoreboard.page').then((m) => m.ScoreboardPage),
  },
  {
    path: 'player-registration/:tournamentId',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./player-registration/player-registration.page').then(
        (m) => m.PlayerRegistrationPage
      ),
  },
  {
    path: 'team-management/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./team-management/team-management.page').then(
        (m) => m.TeamManagementPage
      ),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./profile/profile.page').then((m) => m.ProfilePage),
  },
];
