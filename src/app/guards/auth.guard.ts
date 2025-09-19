import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Allow scoreboard access without authentication
  if (route.routeConfig?.path === 'scoreboard/:id') {
    return true;
  }

  return authService.user$.pipe(
    map(user => {
      if (user) {
        // Check route-specific permissions
        const path = route.routeConfig?.path;
        if (path?.includes('tournaments') && !authService.hasPermission('canCreateTournament') && !authService.hasPermission('canViewScoreboard')) {
          router.navigate(['/login']);
          return false;
        }
        
        return true;
      } else {
        router.navigate(['/login']);
        return false;
      }
    })
  );
};