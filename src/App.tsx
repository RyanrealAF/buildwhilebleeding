const projects = [
  { number: "01", name: "Hardwire", category: "System", description: "Music theory for the streets.", href: "https://github.com/RyanrealAF/Hardwire" },
  { number: "02", name: "Seuss", category: "Library", description: "Rhythm. Meter. Rhyme. Transfer.", href: "https://github.com/RyanrealAF/Seuss" },
  { number: "03", name: "The Leak Report", category: "Field", description: "Listening beneath the words.", href: "https://github.com/RyanrealAF/Theleakreport" },
  { number: "04", name: "Cartography", category: "Archive", description: "Songs, narratives, PSAs, documents.", href: "https://github.com/RyanrealAF/Cartography" },
  { number: "05", name: "The Mosaic Theory", category: "Ledger", description: "Evidence. Medicine. Law. Reconstruction.", href: "https://github.com/RyanrealAF/The_Mosaic_Theory" }
];

export default function App() {
  return (
    <>
      <header>
        <div className="wrap">
          <a className="wordmark" href="/" aria-label="Build While Bleeding home">BWB<span>/</span></a>
          <nav aria-label="Primary navigation"><a className="mono" href="#archive">Index</a></nav>
        </div>
      </header>

      <main className="wrap">
        <section className="hero">
          <p className="tag mono">Tools. Theory. Field reports. Maps.</p>
          <h1>Build While<br />Bleeding.</h1>
          <p>Independent systems, research, writing, music, and fieldwork built <em>outside the clean room.</em></p>
        </section>

        <section className="index-intro">
          <p>Five territories. One address.</p>
        </section>

        <section className="archive" id="archive" aria-label="Project archive">
          {projects.map((project) => (
            <a className="entry" href={project.href} key={project.name}>
              <span className="num">{project.number}</span>
              <span className="body">
                <span className="cat mono">{project.category}</span>
                <h2>{project.name}</h2>
                <p>{project.description}</p>
              </span>
              <span className="route mono">{project.href.replace("https://", "")}</span>
            </a>
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
