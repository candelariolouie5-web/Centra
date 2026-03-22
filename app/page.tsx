import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import dynamic from "next/dynamic";
import Hero from "@/components/Hero";
import Service from "@/components/Service";
import About from "@/components/About";
import Sentiments from "@/components/Sentiments";
import Footer from "@/components/Footer";

export default async function Home() {




  // Public landing page for guests and USER
  return (
    <div>
      <Hero />
      <Service />
      <About />
      <Sentiments />
      <Footer />
    </div>
  );

}
