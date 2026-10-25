import {
    BLANC,
    COLOR_BLANC_SALE,
    COLOR_NOIR,
    COLOR_VERT,
    FEUILLE,
} from '@/components/assets/assets';
import { Head, usePage } from '@inertiajs/react';
import { useEffect } from 'react';

// ─── Design tokens (cohérents avec login.tsx) ─────────────────────────────

interface AppSettings {
    app_name: string;
    app_description: string;
    // Ajoutez d'autres paramètres globaux si nécessaire
}
interface PageProps {
    settings: AppSettings;
    [key: string]: any;
}

// ─── Données statiques ────────────────────────────────────────────────────
const valeurs = [
    {
        icon: '🌿',
        num: '01',
        titre: 'Respect des savoirs',
        desc: "Nous traitons chaque pratique traditionnelle avec la déférence qu'elle mérite, sans jugement ni hiérarchie entre les disciplines médicales.",
    },
    {
        icon: '🤝',
        num: '02',
        titre: 'Confiance & Sécurité',
        desc: 'La protection des données de santé est au cœur de notre architecture. Chaque échange est chiffré et souverain.',
    },
    {
        icon: '🌍',
        num: '03',
        titre: 'Inclusivité',
        desc: 'Notre plateforme est accessible en plusieurs langues, pensée pour les zones à faible connectivité et adaptée à une diversité de pratiques.',
    },
    {
        icon: '📚',
        num: '04',
        titre: 'Transmission',
        desc: "Chaque article, chaque remède publié contribue à l'archive vivante du patrimoine médical traditionnel africain.",
    },
    {
        icon: '⚖️',
        num: '05',
        titre: 'Éthique & Transparence',
        desc: "Nos conditions d'utilisation sont claires, nos modérateurs sont formés, et notre gouvernance reste ouverte à la communauté.",
    },
    {
        icon: '🚀',
        num: '06',
        titre: 'Innovation',
        desc: 'Téléconsultation, géolocalisation, IA appliquée à la phytothérapie — nous innovons en gardant la communauté au centre.',
    },
];

const stats = [
    { num: '500+', label: 'Tradipraticiens inscrits' },
    { num: '8', label: 'Pays représentés' },
    { num: '4 K', label: 'Remèdes documentés' },
    { num: '96%', label: 'Satisfaction praticiens' },
];

const equipe = [
    {
        nom: 'Amara Diallo',
        role: 'Co-fondateur & CEO',
        img: 'https://i.pravatar.cc/150?img=11',
    },
    {
        nom: 'Fatou Koné',
        role: 'Directrice Communauté',
        img: 'https://i.pravatar.cc/150?img=47',
    },
    {
        nom: 'Ibrahim Sawadogo',
        role: 'Architecte Technique',
        img: 'https://i.pravatar.cc/150?img=32',
    },
    {
        nom: 'Cécile Ouédraogo',
        role: 'Responsable Santé',
        img: 'https://i.pravatar.cc/150?img=25',
    },
];

// ─── Hook scroll reveal ───────────────────────────────────────────────────
function useReveal() {
    useEffect(() => {
        const els = document.querySelectorAll<HTMLElement>('[data-reveal]');
        const obs = new IntersectionObserver(
            (entries) =>
                entries.forEach((e) => {
                    if (e.isIntersecting) {
                        (e.target as HTMLElement).style.opacity = '1';
                        (e.target as HTMLElement).style.transform =
                            'translateY(0)';
                    }
                }),
            { threshold: 0.1 },
        );
        els.forEach((el) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(28px)';
            el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
            obs.observe(el);
        });
        return () => obs.disconnect();
    }, []);
}

// ─── Composants réutilisables ─────────────────────────────────────────────
function SectionTag({ children }: { children: string }) {
    return (
        <span
            className="mb-6 inline-block rounded-full border px-4 py-1 text-xs font-medium tracking-widest uppercase"
            style={{ borderColor: FEUILLE, color: FEUILLE }}
        >
            {children}
        </span>
    );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <h2
            className="font-serif text-4xl leading-tight font-light"
            style={{
                color: COLOR_VERT,
                fontFamily: "'Cormorant Garamond', Georgia, serif",
            }}
        >
            {children}
        </h2>
    );
}

