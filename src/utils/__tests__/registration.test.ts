import { describe, expect, it } from '@jest/globals';

import type { TournamentLiveStatus } from '@/types/tournament';
import { isRegistrationOpen } from '@/utils/registration';

describe('isRegistrationOpen', () => {
  it('allows the states the server accepts', () => {
    expect(isRegistrationOpen('REGISTRATION_OPEN')).toBe(true);
    expect(isRegistrationOpen('LATE_REGISTRATION')).toBe(true);
  });

  // A tournament the club hasn't opened yet still resolves to status UPCOMING,
  // so it renders the same branch as an open one. Before this gate existed the
  // Register button was live there and every tap returned an error — the
  // "unresponsive UI" Google rejected version code 2 for.
  it('blocks a tournament whose registration has not opened', () => {
    expect(isRegistrationOpen('NOT_STARTED')).toBe(false);
  });

  it('blocks running and finished tournaments', () => {
    const closed: TournamentLiveStatus[] = ['IN_PROGRESS', 'BREAK', 'FINAL_TABLE', 'FINISHED'];
    for (const liveStatus of closed) {
      expect(isRegistrationOpen(liveStatus)).toBe(false);
    }
  });

  it('blocks when the status is missing', () => {
    expect(isRegistrationOpen(undefined)).toBe(false);
  });
});
