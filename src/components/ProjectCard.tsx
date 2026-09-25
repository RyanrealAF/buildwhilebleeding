type ProjectCardProps = { number: string; name: string; description: string; href: string; kind: string };

export function ProjectCard({ number, name, description, href, kind }: ProjectCardProps) {
  return <a className="project-card" href={href}><span className="project-number">{number}</span><span className="project-body"><span className="project-kind">{kind}</span><span className="project-name">{name}</span><span className="project-description">{description}</span></span><span className="project-arrow" aria-hidden="true">↗</span></a>;
}
