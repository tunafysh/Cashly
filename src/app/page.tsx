import HeroSection from "@/components/elements/sections/hero-section";
import Navbar from "@/components/elements/sections/navbar";
import Features from "@/components/elements/sections/features";
import Contact from "@/components/elements/sections/contact";
import Footer from "@/components/elements/sections/footer";

//** Page for testing out components locally cuz i don't have the auth keys and stuff. */
export default function Workbench() {
  return (
    <>
    <div className="lg:px-28 md:px-12 sm:px-0">
      <Navbar />
      <HeroSection />
      <section className="w-full bg-background flex flex-col items-center justify-center px-8 py-20" id="features">
        <Features />
      </section>
      <section className="w-full bg-linear-to-b from-background to-background/50 flex flex-col items-center justify-center px-8 py-20">
      <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-linear-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">Get in Touch</h2>
                <p className="text-muted-foreground">Have questions? We'd love to hear from you</p>
            </div>
        <Contact />
      </section>
    </div>
      <Footer />
  </>
  );
}
