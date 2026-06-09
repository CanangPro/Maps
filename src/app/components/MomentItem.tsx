import React from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface MomentItemProps {
  image: string;
  caption: string;
  date: string;
}

export function MomentItem({ image, caption, date }: MomentItemProps) {
  return (
    <div className="group relative aspect-square overflow-hidden rounded-xl border border-border/50">
      <ImageWithFallback
        src={image}
        alt={caption}
        className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
        <p className="text-white text-xs font-medium mb-1 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          {caption}
        </p>
        <p className="text-white/60 text-[10px] uppercase tracking-widest translate-y-2 group-hover:translate-y-0 transition-transform duration-500 delay-75">
          {date}
        </p>
      </div>
    </div>
  );
}
