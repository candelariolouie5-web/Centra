import { prisma } from '@/lib/prisma'; 
import Hero from "@/components/Hero";
import Service from "@/components/Service";
import About from "@/components/About";
import Sentiments from "@/components/Sentiments";
import Footer from "@/components/Footer";

export default async function Home() {
  // Use any[] to bypass type mismatch
  const announcements: any[] = await prisma.announcement.findMany({
    where: {
      status: 'Published',
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div>
      <Hero  />
      <Service />
      <About />
      <Sentiments />
      <Footer />
    </div>
  );
}