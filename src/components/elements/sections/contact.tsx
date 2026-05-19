import { Mail, Code, Share2, Link2 } from "lucide-react";

export default function Contact() {
  return (
    <div
      className="w-full max-w-2xl rounded-xl border border-border/30 bg-linear-to-br from-primary/5 to-background p-8 md:p-12 shadow-lg shadow-primary/5 mx-4 md:mx-auto"
      id="about"
    >
      <div className="space-y-6">
        {/* Email */}
        <a
          href="mailto:contact@cashly.dev"
          className="flex items-center gap-4 p-6 rounded-lg border border-border/30 bg-card/30 hover:bg-card/60 hover:border-primary/50 transition-all duration-300 hover:shadow-md hover:shadow-primary/10 group"
        >
          <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <Mail className="size-6 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-foreground">Email</p>
            <p className="text-sm text-muted-foreground">contact@cashly.dev</p>
          </div>
          <span className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            →
          </span>
        </a>

        {/* Social Links */}
        <div className="pt-6 border-t border-border/20">
          <p className="font-semibold text-foreground text-center text-2xl mb-4">
            Follow Us
          </p>
          <div className="grid grid-cols-3 gap-3">
            <a
              href="https://github.com/tunafysh/cashly"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 p-4 rounded-lg border border-border/30 bg-card/30 hover:bg-card/60 hover:border-primary/50 transition-all duration-300 group"
            >
              <Code className="size-5 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="text-sm font-medium hidden sm:inline">
                GitHub
              </span>
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 p-4 rounded-lg border border-border/30 bg-card/30 hover:bg-card/60 hover:border-primary/50 transition-all duration-300 group"
            >
              <Share2 className="size-5 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="text-sm font-medium hidden sm:inline">
                Twitter
              </span>
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 p-4 rounded-lg border border-border/30 bg-card/30 hover:bg-card/60 hover:border-primary/50 transition-all duration-300 group"
            >
              <Link2 className="size-5 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="text-sm font-medium hidden sm:inline">
                LinkedIn
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
