import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DiagramViewer } from '@/features/sharing';
import { Lock } from 'lucide-react';

interface SharePageProps {
  params: Promise<{ diagramId: string }>;
}

/**
 * Generate metadata for the share page
 * Sets page title to diagram name
 *
 * Requirements:
 * - 5.6: Display diagram name as page title
 */
export async function generateMetadata({
  params,
}: SharePageProps): Promise<Metadata> {
  const { diagramId } = await params;
  const supabase = await createClient();

  const { data: diagram } = await supabase
    .from('diagrams')
    .select('name')
    .eq('id', diagramId)
    .eq('is_public', true)
    .single();

  if (!diagram) {
    return {
      title: 'Diagram Not Found',
    };
  }

  return {
    title: diagram.name,
    description: `View ${diagram.name} - Mermaid Diagram`,
  };
}

/**
 * Public Share Page
 * Displays public diagrams without authentication
 *
 * Requirements:
 * - 5.1: Display rendered diagram for public diagrams
 * - 5.2: Read-only mode without editor
 * - 5.3: No authentication required
 * - 5.4, 5.5: Display error for private/non-existent diagrams
 */
export default async function SharePage({ params }: SharePageProps) {
  const { diagramId } = await params;

  // Validate UUID format
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(diagramId)) {
    return <NotFoundState />;
  }

  const supabase = await createClient();

  // Fetch public diagram
  const { data: diagram, error } = await supabase
    .from('diagrams')
    .select('id, name, code, is_public')
    .eq('id', diagramId)
    .eq('is_public', true)
    .single();

  // Show error state for private or non-existent diagrams
  if (error || !diagram) {
    return <NotFoundState />;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <DiagramViewer code={diagram.code} name={diagram.name} />
    </div>
  );
}

/**
 * Not Found State Component
 * Displayed for private or non-existent diagrams
 */
function NotFoundState() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <div className="text-center p-8">
        <div className="rounded-full bg-muted p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <Lock className="h-8 w-8 text-muted-foreground" />
        </div>
        <h1 className="text-xl font-semibold mb-2">
          Diagram not found or is private
        </h1>
        <p className="text-muted-foreground">
          This diagram may have been deleted or made private by its owner.
        </p>
      </div>
    </div>
  );
}
