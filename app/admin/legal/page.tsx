export default function AdminLegalPage() {
  return (
    <div className="min-h-screen bg-page text-foreground p-6">
      <h1 className="text-2xl font-bold text-primary mb-4">Legal & Policy Assistant</h1>
      <p className="text-foreground/80 mb-6">Admin-only legal console. Wire to /api/admin/legal/monitor or other legal tools.</p>
      <div className="rounded-xl border border-primary/40 bg-panel p-4">
        <p className="text-muted-foreground text-sm">Add contract checks, policy monitors, and compliance tasks here.</p>
      </div>
    </div>
  );
}

