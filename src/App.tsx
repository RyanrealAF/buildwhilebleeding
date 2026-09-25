import { ProjectCard } from "./components/ProjectCard";

const projects = [
  { number: "01", name: "Hardwire", description: "Music theory for the streets.", href: "/hardwire", kind: "Interactive system" },
  { number: "02", name: "Seuss", description: "A theory library for rhythm, meter, rhyme, and transfer.", href: "/library/seuss", kind: "Theory library" },
  { number: "03", name: "The Leak Report", description: "An educational field manual for listening beneath the words.", href: "/the-leak-report", kind: "Field manual" },
  { number: "04", name: "Cartography", description: "Writings, songs, PSAs, and the broader archive.", href: "/cartography", kind: "Creative archive" }
];

export default function App() {
  return <main>
    <header className="masthead"><div className="eyebrow">BUILD WHILE BLEEDING</div><div className="rule" /><p className="tagline">Tools. Theory. Field reports. Maps.</p></header>
    <section className="hero"><p className="kicker">THE FRONT DOOR</p><h1>Build what survives.</h1><p className="intro">A working archive of systems, theory, field manuals, and creative work built outside the clean room.</p></section>
    <section className="projects" aria-label="Projects">{projects.map(project => <ProjectCard key={project.name} {...project} />)}</section>
    <footer><span>RYANREALAF</span><span>BUILD WHILE BLEEDING</span></footer>
  </main>;
}
