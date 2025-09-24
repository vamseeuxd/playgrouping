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
    map((user) => {
      // Allow authenticated users
      if (user) {
        return true;
      }
      
      // Check for guest access
      if (authService.hasGuestAccess()) {
        const path = route.routeConfig?.path;
        // Restrict guest access to certain routes
        const guestAllowedRoutes = ['tournaments', 'scoreboard/:id'];
        const isGuestAllowed = guestAllowedRoutes.some(allowedPath => 
          path?.includes(allowedPath.split('/:')[0])
        );
        
        if (isGuestAllowed) {
          return true;
        }
      }
      
      // Redirect to login if no valid authentication
      router.navigate(['/login']);
      return false;
    })
  );
};
