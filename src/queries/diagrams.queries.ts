import { createClient } from '@/lib/supabase/server';
import type { Diagram } from '@/types/database';

/**
 * Fetch all diagrams for a project
 * Sorted by updated_at descending (most recent first)
 */
export async function getDiagramsByProject(projectId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('diagrams')
    .select('*')
    .eq('project_id', projectId)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data as Diagram[];
}

/**
 * Get a single diagram by ID
 */
export async function getDiagramById(diagramId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('diagrams')
    .select('*')
    .eq('id', diagramId)
    .single();

  if (error) throw error;
  return data as Diagram;
}

/**
 * Get a public diagram by ID (no auth required)
 */
export async function getPublicDiagram(diagramId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('diagrams')
    .select('*')
    .eq('id', diagramId)
    .eq('is_public', true)
    .single();

  if (error) throw error;
  return data as Diagram;
}

/**
 * Create a new diagram with default template
 */
export async function createDiagram(projectId: string, name: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('diagrams')
    .insert({
      project_id: projectId,
      name,
      code: 'graph TD\n    A[Start] --> B[End]',
    })
    .select()
    .single();

  if (error) throw error;
  return data as Diagram;
}

/**
 * Update diagram name and/or code
 */
export async function updateDiagram(
  diagramId: string,
  updates: { name?: string; code?: string },
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('diagrams')
    .update(updates)
    .eq('id', diagramId)
    .select()
    .single();

  if (error) throw error;
  return data as Diagram;
}

/**
 * Update diagram visibility
 */
export async function updateDiagramVisibility(
  diagramId: string,
  isPublic: boolean,
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('diagrams')
    .update({ is_public: isPublic })
    .eq('id', diagramId);

  if (error) throw error;
}

/**
 * Delete a diagram
 */
export async function deleteDiagram(diagramId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('diagrams')
    .delete()
    .eq('id', diagramId);

  if (error) throw error;
}

/**
 * Verify diagram ownership through project
 */
export async function verifyDiagramOwnership(
  diagramId: string,
  userId: string,
): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('diagrams')
    .select('id, project_id, projects!inner(user_id)')
    .eq('id', diagramId)
    .single();

  if (error || !data) return false;

  const projects = data.projects as unknown as { user_id: string };
  return projects.user_id === userId;
}
