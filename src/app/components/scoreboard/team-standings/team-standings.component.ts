import { Component, Input } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { trophyOutline } from 'ionicons/icons';

@Component({
  selector: 'app-team-standings',
  template: `
    <div [style.margin-bottom]="'var(--app-space-8)'">
      <!-- Section Header -->
      <div [style.display]="'flex'" 
           [style.align-items]="'center'" 
           [style.gap]="'var(--app-space-3)'" 
           [style.margin-bottom]="'var(--app-space-6)'">
        <ion-icon name="trophy-outline" 
                  [style.font-size]="'var(--app-font-size-xl)'" 
                  [style.color]="'var(--app-primary)'">
        </ion-icon>
        <h2 [style.margin]="'0'" 
            [style.color]="'var(--app-gray-900)'" 
            [style.font-size]="'var(--app-font-size-xl)'" 
            [style.font-weight]="'var(--app-font-weight-bold)'">
          Team Standings
        </h2>
      </div>

      <!-- Team Cards Grid -->
      <div [style.display]="'grid'" 
           [style.gap]="'var(--app-space-4)'" 
           [style.grid-template-columns]="'repeat(auto-fit, minmax(300px, 1fr))'">
        @for (stat of teamStats; track stat.team; let i = $index) {
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
                 [style.background]="getRankColor(i)" 
                 [style.color]="'white'" 
                 [style.border-radius]="'50%'" 
                 [style.width]="'32px'" 
                 [style.height]="'32px'" 
                 [style.display]="'flex'" 
                 [style.align-items]="'center'" 
                 [style.justify-content]="'center'" 
                 [style.font-weight]="'var(--app-font-weight-bold)'" 
                 [style.font-size]="'var(--app-font-size-sm)'">
              {{ i + 1 }}
            </div>

            <!-- Team Header -->
            <div [style.margin-bottom]="'var(--app-space-5)'">
              <h3 [style.margin]="'0 0 var(--app-space-2) 0'" 
                  [style.color]="'var(--app-gray-900)'" 
                  [style.font-size]="'var(--app-font-size-lg)'" 
                  [style.font-weight]="'var(--app-font-weight-bold)'" 
                  [style.padding-right]="'var(--app-space-12)'">
                {{ stat.team }}
              </h3>
              <div [style.display]="'flex'" [style.align-items]="'center'" [style.gap]="'var(--app-space-2)'">
                <span [style.background]="'var(--app-success)'" 
                      [style.color]="'white'" 
                      [style.padding]="'var(--app-space-1) var(--app-space-3)'" 
                      [style.border-radius]="'var(--app-radius-full)'" 
                      [style.font-weight]="'var(--app-font-weight-bold)'" 
                      [style.font-size]="'var(--app-font-size-sm)'">
                  {{ stat.points }} pts
                </span>
                <span [style.color]="'var(--app-gray-500)'" 
                      [style.font-size]="'var(--app-font-size-sm)'">
                  {{ stat.played }} games
                </span>
              </div>
            </div>

            <!-- Stats Grid -->
            <div [style.display]="'grid'" 
                 [style.grid-template-columns]="'repeat(4, 1fr)'" 
                 [style.gap]="'var(--app-space-3)'" 
                 [style.margin-bottom]="'var(--app-space-4)'">
              <div [style.text-align]="'center'" 
                   [style.padding]="'var(--app-space-2)'" 
                   [style.background]="'var(--app-gray-50)'" 
                   [style.border-radius]="'var(--app-radius-md)'">
                <div [style.font-weight]="'var(--app-font-weight-bold)'" 
                     [style.color]="'var(--app-success)'" 
                     [style.font-size]="'var(--app-font-size-lg)'">
                  {{ stat.won }}
                </div>
                <div [style.font-size]="'var(--app-font-size-xs)'" 
                     [style.color]="'var(--app-gray-600)'" 
                     [style.font-weight]="'var(--app-font-weight-medium)'">
                  Won
                </div>
              </div>
              <div [style.text-align]="'center'" 
                   [style.padding]="'var(--app-space-2)'" 
                   [style.background]="'var(--app-gray-50)'" 
                   [style.border-radius]="'var(--app-radius-md)'">
                <div [style.font-weight]="'var(--app-font-weight-bold)'" 
                     [style.color]="'var(--app-warning)'" 
                     [style.font-size]="'var(--app-font-size-lg)'">
                  {{ stat.drawn }}
                </div>
                <div [style.font-size]="'var(--app-font-size-xs)'" 
                     [style.color]="'var(--app-gray-600)'" 
                     [style.font-weight]="'var(--app-font-weight-medium)'">
                  Draw
                </div>
              </div>
              <div [style.text-align]="'center'" 
                   [style.padding]="'var(--app-space-2)'" 
                   [style.background]="'var(--app-gray-50)'" 
                   [style.border-radius]="'var(--app-radius-md)'">
                <div [style.font-weight]="'var(--app-font-weight-bold)'" 
                     [style.color]="'var(--app-danger)'" 
                     [style.font-size]="'var(--app-font-size-lg)'">
                  {{ stat.lost }}
                </div>
                <div [style.font-size]="'var(--app-font-size-xs)'" 
                     [style.color]="'var(--app-gray-600)'" 
                     [style.font-weight]="'var(--app-font-weight-medium)'">
                  Lost
                </div>
              </div>
              <div [style.text-align]="'center'" 
                   [style.padding]="'var(--app-space-2)'" 
                   [style.background]="'var(--app-gray-50)'" 
                   [style.border-radius]="'var(--app-radius-md)'">
                <div [style.font-weight]="'var(--app-font-weight-bold)'" 
                     [style.color]="getGoalDiffColor(stat.goalDifference)" 
                     [style.font-size]="'var(--app-font-size-lg)'">
                  {{ stat.goalDifference >= 0 ? '+' : '' }}{{ stat.goalDifference }}
                </div>
                <div [style.font-size]="'var(--app-font-size-xs)'" 
                     [style.color]="'var(--app-gray-600)'" 
                     [style.font-weight]="'var(--app-font-weight-medium)'">
                  Goal Diff
                </div>
              </div>
            </div>

            <!-- Goals Summary -->
            <div [style.display]="'flex'" 
                 [style.justify-content]="'space-between'" 
                 [style.padding]="'var(--app-space-3)'" 
                 [style.background]="'var(--app-gray-50)'" 
                 [style.border-radius]="'var(--app-radius-md)'">
              <div [style.text-align]="'center'" [style.flex]="'1'">
                <div [style.font-weight]="'var(--app-font-weight-bold)'" 
                     [style.color]="'var(--app-primary)'" 
                     [style.font-size]="'var(--app-font-size-base)'">
                  {{ stat.goalsFor }}
                </div>
                <div [style.font-size]="'var(--app-font-size-xs)'" 
                     [style.color]="'var(--app-gray-600)'">
                  Goals For
                </div>
              </div>
              <div [style.width]="'1px'" 
                   [style.background]="'var(--app-gray-300)'" 
                   [style.margin]="'0 var(--app-space-3)'">
              </div>
              <div [style.text-align]="'center'" [style.flex]="'1'">
                <div [style.font-weight]="'var(--app-font-weight-bold)'" 
                     [style.color]="'var(--app-gray-600)'" 
                     [style.font-size]="'var(--app-font-size-base)'">
                  {{ stat.goalsAgainst }}
                </div>
                <div [style.font-size]="'var(--app-font-size-xs)'" 
                     [style.color]="'var(--app-gray-600)'">
                  Goals Against
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  imports: [CommonModule, IonIcon]
})
export class TeamStandingsComponent {
  @Input() teamStats: any[] = [];

  constructor() {
    addIcons({ trophyOutline });
  }

  getRankColor(index: number): string {
    if (index === 0) return 'var(--app-warning)'; // Gold for 1st
    if (index === 1) return 'var(--app-gray-500)'; // Silver for 2nd
    if (index === 2) return 'var(--app-warning-dark)'; // Bronze for 3rd
    return 'var(--app-primary)';
  }

  getGoalDiffColor(goalDiff: number): string {
    if (goalDiff > 0) return 'var(--app-success)';
    if (goalDiff < 0) return 'var(--app-danger)';
    return 'var(--app-gray-600)';
  }
}
