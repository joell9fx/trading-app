import Link from 'next/link'

const sections = [
  { name: 'Global Reports', path: '/superadmin/reports', icon: '📈', desc: 'AI performance summaries & exports' },
  { name: 'User Management', path: '/superadmin/users', icon: '👥', desc: 'Admins, owners, bans & roles' },
  { name: 'Announcements', path: '/superadmin/announcements', icon: '📢', desc: 'Post site-wide updates' },
  { name: 'Admin Logs', path: '/superadmin/logs', icon: '🧾', desc: 'Audit all privileged actions' },
  { name: 'Security & Safety', path: '/superadmin/security', icon: '🛡️', desc: 'Lockdown & overrides' },
];

export default function SuperAdminDashboard() {
  return (
    <div className="bg-black text-white">
      <div className="grid md:grid-cols-3 gap-6">
        {sections.map((s) => (
          <Link
            key={s.name}
            href={s.path}
            className="bg-neutral-900 border border-gold-500/40 rounded-xl p-5 hover:scale-[1.01] hover:border-gold-400 transition-transform shadow-[0_0_20px_rgba(255,215,0,0.08)]"
          >
            <h3 className="text-xl text-gold-300 font-bold mb-2 flex items-center gap-2">
              <span>{s.icon}</span> {s.name}
            </h3>
            <p className="text-muted-foreground text-sm">{s.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

