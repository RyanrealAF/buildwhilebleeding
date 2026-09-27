import { useState } from "react";
import { ExternalLink, Code2, Globe, X, ArrowUpRight } from "lucide-react";

export interface Project {
  number: string;
  name: string;
  category: string;
  description: string;
  route: string;
  liveUrl: string;
  repoUrl: string;
  details: string;
}

export const projects: Project[] = [
  {
    number: "01",
    name: "Hardwire",
    category: "System",
    description: "Music theory for the streets.",
    route: "/hardwire",
    liveUrl: "https://the-hardwire-method.pages.dev",
    repoUrl: "https://github.com/RyanrealAF/Hardwire",
    details: "Zero-fluff street music theory curriculum, interactive MIDI workbench, and textbook distribution hub."
  },
  {
    number: "02",
    name: "Seuss",
    category: "Library",
    description: "Rhythm. Meter. Rhyme. Transfer.",
    route: "/library/seuss",
    liveUrl: "https://raw.githack.com/RyanrealAF/Seuss/main/index.html",
    repoUrl: "https://github.com/RyanrealAF/Seuss",
    details: "Formal theory library dissecting Dr. Seuss meter schemes, hip-hop rhythm cadences, and syllable transfer."
  },
  {
    number: "03",
    name: "The Leak Report",
    category: "Field",
    description: "Listening beneath the words.",
    route: "/the-leak-report",
    liveUrl: "https://the-leak-report.pages.dev",
    repoUrl: "https://github.com/RyanrealAF/Theleakreport",
    details: "Educational field manual, tactical discourse analysis, forensic linguistics, and listening beneath the words."
  },
  {
    number: "04",
    name: "Cartography",
    category: "Archive",
    description: "Songs, narratives, PSAs, documents.",
    route: "/cartography",
    liveUrl: "https://cartography.pages.dev",
    repoUrl: "https://github.com/RyanrealAF/Cartography",
    details: "Connected bodies of work, creative lineages, artifacts, songs, and field records outside the clean room."
  },
  {
    number: "05",
    name: "The Mosaic Theory",
    category: "Ledger",
    description: "Evidence. Medicine. Law. Reconstruction.",
    route: "/mosaic",
    liveUrl: "https://the-mosaic-theory.pages.dev",
    repoUrl: "https://github.com/RyanrealAF/The_Mosaic_Theory",
    details: "Somatic damage, constitutional injury under DSA, and forensic reconstruction ledger."
  }
];

export default function App() {
  const [activeModal, setActiveModal] = useState<Project | null>(null);

  return (
    <>
      <header>
        <div className="wrap">
          <a className="wordmark" href="/" aria-label="Build While Bleeding home">
            BWB<span>/</span>
          </a>
          <nav aria-label="Primary navigation" className="header-nav">
            <a className="mono" href="#archive">Index</a>
            <a 
              className="mono repo-link" 
              href="https://github.com/RyanrealAF/buildwhilebleeding" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              GitHub <ArrowUpRight size={13} className="inline-icon" />
            </a>
          </nav>
        </div>
      </header>

      <main className="wrap">
        <section className="hero">
          <p className="tag mono">Tools. Theory. Field reports. Maps.</p>
          <h1>Build While<br />Bleeding.</h1>
          <p>
            Independent systems, research, writing, music, and fieldwork built <em>outside the clean room.</em>
          </p>
        </section>

        <section className="index-intro">
          <p>Five territories. One address.</p>
          <span className="mono status-badge">
            <span className="status-dot"></span> DIRECT ACCESS ACTIVE
          </span>
        </section>

        <section className="archive" id="archive" aria-label="Project archive">
          {projects.map((project) => (
            <div className="entry" key={project.name}>
              <span className="num">{project.number}</span>
              
              <a 
                className="body" 
                href={project.route}
                title={`Open ${project.name} (${project.route})`}
              >
                <span className="cat mono">{project.category}</span>
                <h2>
                  {project.name}
                  <ArrowUpRight size={16} className="title-arrow" />
                </h2>
                <p>{project.description}</p>
              </a>

              <div className="actions">
                <a
                  href={project.route}
                  className="action-btn live-btn mono"
                  title={`Launch ${project.name}`}
                >
                  <Globe size={13} />
                  <span>Launch</span>
                </a>

                <button
                  type="button"
                  onClick={() => setActiveModal(project)}
                  className="action-btn preview-btn mono"
                  title="Inspect project details"
                >
                  <span>Info</span>
                </button>

                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="action-btn repo-btn mono"
                  title="View repository on GitHub"
                >
                  <Code2 size={13} />
                </a>

                <span className="route mono">{project.route}</span>
              </div>
            </div>
          ))}
        </section>

        {activeModal && (
          <div className="modal-backdrop" onClick={() => setActiveModal(null)} role="dialog" aria-modal="true">
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <span className="cat mono">{activeModal.category} · Territory {activeModal.number}</span>
                  <h3>{activeModal.name}</h3>
                </div>
                <button 
                  className="close-btn" 
                  onClick={() => setActiveModal(null)}
                  aria-label="Close dialog"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="modal-body">
                <p className="modal-desc">{activeModal.details}</p>
                
                <div className="modal-meta">
                  <div className="meta-row">
                    <span className="mono meta-label">Production Route:</span>
                    <span className="mono meta-val">{activeModal.route}</span>
                  </div>
                  <div className="meta-row">
                    <span className="mono meta-label">Live Deployment:</span>
                    <a 
                      href={activeModal.liveUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="mono meta-link"
                    >
                      {activeModal.liveUrl} <ExternalLink size={12} className="inline-icon" />
                    </a>
                  </div>
                  <div className="meta-row">
                    <span className="mono meta-label">Source Repository:</span>
                    <a 
                      href={activeModal.repoUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="mono meta-link"
                    >
                      {activeModal.repoUrl} <ExternalLink size={12} className="inline-icon" />
                    </a>
                  </div>
                </div>

                <div className="modal-actions">
                  <a
                    href={activeModal.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cta-primary mono"
                  >
                    Open Live Deployment <ExternalLink size={14} className="inline-icon" />
                  </a>
                  <a
                    href={activeModal.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cta-secondary mono"
                  >
                    View Source Repo <Code2 size={14} className="inline-icon" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        <footer>
          <p className="line">Built outside the clean room.</p>
          <div className="row">
            <span className="mono">RYANREALAF</span>
            <span className="mono">BUILD WHILE BLEEDING</span>
          </div>
        </footer>
      </main>
    </>
  );
}
