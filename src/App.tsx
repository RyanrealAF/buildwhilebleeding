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
    details: "A street-level music theory system built around FEEL → MAP → CONTROL. It translates rhythm, meter, harmony, MIDI, and production concepts into practical tools for self-taught musicians without requiring traditional notation or conservatory language."
  },
  {
    number: "02",
    name: "Seuss",
    category: "Library",
    description: "Rhythm. Meter. Rhyme. Transfer.",
    route: "/library/seuss",
    liveUrl: "https://buildwhilebleeding.com/library/seuss/",
    repoUrl: "https://github.com/RyanrealAF/Seuss",
    details: "A formal rhythm and meter library that uses Dr. Seuss as a laboratory for understanding syllable count, stress, rhyme, cadence, and transfer. The goal is to make the mechanics underneath infectious writing visible and usable."
  },
  {
    number: "03",
    name: "The Leak Report",
    category: "Field",
    description: "Listening beneath the words.",
    route: "/the-leak-report",
    liveUrl: "https://buildwhilebleeding.com/the-leak-report/",
    repoUrl: "https://github.com/RyanrealAF/Theleakreport",
    details: "A field manual for reading what language reveals beyond its literal content. It brings discourse analysis, forensic linguistics, cognitive load, social performance, and close listening into one practical framework for examining how people communicate under pressure."
  },
  {
    number: "04",
    name: "Cartography",
    category: "Archive",
    description: "Songs, narratives, PSAs, documents.",
    route: "/cartography",
    liveUrl: "https://buildwhilebleeding.com/cartography/",
    repoUrl: "https://github.com/RyanrealAF/Cartography",
    details: "An archive of connected creative work: songs, narratives, public-service pieces, documents, field records, and the ideas that connect them. It preserves the work as a living record rather than separating every artifact into a clean little box."
  },
  {
    number: "05",
    name: "The Mosaic Theory",
    category: "Ledger",
    description: "Evidence. Medicine. Law. Reconstruction.",
    route: "/mosaic",
    liveUrl: "https://buildwhilebleeding.com/mosaic/",
    repoUrl: "https://github.com/RyanrealAF/The_Mosaic_Theory",
    details: "A reconstruction ledger for complex evidence. It examines physical injury, constitutional questions, medical documentation, legal records, timelines, and corroborating fragments as connected pieces that can be assembled into a larger factual picture."
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
                  <ArrowUpRight size={20} className="title-arrow" />
                </h2>
                <p className="description">{project.description}</p>
                <p className="details">{project.details}</p>
                <span className="visit-link mono">ENTER PROJECT <ArrowUpRight size={14} /></span>
              </a>
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
