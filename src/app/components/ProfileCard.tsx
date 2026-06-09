import React from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Mail, Github, Twitter, Linkedin, MapPin } from 'lucide-react';

interface ProfileCardProps {
  name: string;
  role: string;
  bio: string;
  avatar: string;
  location: string;
  email: string;
}

export function ProfileCard({ name, role, bio, avatar, location, email }: ProfileCardProps) {
  return (
    <div className="bg-card text-card-foreground p-8 rounded-3xl border border-border shadow-sm">
      <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
        <div className="relative w-32 h-32 flex-shrink-0">
          <ImageWithFallback
            src={avatar}
            alt={name}
            className="w-full h-full object-cover rounded-2xl grayscale hover:grayscale-0 transition-all duration-500"
          />
        </div>
        <div className="flex-1">
          <div className="flex flex-col gap-1 mb-4">
            <h1 className="text-3xl font-medium tracking-tight">{name}</h1>
            <p className="text-muted-foreground font-normal">{role}</p>
          </div>
          <p className="text-muted-foreground leading-relaxed mb-6 max-w-lg">
            {bio}
          </p>
          <div className="flex flex-wrap justify-center md:justify-start gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin size={16} />
              <span>{location}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail size={16} />
              <span>{email}</span>
            </div>
          </div>
          <div className="flex justify-center md:justify-start gap-4 mt-6">
            <button className="p-2 hover:bg-accent rounded-full transition-colors text-muted-foreground hover:text-foreground">
              <Github size={20} />
            </button>
            <button className="p-2 hover:bg-accent rounded-full transition-colors text-muted-foreground hover:text-foreground">
              <Twitter size={20} />
            </button>
            <button className="p-2 hover:bg-accent rounded-full transition-colors text-muted-foreground hover:text-foreground">
              <Linkedin size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
