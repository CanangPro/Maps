import { Outlet } from "react-router";

export default function Root() {
  return (
    <div className="dark min-h-screen bg-background selection:bg-primary selection:text-primary-foreground">
      <main className="max-w-3xl mx-auto px-4 py-20">
        <Outlet />
      </main>
      <footer className="py-12 border-t border-border/10 text-center">
        <p className="text-sm text-muted-foreground font-normal">
          © {new Date().getFullYear()} — Minimalist Profile
        </p>
      </footer>
    </div>
  );
}
