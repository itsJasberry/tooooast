import FaqSection from "@/components/animata/accordion/faq";
import GlowingCard from "@/components/animata/card/glowing-card";
import Hero from "@/components/sections/Hero";
import Pricing from "@/components/sections/Pricing";
import Testimonials from "@/components/sections/Testimonials";
import Tools from "@/components/sections/Tools";
import WayOfWork from "@/components/sections/WayOfWork";

const Page = () => {
  return (
    <main>
      <Hero />
      <Tools />
      {/* <WayOfWork />
      <Testimonials /> */}
      <Pricing />

      <FaqSection />
    </main>
  );
};

export default Page;
