import Head from "next/head";
import Image from "next/image";
import { signInWithEmailAndPassword } from "firebase/auth";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";

import AuthGate from "@/components/AuthGate";
import { auth, db } from "@/lib/firebase";

const LOGIN_DOMAIN = process.env.NEXT_PUBLIC_LOGIN_DOMAIN || "dps.local";

type Highlight = {
  title: string;
  description: string;
  icon: string;
};

type Pill = {
  label: string;
  tone: "amber" | "emerald" | "cyan";
};

type Stat = {
  label: string;
  value: string;
  hint: string;
};

type TimelineItem = {
  title: string;
  details: string;
};

const HIGHLIGHTS: Highlight[] = [
  {
    title: "Błyskawiczne raportowanie",
    description:
      "Gotowe szablony przyspieszają wypełnianie notatek służbowych, raportów i protokołów.",
    icon: "⚡",
  },
  {
    title: "Łączność między wydziałami",
    description:
      "Dziel się informacjami z pozostałymi sekcjami DOJ bez wychodzenia z terminala.",
    icon: "📡",
  },
  {
    title: "Autoryzacja dwustopniowa",
    description:
      "Dziennik zdarzeń i logi aktywności pomagają utrzymać kontrolę i zgodność procedur.",
    icon: "🛡️",
  },
];

const PILLS: Pill[] = [
  { label: "Szyfrowane logi zdarzeń", tone: "amber" },
  { label: "Wewnętrzny obieg dokumentów", tone: "cyan" },
  { label: "Zarządzanie jednostkami", tone: "emerald" },
];

const STATS: Stat[] = [
  { label: "Aktywne jednostki", value: "12", hint: "Sekcje DOJ online" },
  { label: "Szablony raportów", value: "37", hint: "Gotowe do użytku" },
  { label: "Czas reakcji", value: "< 1 min", hint: "Proces logowania" },
];

const TIMELINE: TimelineItem[] = [
  {
    title: "Logujesz się w terminalu",
    details: "System rozpoznaje Twoje uprawnienia i ustawia kontekst jednostki.",
  },
  {
    title: "Tworzysz dokument",
    details: "Szablony wypełniają kluczowe sekcje, a automatyczne logi zapisują Twoje działania.",
  },
  {
    title: "Wysyłasz do weryfikacji",
    details: "Przełożeni otrzymują powiadomienie i mogą od razu zaakceptować raport.",
  },
];

function PillBadge({ label, tone }: Pill) {
  const palette = useMemo(() => {
    switch (tone) {
      case "amber":
        return "bg-amber-500/10 text-amber-100 border-amber-300/40";
      case "emerald":
        return "bg-emerald-500/10 text-emerald-100 border-emerald-300/40";
      case "cyan":
        return "bg-cyan-500/10 text-cyan-100 border-cyan-300/40";
      default:
        return "bg-white/5 text-white border-white/10";
    }
  }, [tone]);

  return <span className={`pill ${palette}`}>{label}</span>;
}

function HighlightCard({ title, description, icon }: Highlight) {
  return (
    <article className="card glow-border">
      <div className="card__icon" aria-hidden>
        {icon}
      </div>
      <div className="space-y-2">
        <h3 className="card__title">{title}</h3>
        <p className="card__description">{description}</p>
      </div>
    </article>
  );
}

function StatCard({ label, value, hint }: Stat) {
  return (
    <div className="stat-card">
      <span className="stat-card__value">{value}</span>
      <span className="stat-card__label">{label}</span>
      <p className="stat-card__hint">{hint}</p>
    </div>
  );
}