// ─── Page principale ──────────────────────────────────────────────────────
export default function APropos() {
    const { settings } = usePage<PageProps>().props;
    useReveal();

    return (
        <>
            <Head title={`À propos — ${settings?.app_name}`} />

            <div className="min-h-screen" style={{ background: BLANC }}>
                {/* ── HERO ─────────────────────────────────────── */}
                <section className="grid min-h-screen lg:grid-cols-2">
                    {/* Gauche */}
                    <div className="flex flex-col justify-center px-8 pt-32 pb-12 lg:px-24">
                        <p
                            className="mb-6 flex items-center gap-3 text-xs font-medium tracking-widest uppercase"
                            style={{
                                color: FEUILLE,
                                animation: 'fadeUp 0.8s 0.2s both',
                            }}
                        >
                            <span
                                className="inline-block h-px w-8"
                                style={{ background: FEUILLE }}
                            />
                            Notre histoire
                        </p>
                        <h1 className="mb-6 text-5xl leading-tight font-light lg:text-6xl">
                            La sagesse ancestrale,
                            <br />
                            au cœur du{' '}
                            <em
                                style={{
                                    color: COLOR_VERT,
                                    fontStyle: 'italic',
                                }}
                            >
                                numérique
                            </em>
                        </h1>
                        <p
                            className="mb-10 max-w-prose text-lg leading-relaxed font-light"
                            style={{
                                color: COLOR_NOIR,
                                animation: 'fadeUp 0.8s 0.6s both',
                            }}
                        >
                            {settings?.app_name} {settings?.app_description}
                        </p>
                        <div
                            className="flex flex-wrap items-center gap-4"
                            style={{ animation: 'fadeUp 0.8s 0.8s both' }}
                        >
                            <a
                                href="#mission"
                                className="rounded-full px-8 py-3 text-sm font-medium shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
                                style={{
                                    background: COLOR_VERT,
                                    color: BLANC,
                                }}
                            >
                                Notre mission
                            </a>
                            <a
                                href="#equipe"
                                className="border-b text-sm transition hover:opacity-70"
                                style={{
                                    color: COLOR_VERT,
                                    borderColor: COLOR_VERT,
                                }}
                            >
                                Rencontrer l'équipe
                            </a>
                        </div>
                    </div>

                    {/* Droite — image */}
                    <div className="relative hidden overflow-hidden lg:block">
                        <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{
                                backgroundImage:
                                    "url('http://localhost:8000/storage/images/feuille.jpg')",
                            }}
                        />
                        <div
                            className="absolute inset-0"
                            style={{
                                background: `linear-gradient(to right, ${BLANC} 0%, transparent 30%)`,
                            }}
                        />
                        {/* Badge */}
                        <div
                            className="absolute bottom-16 left-10 rounded-2xl p-5 shadow-2xl backdrop-blur-md"
                            style={{
                                background: 'rgba(253,250,245,0.95)',
                                border: `1px solid rgba(212,168,83,0.3)`,
                                animation: 'fadeUp 0.8s 1.2s both',
                            }}
                        >
                            <p
                                className="text-4xl leading-none font-semibold"
                                style={{
                                    fontFamily:
                                        "'Cormorant Garamond', Georgia, serif",
                                    color: COLOR_VERT,
                                }}
                            >
                                2 500+
                            </p>
                            <p
                                className="mt-1 text-xs"
                                style={{ color: COLOR_NOIR }}
                            >
                                Praticiens enregistrés
                            </p>
                        </div>
                    </div>
                </section>

                {/* ── MISSION ──────────────────────────────────── */}
                <section id="mission" className="px-8 py-24 lg:px-24">
                    <SectionTag>Qui sommes-nous</SectionTag>
                    <SectionTitle>
                        Né d'une{' '}
                        <em style={{ color: COLOR_VERT }}>conviction</em>{' '}
                        profonde
                    </SectionTitle>

                    <div className="mt-12 grid items-center gap-16 lg:grid-cols-2">
                        <div data-reveal className="space-y-5">
                            {[
                                `${settings?.app_name} est née de la rencontre entre deux mondes : celui des technologies modernes et celui des savoirs traditionnels de santé. Face à l'isolement des praticiens, 
                                à la disparition progressive de certaines pratiques et au manque de visibilité de cette médecine complémentaire, nous avons décidé d'agir.`,
                                `Notre plateforme offre aux tradipraticiens — herboristes, guérisseurs, phytothérapeutes, sages-femmes traditionnelles — un espace professionnel où ils peuvent exister, échanger et se développer.`,
                                `Nous croyons que la santé est un patrimoine commun. Et que chaque remède de grand-mère mérite d'être documenté, partagé et transmis aux générations futures avec respect et rigueur.`,
                            ].map((p, i) => (
                                <p
                                    key={i}
                                    className="text-justify text-2xl leading-relaxed font-light"
                                    style={{ color: COLOR_NOIR }}
                                >
                                    {p}
                                </p>
                            ))}
                        </div>
                        <div
                            data-reveal
                            className="overflow-hidden rounded-3xl"
                            style={{
                                aspectRatio: '4/5',
                                boxShadow: `0 20px 60px rgba(92,61,46,0.15)`,
                            }}
                        >
                            <img
                                src="http://localhost:8000/storage/images/apropos_img1.jpg"
                                alt="Tradipraticienne au travail"
                                className="h-full w-full object-cover transition duration-700 hover:scale-105"
                            />
                        </div>
                    </div>
                </section>

                {/* ── VALEURS ──────────────────────────────────── */}
                <section
                    id="valeurs"
                    className="px-8 py-24 lg:px-24"
                    style={{ background: COLOR_BLANC_SALE }}
                >
                    <SectionTag>Ce qui nous guide</SectionTag>
                    <SectionTitle>
                        Nos <em style={{ color: COLOR_VERT }}>valeurs</em>{' '}
                        fondatrices
                    </SectionTitle>

                    <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {valeurs.map((v) => (
                            <div
                                key={v.num}
                                data-reveal
                                className="group relative overflow-hidden rounded-2xl p-8 transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
                                style={{
                                    background: BLANC,
                                    border: `1px solid rgba(212,168,83,0.15)`,
                                }}
                            >
                                <span
                                    className="absolute top-4 right-4 font-serif text-5xl font-light"
                                    style={{
                                        fontFamily:
                                            "'Cormorant Garamond', Georgia, serif",
                                        color: COLOR_NOIR,
                                    }}
                                >
                                    {v.num}
                                </span>
                                <div
                                    className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl text-xl"
                                    style={{
                                        background: `linear-gradient(135deg, ${COLOR_VERT}, ${COLOR_NOIR})`,
                                    }}
                                >
                                    {v.icon}
                                </div>
                                <h3
                                    className="mb-3 text-xl font-semibold"
                                    style={{
                                        fontFamily:
                                            "'Cormorant Garamond', Georgia, serif",
                                        color: COLOR_VERT,
                                    }}
                                >
                                    {v.titre}
                                </h3>
                                <p
                                    className="text-sm leading-relaxed font-light"
                                    style={{ color: COLOR_NOIR }}
                                >
                                    {v.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── STATS ────────────────────────────────────── */}
                <section
                    className="px-8 py-20 lg:px-24"
                    style={{ background: COLOR_VERT }}
                >
                    <div className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
                        {stats.map((s) => (
                            <div key={s.label} data-reveal>
                                <span
                                    className="block text-5xl font-light"
                                    style={{
                                        fontFamily:
                                            "'Cormorant Garamond', Georgia, serif",
                                        color: COLOR_BLANC_SALE,
                                    }}
                                >
                                    {s.num}
                                </span>
                                <span
                                    className="mt-2 block text-sm tracking-wide"
                                    style={{ color: BLANC }}
                                >
                                    {s.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── ÉQUIPE ───────────────────────────────────── */}
                <section
                    id="equipe"
                    className="px-8 py-24 lg:px-24"
                    style={{ background: BLANC }}
                >
                    <SectionTag>Les humains derrière</SectionTag>
                    <SectionTitle>
                        Une équipe{' '}
                        <em style={{ color: COLOR_VERT }}>passionnée</em>
                    </SectionTitle>

                    <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        {equipe.map((m) => (
                            <div
                                key={m.nom}
                                data-reveal
                                className="group text-center transition duration-300 hover:-translate-y-1"
                            >
                                <img
                                    src={m.img}
                                    alt={m.nom}
                                    className="mx-auto mb-4 h-28 w-28 rounded-full object-cover"
                                    style={{
                                        border: `3px solid rgba(212,168,83,0.35)`,
                                    }}
                                />
                                <h4
                                    className="text-xl font-semibold"
                                    style={{
                                        fontFamily:
                                            "'Cormorant Garamond', Georgia, serif",
                                        color: COLOR_VERT,
                                    }}
                                >
                                    {m.nom}
                                </h4>
                                <span
                                    className="mt-1 block text-xs font-medium tracking-wide"
                                    style={{ color: FEUILLE }}
                                >
                                    {m.role}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </>
    );
}
