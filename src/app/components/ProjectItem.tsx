import React from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ExternalLink, ArrowRight } from 'lucide-react';

interface ProjectItemProps {
  title: string;
  description: string;
  image: string;
  tags: string[];
  link?: string;
}

export function ProjectItem({ title, description, image, tags, link }: ProjectItemProps) {
  return (
    <div className="group flex flex-col md:flex-row gap-6 p-4 rounded-2xl hover:bg-accent/30 transition-all duration-300">
      <div className="w-full md:w-48 h-32 flex-shrink-0 overflow-hidden rounded-xl border border-border/50">
        <ImageWithFallback
          src={image}
          alt={title}
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
        />
      </div>
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-lg font-medium tracking-tight">{title}</h4>
            {link && (
              <a href={link} className="text-muted-foreground hover:text-foreground transition-colors">
                <ExternalLink size={18} />
              </a>
            )}
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            {description}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded bg-secondary text-secondary-foreground border border-border/10"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
