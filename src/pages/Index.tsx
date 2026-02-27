import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AlgorithmsSection from "@/components/AlgorithmsSection";
import FeaturesSection from "@/components/FeaturesSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <div className="border-t border-border/30" />
      <AlgorithmsSection />
      <FeaturesSection />
      <footer className="border-t border-border/30 py-8 text-center text-sm text-muted-foreground">
        <p>© 2026 HAMII — AI-Powered Interview Preparation</p>
      </footer>
    </div>
  );
};

export default Index;
