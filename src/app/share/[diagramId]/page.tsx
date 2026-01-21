import { notFound } from 'next/navigation';
import { DiagramViewer } from '@/features/sharing';
import { Lock } from 'lucide-react';
import type { Metadata } from 'next';
import { getPublicDiagram } from '@/queries';

interface SharePageProps {
  params: Promise<{ diagramId: string }>;
}

/**
 * Generate metadata for the share page
 * Sets page title to diagram name for SEO and social sharing
 */
export async function generateMetadata({
  params,
}: SharePageProps): Promise<Metadata> {
  const { diagramId } = await params;

  try {
    const diagram = await getPublicDiagram(diagramId);

    return {
      title: `${diagram.name} | Mermaid Preview`,
      description: `View "${diagram.name}" - A Mermaid diagram shared publicly`,
      openGraph: {
        title: diagram.name,
        description: `View "${diagram.name}" - A Mermaid diagram shared publicly`,
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: diagram.name,
        description: `View "${diagram.name}" - A Mermaid diagram shared publicly`,
      },
    };
  } catch {
    return {
      title: 'Diagram Not Found | Mermaid Preview',
    };
  }
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

  try {
    const diagram = await getPublicDiagram(diagramId);
    return <DiagramViewer code={diagram.code} name={diagram.name} />;
  } catch {
    return <NotFoundState />;
  }
}

/**
 * Not Found State Component
 * Displayed for private or non-existent diagrams
 */
function NotFoundState() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30">
      <div className="text-center p-8 max-w-md">
        <div className="rounded-full bg-muted p-5 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
          <Lock className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-semibold mb-3">Diagram not available</h1>
        <p className="text-muted-foreground leading-relaxed">
          This diagram may have been deleted, made private by its owner, or the
          link may be incorrect.
        </p>
      </div>
    </div>
  );
}
