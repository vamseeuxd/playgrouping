import { Component, Input } from '@angular/core';
import { IonIcon, IonAvatar, IonChip } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { personOutline, trophyOutline, footballOutline } from 'ionicons/icons';

interface PlayerStats {
  name: string;
  team: string;
  played: number;
  goals: number;
  averageGoals: number;
  photoURL?: string;
}

@Component({
  selector: 'app-player-standings',
  template: `
    <div [style.margin-bottom]="'var(--app-space-8)'">
      <!-- Section Header -->
      <div [style.display]="'flex'"
           [style.align-items]="'center'"
           [style.gap]="'var(--app-space-3)'"
           [style.margin-bottom]="'var(--app-space-6)'">
        <ion-icon name="person-outline"
                  [style.font-size]="'var(--app-font-size-xl)'"
                  [style.color]="'var(--app-primary)'">
        </ion-icon>
        <h2 [style.margin]="'0'"
            [style.color]="'var(--app-gray-900)'"
            [style.font-size]="'var(--app-font-size-xl)'"
            [style.font-weight]="'var(--app-font-weight-bold)'">
          Player Statistics
        </h2>
      </div>

      @if (playerStats.length === 0) {
        <div [style.background]="'white'"
             [style.border-radius]="'var(--app-radius-xl)'"
             [style.box-shadow]="'var(--app-shadow-md)'"
             [style.padding]="'var(--app-space-8)'"
             [style.text-align]="'center'">
          <ion-icon name="football-outline"
                    [style.font-size]="'48px'"
                    [style.color]="'var(--app-gray-400)'"
                    [style.margin-bottom]="'var(--app-space-4)'">
          </ion-icon>
          <p [style.margin]="'0'"
             [style.color]="'var(--app-gray-500)'"
             [style.font-size]="'var(--app-font-size-base)'">
            No player statistics available yet
          </p>
        </div>
      } @else {
        <!-- Player Cards Grid -->
        <div [style.display]="'grid'"
             [style.gap]="'var(--app-space-4)'"
             [style.grid-template-columns]="'repeat(auto-fit, minmax(280px, 1fr))'">
          @for (player of playerStats; track $index) {
            <div [style.background]="'white'"
                 [style.border-radius]="'var(--app-radius-xl)'"
                 [style.box-shadow]="'var(--app-shadow-md)'"
                 [style.padding]="'var(--app-space-6)'"
                 [style.border]="'1px solid var(--app-gray-200)'"
                 [style.transition]="'all var(--app-transition-fast)'"
                 [style.cursor]="'pointer'"
                 [style.position]="'relative'"
                 [style.overflow]="'hidden'">

              <!-- Rank Badge -->
              <div [style.position]="'absolute'"
                   [style.top]="'var(--app-space-4)'"
                   [style.right]="'var(--app-space-4)'"
                   [style.background]="getRankColor($index)"
                   [style.color]="'white'"
                   [style.border-radius]="'50%'"
                   [style.width]="'32px'"
                   [style.height]="'32px'"
                   [style.display]="'flex'"
                   [style.align-items]="'center'"
                   [style.justify-content]="'center'"
                   [style.font-weight]="'var(--app-font-weight-bold)'"
                   [style.font-size]="'var(--app-font-size-sm)'">
                {{ $index + 1 }}
              </div>

              <!-- Player Header -->
              <div [style.display]="'flex'"
                   [style.align-items]="'center'"
                   [style.gap]="'var(--app-space-3)'"
                   [style.margin-bottom]="'var(--app-space-5)'"
                   [style.padding-right]="'var(--app-space-12)'">
                <ion-avatar [style.width]="'48px'" [style.height]="'48px'" [style.flex-shrink]="'0'">
                  @if (player.photoURL) {
                    <img [src]="player.photoURL" [alt]="player.name" />
                  } @else {
                    <div [style.width]="'100%'"
                         [style.height]="'100%'"
                         [style.background]="'linear-gradient(135deg, var(--app-primary), var(--app-primary-light))'"
                         [style.display]="'flex'"
                         [style.align-items]="'center'"
                         [style.justify-content]="'center'"
                         [style.color]="'white'"
                         [style.font-weight]="'var(--app-font-weight-bold)'"
                         [style.font-size]="'var(--app-font-size-base)'">
                      {{ getPlayerInitials(player.name) }}
                    </div>
                  }
                </ion-avatar>

                <div [style.min-width]="'0'" [style.flex]="'1'">
                  <h3 [style.margin]="'0 0 var(--app-space-2) 0'"
                      [style.color]="'var(--app-gray-900)'"
                      [style.font-size]="'var(--app-font-size-lg)'"
                      [style.font-weight]="'var(--app-font-weight-bold)'"
                      [style.white-space]="'nowrap'"
                      [style.overflow]="'hidden'"
                      [style.text-overflow]="'ellipsis'">
                    {{ player.name }}
                  </h3>
                  <div [style.display]="'flex'"
                       [style.align-items]="'center'"
                       [style.gap]="'var(--app-space-2)'">
                    <ion-chip [style.height]="'24px'"
                             [style.font-size]="'var(--app-font-size-xs)'"
                             [style.margin]="'0'"
                            color="tertiary"
                             [style.max-width]="'200px'">
                      <span [style.white-space]="'nowrap'"
                            [style.overflow]="'hidden'"
                            [style.text-overflow]="'ellipsis'"
                            [style.display]="'block'">
                        Team : {{ player.team }}
                      </span>
                    </ion-chip>
                    <span [style.color]="'var(--app-gray-500)'"
                          [style.font-size]="'var(--app-font-size-sm)'">
                      {{ player.played }} games
                    </span>
                  </div>
                </div>
              </div>

              <!-- Stats Grid -->
              <div [style.display]="'grid'"
                   [style.grid-template-columns]="'1fr 1fr'"
                   [style.gap]="'var(--app-space-3)'">
                <div [style.text-align]="'center'"
                     [style.padding]="'var(--app-space-3)'"
                     [style.background]="'var(--app-gray-50)'"
                     [style.border-radius]="'var(--app-radius-md)'">
                  <div [style.display]="'flex'"
                       [style.align-items]="'center'"
                       [style.justify-content]="'center'"
                       [style.gap]="'var(--app-space-1)'"
                       [style.margin-bottom]="'var(--app-space-1)'">
                    <ion-icon name="football-outline"
                              [style.font-size]="'var(--app-font-size-base)'"
                              [style.color]="'var(--app-primary)'">
                    </ion-icon>
                    <div [style.font-weight]="'var(--app-font-weight-bold)'"
                         [style.color]="'var(--app-primary)'"
                         [style.font-size]="'var(--app-font-size-xl)'">
                      {{ player.goals }}
                    </div>
                  </div>
                  <div [style.font-size]="'var(--app-font-size-xs)'"
                       [style.color]="'var(--app-gray-600)'"
                       [style.font-weight]="'var(--app-font-weight-medium)'">
                    Goals
                  </div>
                </div>
                <div [style.text-align]="'center'"
                     [style.padding]="'var(--app-space-3)'"
                     [style.background]="'var(--app-gray-50)'"
                     [style.border-radius]="'var(--app-radius-md)'">
                  <div [style.font-weight]="'var(--app-font-weight-bold)'"
                       [style.color]="getAvgColor(player.averageGoals)"
                       [style.font-size]="'var(--app-font-size-xl)'"
                       [style.margin-bottom]="'var(--app-space-1)'">
                    {{ player.averageGoals.toFixed(1) }}
                  </div>
                  <div [style.font-size]="'var(--app-font-size-xs)'"
                       [style.color]="'var(--app-gray-600)'"
                       [style.font-weight]="'var(--app-font-weight-medium)'">
                    Average
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  imports: [CommonModule, IonIcon, IonAvatar, IonChip],

})
export class PlayerStandingsComponent {
  @Input() playerStats: PlayerStats[] = [];

  constructor() {
    addIcons({ personOutline, trophyOutline, footballOutline });
  }

  getPlayerInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getRankColor(index: number): string {
    if (index === 0) return 'var(--app-warning)'; // Gold for 1st
    if (index === 1) return 'var(--app-gray-500)'; // Silver for 2nd
    if (index === 2) return 'var(--app-warning-dark)'; // Bronze for 3rd
    return 'var(--app-primary)';
  }

  getAvgColor(avg: number): string {
    if (avg >= 2) return 'var(--app-success)';
    if (avg >= 1) return 'var(--app-warning)';
    return 'var(--app-gray-500)';
  }
}
