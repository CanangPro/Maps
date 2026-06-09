import React, { useState, useMemo } from 'react';
import { ProfileCard } from './components/ProfileCard';
import { CollapsibleSection } from './components/CollapsibleSection';
import { ProjectItem } from './components/ProjectItem';
import { MovieListItem, Movie } from './components/MovieListItem';
import { MomentItem } from './components/MomentItem';
import { Briefcase, Clapperboard, Camera, Search, X } from 'lucide-react';

// Images from Unsplash
const AVATAR = "https://images.unsplash.com/photo-1543132220-3ec99c6094dc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMG1hbGV8ZW58MXx8fHwxNzgwNDUyMzc4fDA&ixlib=rb-4.1.0&q=80&w=1080";
const PROJ_1 = "https://images.unsplash.com/photo-1604074131228-9d48b811bd80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB3ZWIlMjBkZXNpZ24lMjBwb3J0Zm9saW8lMjBtb2NrdXB8ZW58MXx8fHwxNzgwMjkyODkxfDA&ixlib=rb-4.1.0&q=80&w=1080";
const PROJ_2 = "https://images.unsplash.com/photo-1581287053822-fd7bf4f4bfec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGVhbiUyMG1pbmltYWxpc3QlMjBtb2JpbGUlMjBhcHAlMjBkZXNpZ258ZW58MXx8fHwxNzgwNDUyMzc4fDA&ixlib=rb-4.1.0&q=80&w=1080";
const MOMENT_1 = "https://images.unsplash.com/photo-1449247709967-d4461a6a6103?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZXN0aGV0aWMlMjBvZmZpY2UlMjB3b3Jrc3BhY2UlMjBtaW5pbWFsaXN0fGVufDF8fHx8MTc4MDQ1MjM3OHww&ixlib=rb-4.1.0&q=80&w=1080";
const MOMENT_2 = "https://images.unsplash.com/photo-1483366774565-c783b9f70e2c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwYXJjaGl0ZWN0dXJlJTIwZGVzaWdufGVufDF8fHx8MTc4MDQ1MjM3OHww&ixlib=rb-4.1.0&q=80&w=1080";
const MOMENT_3 = "https://images.unsplash.com/flagged/photo-1554443877-b2ea8132bab7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWF1dGlmdWwlMjBsYW5kc2NhcGUlMjBuYXR1cmUlMjBtaW5pbWFsaXN0fGVufDF8fHx8MTc4MDQ1MjM3OHww&ixlib=rb-4.1.0&q=80&w=1080";

