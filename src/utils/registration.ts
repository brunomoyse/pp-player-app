import type { TournamentLiveStatus } from '@/types/tournament';

/**
 * The only two states in which `registerForTournament` is accepted by the
 * server (see `register_for_tournament` in pp-service). The Register CTA must
 * agree with this — offering a live button in any other state produces a
 * guaranteed error, which reads as a broken button.
 */
export function isRegistrationOpen(liveStatus: TournamentLiveStatus | undefined): boolean {
  return liveStatus === 'REGISTRATION_OPEN' || liveStatus === 'LATE_REGISTRATION';
}
