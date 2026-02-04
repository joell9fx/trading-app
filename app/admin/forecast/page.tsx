export default function AdminForecastPage() {
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl font-bold text-gold-400 mb-4">Forecasting & Predictive Analytics</h1>
      <p className="text-gray-300 mb-6">Admin-only forecasting console. Wire this page to /api/admin/forecast.</p>
      <div className="rounded-xl border border-gold-500/40 bg-gray-900 p-4">
        <p className="text-gray-400 text-sm">Add charts, inputs, and automation triggers here.</p>
      </div>
    </div>
  );
}

