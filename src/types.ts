export type ArtistLite = { id: string | number; name: string };

export type Event = {
  id: string | number;
  name: string;
  startDate: string;
  endDate: string;
  artists?: ArtistLite[];
  artistCount?: number;
};
