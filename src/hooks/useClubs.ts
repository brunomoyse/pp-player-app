import { useQuery } from '@apollo/client/react';
import { useEffect } from 'react';

import { GET_CLUBS } from '@/graphql/operations';
import { useClubStore } from '@/stores/useClubStore';

/** Loads the club list once and feeds it into the club store (auto-selects the first). */
export function useClubs() {
  const setClubs = useClubStore((s) => s.setClubs);
  const { data, loading, error } = useQuery(GET_CLUBS);

  useEffect(() => {
    if (data?.clubs) setClubs(data.clubs);
  }, [data, setClubs]);

  return { clubs: data?.clubs ?? [], loading, error };
}
