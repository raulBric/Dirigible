import { Hero } from "@/components/home/Hero";
import {
  CtaBand,
  ExperienceSection,
  FaqSection,
  RouteSection,
  SafetySection,
  SustainabilitySection,
  TestimonialsSection,
  WindPointsSection,
} from "@/components/home/Sections";

export default function Home() {
  return (
    <>
      <Hero />
      <ExperienceSection />
      <RouteSection />
      <SustainabilitySection />
      <SafetySection />
      <WindPointsSection />
      <TestimonialsSection />
      <FaqSection />
      <CtaBand />
    </>
  );
}
