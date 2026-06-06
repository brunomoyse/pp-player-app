import { gql, type TypedDocumentNode } from '@apollo/client';

import type { CosmeticItem } from '@/types/cosmetics';

const COSMETIC_FIELDS = gql`
  fragment CosmeticFields on CosmeticItem {
    id
    code
    kind
    name
    description
    priceCents
    previewRef
    clubId
    owned
    equipped
  }
`;

export interface GetCosmeticCatalogResult {
  cosmeticCatalog: CosmeticItem[];
}
export interface GetCosmeticCatalogVars {
  kind?: string;
}

/** The cosmetics catalog, each flagged with the current user's ownership. */
export const GET_COSMETIC_CATALOG: TypedDocumentNode<
  GetCosmeticCatalogResult,
  GetCosmeticCatalogVars
> = gql`
  query GetCosmeticCatalog($kind: String) {
    cosmeticCatalog(kind: $kind) {
      ...CosmeticFields
    }
  }
  ${COSMETIC_FIELDS}
`;

export interface PurchaseCosmeticResult {
  purchaseCosmetic: CosmeticItem;
}
export interface PurchaseCosmeticVars {
  cosmeticItemId: string;
}

/** Buy a cosmetic with euros (deterministic, named item — G1). */
export const PURCHASE_COSMETIC: TypedDocumentNode<
  PurchaseCosmeticResult,
  PurchaseCosmeticVars
> = gql`
  mutation PurchaseCosmetic($cosmeticItemId: ID!) {
    purchaseCosmetic(cosmeticItemId: $cosmeticItemId) {
      ...CosmeticFields
    }
  }
  ${COSMETIC_FIELDS}
`;

export interface EquipCosmeticResult {
  equipCosmetic: CosmeticItem;
}
export interface EquipCosmeticVars {
  cosmeticItemId: string;
}

/** Equip an owned cosmetic, replacing any other of the same kind. */
export const EQUIP_COSMETIC: TypedDocumentNode<EquipCosmeticResult, EquipCosmeticVars> = gql`
  mutation EquipCosmetic($cosmeticItemId: ID!) {
    equipCosmetic(cosmeticItemId: $cosmeticItemId) {
      ...CosmeticFields
    }
  }
  ${COSMETIC_FIELDS}
`;
