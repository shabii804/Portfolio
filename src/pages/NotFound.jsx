import { Link } from "react-router-dom";
import { usePortfolio } from "../hooks/usePortfolio";

export default function NotFound() {
  const { personal } = usePortfolio();

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary text-text-primary font-body relative overflow-hidden">
      <div className="noise-overlay" />
      {/* Background glows */}
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full opacity-[0.05] blur-[120px] bg-accent-indigo pointer-events-none bg-blob-indigo" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full opacity-[0.04] blur-[100px] bg-accent-cyan pointer-events-none bg-blob-cyan" />
      <div className="absolute inset-0 grid-bg z-0" />

      <div className="relative z-10 text-center px-6 max-w-xl mx-auto">
        <div className="font-mono text-xs uppercase tracking-[0.3em] text-accent-indigo/70 mb-4">
          Error 404
        </div>

        <h1 className="font-display font-bold leading-none mb-6">
          <span className="block text-[clamp(80px,15vw,180px)] text-gradient-indigo">404</span>
        </h1>

        <h2 className="font-display font-bold text-2xl sm:text-3xl text-text-primary mb-4">
          This page drifted off into space.
        </h2>

        <p className="font-body text-text-secondary text-base sm:text-lg leading-relaxed mb-10 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved. Let's get you back to safer ground.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link to="/" className="btn-primary px-6 py-3.5 rounded-xl font-display font-semibold text-sm flex items-center gap-2.5 group glow-on-hover">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="transition-transform group-hover:-translate-x-1">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
          <a
            href={`https://wa.me/${(personal.phone || "").replace(/\D/g, "")}`}
            target="_blank"
            rel="noreferrer"
            className="btn-ghost px-6 py-3.5 rounded-xl font-display font-semibold text-sm flex items-center gap-2.5 glow-on-hover"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12.012 2c-5.506 0-9.988 4.482-9.988 9.988 0 1.758.455 3.414 1.258 4.868L2 22l5.312-1.392c1.401.763 3.001 1.196 4.7 1.196 5.506 0 9.988-4.482 9.988-9.988C22 6.482 17.518 2 12.012 2z" /></svg>
            Contact Me
          </a>
        </div>

        <div className="mt-16 font-mono text-[10px] text-text-muted">
          <Link to="/" className="hover:text-accent-indigo transition-colors">Home</Link>
          <span className="mx-2">·</span>
          <a href={`mailto:${personal.email}`} className="hover:text-accent-indigo transition-colors">Email</a>
          <span className="mx-2">·</span>
          <a href={personal.github} target="_blank" rel="noreferrer" className="hover:text-accent-indigo transition-colors">GitHub</a>
        </div>
      </div>
    </div>
  );
}
