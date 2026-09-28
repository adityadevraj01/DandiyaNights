import DanceScene from "@/components/DanceScene";
import VenueScene from "@/components/VenueScene";
import Navbar from "@/components/Navbar";
import Marquee from "@/components/Marquee";
import Passes from "@/components/Passes";
import Sponsors from "@/components/Sponsors";
import Faq from "@/components/Faq";
import Footer from "@/components/Footer";
import WhatsAppFab from "@/components/WhatsAppFab";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <DanceScene />
        <VenueScene />
        <Marquee />
        <Passes />
        <Sponsors />
        <Faq />
      </main>
      <Footer />
      <WhatsAppFab />
    </>
  );
}
