import { createClient } from '@/lib/supabase/server';
import type { Project } from '@/types/database';

/**
 * Fetch all projects for a user with diagram count
 * Sorted by updated_at descending (most recent first)
 */
export async function getProjects(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('projects')
    .select('*, diagrams(count)')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) throw error;

  return data.map((project) => ({
    ...project,
    diagrams: project.diagrams as unknown as Array<{ count: number }>,
  }));
}

/**
 * Get a single project by ID
 */
export async function getProjectById(projectId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();

  if (error) throw error;
  return data as Project;
}

/**
 * Create a new project
 */
export async function createProject(userId: string, name: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('projects')
    .insert({ name, user_id: userId })
    .select()
    .single();

  if (error) throw error;
  return data as Project;
}

/**
 * Update a project's name
 */
export async function updateProject(projectId: string, name: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('projects')
    .update({ name })
    .eq('id', projectId)
    .select()
    .single();

  if (error) throw error;
  return data as Project;
}

/**
 * Delete a project (cascades to diagrams)
 */
export async function deleteProject(projectId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId);

  if (error) throw error;
}

/**
 * Verify project ownership
 */
export async function verifyProjectOwnership(
  projectId: string,
  userId: string,
): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .eq('user_id', userId)
    .single();

  return !error && !!data;
}
