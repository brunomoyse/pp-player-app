export type CosmeticKind = 'card_back' | 'avatar_frame' | 'theme' | 'badge';

export interface CosmeticItem {
  id: string;
  code: string;
  kind: CosmeticKind;
  name: string;
  description: string | null;
  priceCents: number;
  previewRef: string;
  clubId: string | null;
  owned: boolean;
  equipped: boolean;
}
