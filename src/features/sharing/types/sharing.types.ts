/**
 * Sharing Types
 * Type definitions for diagram sharing functionality
 */

export interface PublicDiagram {
  id: string;
  name: string;
  code: string;
}

export interface ShareUrlParams {
  diagramId: string;
}

export interface VisibilityState {
  isPublic: boolean;
  isSaving: boolean;
  error: string | null;
}
