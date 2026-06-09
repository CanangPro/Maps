import React from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Star } from 'lucide-react';

export interface Movie {
  id: string;
  title: string;
  year: string;
  genre: string;
  rating: number;
  image: string;
  description: string;
}

interface MovieListItemProps {
  movie: Movie;
}

export function MovieListItem({ movie }: MovieListItemProps) {
  return (
    <div className="flex gap-4 p-3 rounded-xl hover:bg-accent/50 transition-colors group">
      <div className="w-20 h-28 flex-shrink-0 overflow-hidden rounded-lg border border-border/50">
        <ImageWithFallback
          src={movie.image}
          alt={movie.title}
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
        />
      </div>
      <div className="flex-1 flex flex-col justify-center">
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-base font-medium text-foreground line-clamp-1">{movie.title}</h4>
          <span className="text-[10px] text-muted-foreground font-mono">{movie.year}</span>
        </div>
        <p className="text-xs text-muted-foreground mb-2 line-clamp-1">{movie.genre}</p>
        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={10}
              className={i < movie.rating ? "fill-primary text-primary" : "text-muted-foreground/30"}
            />
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground/70 line-clamp-2 leading-relaxed">
          {movie.description}
        </p>
      </div>
    </div>
  );
}
