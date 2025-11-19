import AuthGate from "@/components/AuthGate";
import Nav from "@/components/Nav";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function CriminalGroupsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/units/prokuratura");
  }, [router]);

  return (
    <AuthGate>
      <>
        <Head>
          <title>DOJ 77RP — Grupy przestępcze</title>
        </Head>
        <Nav />
        <main className="min-h-screen px-4 py-8">
          <div className="mx-auto flex max-w-3xl flex-col gap-6">
            <div className="card space-y-4 p-6" data-section="criminal-groups">
              <span className="section-chip">
                <span className="section-chip__dot" style={{ background: "#b47c4c" }} />
                Grupy przestępcze
              </span>
              <div className="space-y-3">
                <h1 className="text-3xl font-semibold tracking-tight text-white">Sekcja została przeniesiona</h1>
                <p className="text-sm text-white/70">
                  Rejestr grup przestępczych jest teraz dostępny bezpośrednio w panelach jednostek IRS oraz Prokuratury.
                  Wszystkie wpisy są wspólne dla obu wydziałów.
                </p>
                <p className="text-sm text-white/70">
                  Skorzystaj z poniższych odnośników, aby przejść do właściwego panelu zarządzania.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link className="btn text-sm" href="/units/irs">
                  Przejdź do IRS
                </Link>
                <Link className="btn text-sm" href="/units/prokuratura">
                  Przejdź do Prokuratury
                </Link>
              </div>
            </div>
          </div>
        </main>
      </>
    </AuthGate>
  );
}
