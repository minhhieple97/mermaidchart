import { notFound } from 'next/navigation';
import { DiagramViewer } from '@/features/sharing';
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
    notFound();
  }

  const diagram = await getPublicDiagram(diagramId).catch(() => null);

  if (!diagram) {
    notFound();
  }

  return <DiagramViewer code={diagram.code} name={diagram.name} />;
}
