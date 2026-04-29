export default function LoadingSkeleton({ type = 'card', count = 1 }) {
  const skeletons = Array.from({ length: count }, (_, i) => i);

  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {skeletons.map((i) => (
          <div key={i} className="card p-6 space-y-3">
            <div className="skeleton h-4 w-24" />
            <div className="skeleton h-8 w-32" />
            <div className="skeleton h-3 w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'chart') {
    return (
      <div className="card p-6 space-y-4">
        <div className="skeleton h-5 w-40" />
        <div className="skeleton h-64 w-full" />
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className="space-y-3">
        {skeletons.map((i) => (
          <div key={i} className="card p-4 flex items-center gap-4">
            <div className="skeleton h-10 w-10 rounded-xl" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-4 w-48" />
              <div className="skeleton h-3 w-24" />
            </div>
            <div className="skeleton h-5 w-20" />
          </div>
        ))}
      </div>
    );
  }

  return null;
}
