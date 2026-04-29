export default function StatCard({ title, value, subtitle, icon: Icon, color = '#10b981', trend }) {
  return (
    <div className="card p-6 group cursor-default">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>
            {title}
          </p>
          <p className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs font-medium flex items-center gap-1" style={{ color: trend === 'up' ? '#10b981' : trend === 'down' ? '#ef4444' : 'var(--color-text-muted)' }}>
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <div
            className="flex items-center justify-center w-12 h-12 rounded-2xl transition-transform duration-300 group-hover:scale-110"
            style={{ background: `${color}18`, color }}
          >
            <Icon size={22} />
          </div>
        )}
      </div>
    </div>
  );
}
