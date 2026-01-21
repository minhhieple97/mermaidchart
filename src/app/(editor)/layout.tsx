import { Toaster } from '@/components/ui/toaster';

interface EditorLayoutProps {
  children: React.ReactNode;
}

/**
 * Editor Layout
 * Full-screen layout for the diagram editor without the dashboard header
 * The editor has its own header with diagram-specific controls
 */
export default function EditorLayout({ children }: EditorLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
      <Toaster />
    </div>
  );
}
