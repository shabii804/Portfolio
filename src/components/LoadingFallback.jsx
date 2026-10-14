export default function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary">
      <div className="flex items-center gap-3">
        <svg className="animate-spin text-accent-indigo" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
        <span className="font-mono text-sm text-text-muted">Loading...</span>
      </div>
    </div>
  );
}