function Timeline({ steps }: { steps: TimelineItem[] }) {
  return (
    <div className="timeline">
      {steps.map((step, index) => (
        <div className="timeline__item" key={step.title}>
          <div className="timeline__marker" aria-hidden>
            <span>{index + 1}</span>
          </div>
          <div>
            <h4 className="timeline__title">{step.title}</h4>
            <p className="timeline__details">{step.details}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function LoginPage() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    document.body.classList.add("is-login");
    return () => document.body.classList.remove("is-login");
  }, []);

  const getErrorMessage = (code?: string) => {
    switch (code) {
      case "auth/user-not-found":
        return "Nie znaleziono użytkownika o podanym loginie.";
      case "auth/invalid-email":
        return "Login ma nieprawidłowy format.";
      case "auth/wrong-password":
        return "Hasło jest nieprawidłowe.";
      case "auth/invalid-credential":
        return "Wprowadzono nieprawidłową kombinację loginu i hasła.";
      case "auth/too-many-requests":
        return "Zbyt wiele nieudanych prób logowania. Odczekaj chwilę.";
      default:
        return "Wprowadzono błędne dane logowania. Sprawdź login oraz hasło.";
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const email = `${login}@${LOGIN_DOMAIN}`;
      await signInWithEmailAndPassword(auth, email, password);
      await addDoc(collection(db, "logs"), {
        type: "login_success",
        section: "logowanie",
        action: "auth.login_success",
        message: `Pomyślne logowanie użytkownika ${login}.`,
        login,
        actorLogin: login,
        actorName: login,
        ts: serverTimestamp(),
      });
      router.push("/dashboard");
    } catch (e: unknown) {
      if (e && typeof e === "object" && "code" in e) {
        const code = (e as { code?: string }).code;
        setError(getErrorMessage(code));
        await addDoc(collection(db, "logs"), {
          type: "login_fail",
          section: "logowanie",
          action: "auth.login_fail",
          message: `Nieudane logowanie użytkownika ${login}.`,
          login,
          actorLogin: login,
          actorName: login,
          error: code,
          ts: serverTimestamp(),
        });
      } else {
        setError(getErrorMessage());
      }
    } finally {
      setLoading(false);
    }
  };

  const renderShell = (children: ReactNode) => (
    <div className="layout-shell">
      <div className="layout-grid">{children}</div>
    </div>
  );

  return (
    <AuthGate>
      <>
        <Head>
          <title>DOJ 77RP — Logowanie</title>
        </Head>

        <div className="login-bg" />
        {renderShell(
          <>
            <section className="hero">
              <div className="hero__badge">Wewnętrzny portal DOJ</div>
              <div className="hero__heading">
                <span className="hero__eyebrow">Nowy wygląd, pełen TypeScript</span>
                <h1>Terminal DOJ zbudowany od podstaw</h1>
                <p>
                  Kompletny przeprojektowanie interfejsu w TypeScript. Spójny język
                  wizualny, usprawnione logowanie i uporządkowana nawigacja po
                  dokumentach.
                </p>
              </div>

              <div className="hero__pills" aria-label="Najważniejsze funkcje">
                {PILLS.map((pill) => (
                  <PillBadge key={pill.label} {...pill} />
                ))}
              </div>

              <div className="hero__stats">
                {STATS.map((stat) => (
                  <StatCard key={stat.label} {...stat} />
                ))}
              </div>

              <Timeline steps={TIMELINE} />
            </section>

            <section className="auth-card" aria-label="Logowanie do systemu">
              <div className="auth-card__header">
                <Image
                  src="/logo.png"
                  alt="DOJ"
                  width={320}
                  height={80}
                  priority
                  className="floating"
                />
                <p className="auth-card__subtitle">Department of Justice — Mobile Data Terminal</p>
              </div>

              <form onSubmit={onSubmit} className="auth-card__form">
                <div>
                  <label className="label">Login</label>
                  <input
                    className="input"
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    required
                    autoComplete="username"
                  />
                </div>

                <div>
                  <label className="label">Hasło</label>
                  <input
                    className="input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                </div>

                {error && (
                  <p className="alert" role="alert">
                    {error}
                  </p>
                )}

                <button className="btn w-full" disabled={loading} type="submit">
                  {loading ? "Logowanie..." : "Zaloguj"}
                </button>

                <p className="auth-card__footnote">
                  Dostępy nadaje administrator. Brak rejestracji i opcji resetu hasła.
                  Loginy mają format <code>LOGIN@{LOGIN_DOMAIN}</code>.
                </p>
              </form>

              <div className="auth-card__highlights" aria-label="Korzyści systemu">
                {HIGHLIGHTS.map((item) => (
                  <HighlightCard key={item.title} {...item} />
                ))}
              </div>
            </section>
          </>
        )}
      </>
    </AuthGate>
  );
}
