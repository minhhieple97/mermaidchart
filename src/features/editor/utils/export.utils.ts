/**
 * Export Utilities
 * Helper functions for diagram export functionality
 */

/**
 * Sanitize filename for filesystem compatibility
 * Removes/replaces characters that are invalid in filenames
 */
export function sanitizeFilename(name: string): string {
  return (
    name
      .replace(/[<>:"/\\|?*]/g, '-') // Replace invalid chars with dash
      .replace(/\s+/g, '-') // Replace spaces with dash
      .replace(/-+/g, '-') // Collapse multiple dashes
      .replace(/^-|-$/g, '') // Remove leading/trailing dashes
      .slice(0, 200) || // Limit length
    'diagram'
  ); // Fallback if empty
}

/**
 * Trigger browser download for a blob
 */
export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate export filename with format extension
 */
export function getExportFilename(
  diagramName: string,
  format: 'png' | 'svg',
): string {
  const sanitized = sanitizeFilename(diagramName);
  return `${sanitized}.${format}`;
}
