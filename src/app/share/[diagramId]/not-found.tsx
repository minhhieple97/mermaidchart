import { Lock } from 'lucide-react';

/**
 * Not Found Page for Share Route
 * Displayed for private or non-existent diagrams
 */
export default function NotFound() {
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
