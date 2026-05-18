import type { CourtFeature } from '@/features/courts/model/types'

export type CourtFeatureCategory = {
  courtFeatureCategoryID: number;
  code: string;
  name: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
  createdDate: string;
  courtFeatures: CourtFeature[];
};
export type CreateCourtFeatureCategoryRequest = {
  code: string;
  name: string;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
};
export type UpdateCourtFeatureCategoryRequest =
  CreateCourtFeatureCategoryRequest;
