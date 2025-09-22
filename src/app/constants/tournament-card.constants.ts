import { APP_CONSTANTS } from './app.constants';

export const TOURNAMENT_CARD_CONSTANTS = {
  ...APP_CONSTANTS,
  MATCH_PROPERTIES: {
    TEAM1: 'team1',
    TEAM2: 'team2',
    TEAM_A: 'teamA',
    TEAM_B: 'teamB',
    HOME_TEAM: 'homeTeam',
    AWAY_TEAM: 'awayTeam'
  }
} as const;
