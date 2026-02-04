export default function AdminLegalPage() {
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl font-bold text-gold-400 mb-4">Legal & Policy Assistant</h1>
      <p className="text-gray-300 mb-6">Admin-only legal console. Wire to /api/admin/legal/monitor or other legal tools.</p>
      <div className="rounded-xl border border-gold-500/40 bg-gray-900 p-4">
        <p className="text-gray-400 text-sm">Add contract checks, policy monitors, and compliance tasks here.</p>
      </div>
    </div>
  );
}

