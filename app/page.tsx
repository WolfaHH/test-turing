import { FAQSection } from "@/features/landing/faq-section";
import { Hero } from "@/features/landing/hero";
import { LandingHeader } from "@/features/landing/landing-header";
import { Footer } from "@/features/layout/footer";
import { Pricing } from "@/features/plans/pricing-section";

export default function HomePage() {
  return (
    <div className="bg-background text-foreground relative flex h-fit flex-col">
      <div className="mt-16"></div>

      <LandingHeader />

      <Hero />

      <Pricing />

      <FAQSection
        faq={[
          {
            question: "What is Cod'Hash Saas?",
            answer:
              "Cod'Hash Saas is a modern SaaS template built with Next.js, designed to help you launch your product faster.",
          },
          {
            question: "What technologies are included?",
            answer:
              "The template includes Next.js 15, TypeScript, TailwindCSS, Prisma, Better-Auth, Stripe, and more.",
          },
          {
            question: "Can I use this for commercial projects?",
            answer:
              "Yes, you can use this template for any commercial or personal projects.",
          },
          {
            question: "Is there support available?",
            answer:
              "Yes, we provide support through our documentation and community channels.",
          },
        ]}
      />

      <Footer />
    </div>
  );
}
