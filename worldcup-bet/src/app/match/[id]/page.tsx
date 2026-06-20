import { Navbar, Footer } from "@/components/layout";
import { MatchDetail } from "@/components/match-detail";

interface MatchPageProps {
  params: Promise<{ id: string }>;
}

export default async function MatchPage({ params }: MatchPageProps) {
  const { id } = await params;

  return (
    <>
      <Navbar />
      <main className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <MatchDetail matchId={id} />
      </main>
      <Footer />
    </>
  );
}
