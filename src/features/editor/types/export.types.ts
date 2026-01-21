/**
 * Export Types
 * Type definitions for diagram export functionality
 */

export type ExportFormat = 'png' | 'svg';

export interface ExportOptions {
  format: ExportFormat;
  filename: string;
  svg: string;
}
