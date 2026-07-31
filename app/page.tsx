import { prisma } from '@/lib/prisma'; 
import Hero from "@/components/Hero";
import Service from "@/components/Service";
import About from "@/components/About";
import Sentiments from "@/components/Sentiments";
import Footer from "@/components/Footer";

export default async function Home() {
  // CHANGED: prisma.announcement (singular) instead of announcements (plural)
  const announcements = await prisma.announcement.findMany({
    where: {
      status: 'Published',
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div>
      <Hero announcements={announcements} />
      <Service />
      <About />
      <Sentiments />
      <Footer />
    </div>
  );
}