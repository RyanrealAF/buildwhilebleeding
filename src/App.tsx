import { ArrowUpRight } from "lucide-react";

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
    liveUrl: "https://buildwhilebleeding.com/hardwire/",
    repoUrl: "https://github.com/RyanrealAF/Hardwire",
    details: "Zero-fluff street music theory curriculum, interactive MIDI workbench, and textbook distribution hub."
  },
  {
    number: "02",
    name: "Seuss",
    category: "Library",
    description: "Rhythm. Meter. Rhyme. Transfer.",
    route: "/library/seuss",
    liveUrl: "https://buildwhilebleeding.com/library/seuss/",
    repoUrl: "https://github.com/RyanrealAF/Seuss",
    details: "Formal theory library dissecting Dr. Seuss meter schemes, hip-hop rhythm cadences, and syllable transfer."
  },
  {
    number: "03",
    name: "The Leak Report",
    category: "Field",
    description: "Listening beneath the words.",
    route: "/the-leak-report",
    liveUrl: "https://buildwhilebleeding.com/the-leak-report/",
    repoUrl: "https://github.com/RyanrealAF/Theleakreport",
    details: "Educational field manual, tactical discourse analysis, forensic linguistics, and listening beneath the words."
  },
  {
    number: "04",
    name: "Cartography",
    category: "Archive",
    description: "Songs, narratives, PSAs, documents.",
    route: "/cartography",
    liveUrl: "https://buildwhilebleeding.com/cartography/",
    repoUrl: "https://github.com/RyanrealAF/Cartography",
    details: "Connected bodies of work, creative lineages, artifacts, songs, and field records outside the clean room."
  },
  {
    number: "05",
    name: "The Mosaic Theory",
    category: "Ledger",
    description: "Evidence. Medicine. Law. Reconstruction.",
    route: "/mosaic",
    liveUrl: "https://buildwhilebleeding.com/mosaic/",
    repoUrl: "https://github.com/RyanrealAF/The_Mosaic_Theory",
    details: "Somatic damage, constitutional injury under DSA, and forensic reconstruction ledger."
  }
];

export default function App() {
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
                href={project.liveUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                title={`Open ${project.name} (${project.liveUrl})`}
              >
                <span className="cat mono">{project.category}</span>
                <h2>
                  {project.name}
                  <ArrowUpRight size={16} className="title-arrow" />
                </h2>
                <p>{project.description}</p>
              </a>
              <span className="route mono">{project.route}</span>
            </div>
          ))}
        </section>

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