const MOVIES: Movie[] = [
  {
    id: "1",
    title: "Interstellar",
    year: "2014",
    genre: "Sci-Fi / Adventure",
    rating: 5,
    image: "https://images.unsplash.com/photo-1754638504964-880857928e64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbnRlcnN0ZWxsYXIlMjBtb3ZpZSUyMHBvc3RlciUyMGNpbmVtYXxlbnwxfHx8fDE3ODA0NTI2MDV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival."
  },
  {
    id: "2",
    title: "Inception",
    year: "2010",
    genre: "Action / Sci-Fi",
    rating: 5,
    image: "https://images.unsplash.com/photo-1667004569384-df0b431fea87?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmNlcHRpb24lMjBtb3ZpZSUyMGZpbG0lMjBub2lyfGVufDF8fHx8MTc4MDQ1MjM3OHww&ixlib=rb-4.1.0&q=80&w=1080",
    description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task."
  },
  {
    id: "3",
    title: "Blade Runner 2049",
    year: "2017",
    genre: "Sci-Fi / Drama",
    rating: 4,
    image: "https://images.unsplash.com/photo-1727812518524-0129a7af817e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFkZSUyMHJ1bm5lciUyMDIwNDklMjBhZXN0aGV0aWMlMjBtb3ZpZXxlbnwxfHx8fDE3ODA0NTI2MDV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    description: "Young Blade Runner K's discovery of a long-buried secret leads him to track down former Blade Runner Rick Deckard."
  },
  {
    id: "4",
    title: "Parasite",
    year: "2019",
    genre: "Thriller / Comedy",
    rating: 5,
    image: "https://images.unsplash.com/photo-1630679246426-e488688fbc3d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXJhc2l0ZSUyMG1vdmllJTIwYWVzdGhldGljfGVufDF8fHx8MTc4MDQ1MjYwNnww&ixlib=rb-4.1.0&q=80&w=1080",
    description: "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan."
  },
  {
    id: "5",
    title: "Grand Budapest Hotel",
    year: "2014",
    genre: "Comedy / Adventure",
    rating: 4,
    image: "https://images.unsplash.com/photo-1678436689052-565b1f9ee999?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmFuZCUyMGJ1ZGFwZXN0JTIwaG90ZWwlMjBtb3ZpZSUyMGFlc3RoZXRpY3xlbnwxfHx8fDE3ODA0NTI2MDZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    description: "A writer encounters the owner of a decaying high-class hotel, who tells him of his early years serving as a lobby boy."
  },
  {
    id: "6",
    title: "Dune",
    year: "2021",
    genre: "Action / Sci-Fi",
    rating: 5,
    image: "https://images.unsplash.com/photo-1547235001-d703406d3f17?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkdW5lJTIwbW92aWUlMjBkZXNlcnQlMjBsYW5kc2NhcGV8ZW58MXx8fHwxNzgwNDUyNjA2fDA&ixlib=rb-4.1.0&q=80&w=1080",
    description: "Feature adaptation of Frank Herbert's science fiction novel about the son of a noble family entrusted with the protection of the most valuable asset in the galaxy."
  }
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMovies = useMemo(() => {
    return MOVIES.filter(movie => 
      movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movie.genre.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  return (
    <div className="flex flex-col gap-6">
      <ProfileCard
        name="Canang Cita"
        role="Product Designer & Developer"
        bio="Creating lorem ipsum website and campaign."
        avatar={AVATAR}
        location="Surabaya, INA"
        email="hello@euruseast.my.id"
      />

      <div className="grid gap-4 mt-4">
        <CollapsibleSection
          title="My Projects"
          icon={<Briefcase size={20} />}
          defaultOpen={true}
        >
          <div className="flex flex-col gap-4">
            <ProjectItem
              title="Nova Dashboard"
              description="A minimalist analytics dashboard for SaaS companies. Focused on high data density with low cognitive load."
              image={PROJ_1}
              tags={["React", "Framer Motion", "Tailwind"]}
              link="#"
            />
            <ProjectItem
              title="Aether Mobile"
              description="Minimalist lifestyle app for mindful breathing and meditation. Reimagining wellness through silence."
              image={PROJ_2}
              tags={["React Native", "Expo", "Reanimated"]}
              link="#"
            />
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title="Movie Recommendations"
          icon={<Clapperboard size={20} />}
        >
          <div className="flex flex-col gap-6">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search movies or genres..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-12 py-3 bg-secondary/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary/30 transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMovies.length > 0 ? (
                filteredMovies.map((movie) => (
                  <MovieListItem key={movie.id} movie={movie} />
                ))
              ) : (
                <div className="col-span-full py-12 text-center">
                  <p className="text-muted-foreground italic">No movies found matching your search.</p>
                </div>
              )}
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title="My Moments"
          icon={<Camera size={20} />}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <MomentItem
              image={MOMENT_1}
              caption="Quiet mornings in the studio."
              date="May 2026"
            />
            <MomentItem
              image={MOMENT_2}
              caption="The geometry of architecture."
              date="April 2026"
            />
            <MomentItem
              image={MOMENT_3}
              caption="Finding peace in nature."
              date="March 2026"
            />
          </div>
        </CollapsibleSection>
      </div>

      <div className="mt-12 p-8 rounded-3xl bg-primary text-primary-foreground flex flex-col md:flex-row items-center justify-between gap-6 border border-white/5">
        <div>
          <h3 className="text-2xl font-medium mb-1">Let's build something together.</h3>
          <p className="text-primary-foreground/70 font-normal">Currently accepting new projects for Q3 2026.</p>
        </div>
        <button className="px-8 py-3 bg-white text-black rounded-full font-medium hover:scale-105 active:scale-95 transition-all shadow-lg shadow-white/5">
          Get in Touch
        </button>
      </div>
    </div>
  );
}
