import {
    BLANC,
    COLOR_BLANC_SALE,
    COLOR_NOIR,
    COLOR_VERT,
} from '@/components/assets/assets';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

interface AppSettings {
    app_name: string;
    app_description: string;
    contact_email: string;
    // Ajoutez d'autres paramètres globaux si nécessaire
}
interface PageProps {
    settings: AppSettings;
    [key: string]: any;
}





// ─── Contenu des sections ─────────────────────────────────────────────────
const articles = [
    {
        id: 'collecte',
        num: '01',
        tag: 'Article 1',
        titre: 'Données que nous collectons',
        icon: '📂',
    },
    {
        id: 'utilisation',
        num: '02',
        tag: 'Article 2',
        titre: 'Comment nous utilisons vos données',
        icon: '⚙️',
    },
    {
        id: 'partage',
        num: '03',
        tag: 'Article 3',
        titre: 'Partage de vos données',
        icon: '🤝',
    },
    {
        id: 'droits',
        num: '04',
        tag: 'Article 4',
        titre: 'Vos droits sur vos données',
        icon: '⚖️',
    },
    {
        id: 'securite',
        num: '05',
        tag: 'Article 5',
        titre: 'Sécurité des données',
        icon: '🔐',
    },
    {
        id: 'cookies',
        num: '06',
        tag: 'Article 6',
        titre: 'Cookies et traceurs',
        icon: '🍪',
    },
    {
        id: 'retention',
        num: '07',
        tag: 'Article 7',
        titre: 'Durée de conservation',
        icon: '📅',
    },
    {
        id: 'mineurs',
        num: '08',
        tag: 'Article 8',
        titre: 'Protection des mineurs',
        icon: '👶',
    },
    {
        id: 'modifications',
        num: '09',
        tag: 'Article 9',
        titre: 'Modifications de la politique',
        icon: '🔄',
    },
    {
        id: 'contact-dpo',
        num: '10',
        tag: 'Article 10',
        titre: 'Contact & Réclamations',
        icon: '📬',
    },
];

const droits = [
    {
        icon: '👁️',
        titre: "Droit d'accès",
        desc: 'Obtenir une copie de toutes vos données personnelles que nous détenons.',
    },
    {
        icon: '✏️',
        titre: 'Droit de rectification',
        desc: 'Corriger des données inexactes ou incomplètes vous concernant.',
    },
    {
        icon: '🗑️',
        titre: "Droit à l'effacement",
        desc: "Demander la suppression de vos données sous 30 jours (droit à l'oubli).",
    },
    {
        icon: '⏸️',
        titre: 'Droit de limitation',
        desc: 'Suspendre le traitement de vos données dans certaines circonstances.',
    },
    {
        icon: '📦',
        titre: 'Portabilité',
        desc: 'Recevoir vos données dans un format structuré, lisible par machine.',
    },
    {
        icon: '🚫',
        titre: "Droit d'opposition",
        desc: "S'opposer au traitement de vos données à tout moment.",
    },
];

const cookies = [
    {
        badge: 'Requis',
        type: 'req',
        titre: 'Session & authentification',
        desc: 'Maintien de votre connexion sécurisée. Non désactivable.',
    },
    {
        badge: 'Requis',
        type: 'req',
        titre: 'Protection CSRF',
        desc: 'Sécurité des formulaires contre les attaques cross-site. Non désactivable.',
    },
    {
        badge: 'Analytique',
        type: 'stat',
        titre: 'Statistiques anonymes',
        desc: "Mesure d'audience interne, données agrégées et non personnelles.",
    },
    {
        badge: 'Optionnel',
        type: 'opt',
        titre: 'Préférences utilisateur',
        desc: "Mémorisation de vos choix d'interface (langue, thème).",
    },
];

const badgeStyle: Record<string, { bg: string; color: string }> = {
    req: { bg: 'rgba(92,61,46,0.1)', color: COLOR_NOIR },
    stat: { bg: 'rgba(212,168,83,0.15)', color: COLOR_NOIR },
    opt: { bg: 'rgba(74,124,89,0.1)', color: COLOR_VERT },
};

function ArtHeader({
    icon,
    tag,
    titre,
}: {
    icon: string;
    tag: string;
    titre: string;
}) {
    return (
        <div
            className="mb-8 flex items-start gap-4 border-b pb-5"
            style={{ borderColor: `${COLOR_VERT}` }}
        >
            <div
                className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl text-xl"
                style={{
                    background: `linear-gradient(135deg, ${COLOR_VERT}, ${COLOR_NOIR})`,
                }}
            >
                {icon}
            </div>
            <div>
                <span
                    className="mb-1 block text-xs font-medium tracking-wider uppercase"
                    style={{ color: COLOR_VERT }}
                >
                    {tag}
                </span>
                <h2
                    className="text-2xl font-light"
                    style={{
                        fontFamily: "'Cormorant Garamond', Georgia, serif",
                        color: COLOR_NOIR,
                    }}
                >
                    {titre}
                </h2>
            </div>
        </div>
    );
}

// ─── Page Confidentialité ─────────────────────────────────────────────────
export default function Confidentialite() {
    const { settings } = usePage<PageProps>().props;
    const [activeId, setActiveId] = useState('collecte');

    useEffect(() => {
        const sections =
            document.querySelectorAll<HTMLElement>('section[data-sec]');
        const handler = () => {
            sections.forEach((s) => {
                const rect = s.getBoundingClientRect();
                if (rect.top < 200 && rect.bottom > 0)
                    setActiveId(s.dataset.sec ?? '');
            });
        };
        window.addEventListener('scroll', handler, { passive: true });
        return () => window.removeEventListener('scroll', handler);
    }, []);

    return (
        <>
            <Head title={`Confidentialité — ${settings?.app_name}`} />
            <div className="min-h-screen" style={{ background: BLANC }}>
                {/* ── HERO ─────────────────────────────────────── */}
                <header
                    className="relative overflow-hidden px-8 pt-36 pb-20 lg:px-24"
                    style={{ background: COLOR_BLANC_SALE }}
                >
                    <div
                        className="pointer-events-none absolute top-[-30%] right-[-15%] rounded-full"
                        style={{
                            width: '70vw',
                            height: '70vw',
                            background:
                                'radial-gradient(circle, rgba(212,168,83,0.06) 0%, transparent 70%)',
                        }}
                    />
                    <p
                        className="absolute right-16 bottom-6 text-9xl opacity-5 select-none"
                        style={{ color: '#fff' }}
                    >
                        🔒
                    </p>

                    <span
                        className="mb-5 inline-block rounded-full border px-4 py-1 text-xs font-medium tracking-widest uppercase"
                        style={{
                            borderColor: `${COLOR_NOIR}`,
                            color: COLOR_VERT,
                        }}
                    >
                        Légal & Protection
                    </span>
                    <h1
                        className="mb-4 max-w-2xl text-5xl leading-tight font-light text-white"
                        style={{
                            fontFamily: "'Cormorant Garamond', Georgia, serif",
                        }}
                    >
                        Politique de{' '}
                        <em style={{ color: COLOR_VERT }}>confidentialité</em>
                    </h1>
                    <p
                        className="mb-6 text-lg font-light"
                        style={{ color: BLANC }}
                    >
                        Vos données de santé nous sont confiées. Voici comment
                        nous les protégeons.
                    </p>
                    <div
                        className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm"
                        style={{
                            borderColor: COLOR_NOIR,
                            color: COLOR_VERT,
                        }}
                    >
                        🔄 Dernière mise à jour : 15 janvier 2025
                    </div>
                </header>

                {/* ── CORPS ────────────────────────────────────── */}
                <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 lg:grid-cols-[260px_1fr]">
                    {/* Sidebar */}
                    <aside className="hidden lg:block">
                        <div className="sticky top-24">
                            <p
                                className="mb-3 text-xs font-medium tracking-widest uppercase"
                                style={{ color: COLOR_NOIR }}
                            >
                                Sommaire
                            </p>
                            <nav className="space-y-0.5">
                                {articles.map((a) => (
                                    <a
                                        key={a.id}
                                        href={`#${a.id}`}
                                        className="flex items-center gap-2 rounded-lg border-l-2 px-4 py-2 text-sm transition"
                                        style={{
                                            color:
                                                activeId === a.id
                                                    ? BLANC
                                                    : COLOR_NOIR,
                                            background:
                                                activeId === a.id
                                                    ? COLOR_VERT
                                                    : 'transparent',
                                            borderLeftColor:
                                                activeId === a.id
                                                    ? COLOR_VERT
                                                    : 'transparent',
                                        }}
                                    >
                                        <span className="text-base">
                                            {a.icon}
                                        </span>
                                        {a.titre}
                                    </a>
                                ))}
                            </nav>

                            {/* Contact DPO */}
                            <div
                                className="mt-8 rounded-2xl p-5"
                                style={{
                                    background: COLOR_BLANC_SALE,
                                    border: `1px solid rgba(212,168,83,0.2)`,
                                }}
                            >
                                <h5
                                    className="mb-2 text-base font-semibold"
                                    style={{
                                        fontFamily:
                                            "'Cormorant Garamond', Georgia, serif",
                                        color: COLOR_NOIR,
                                    }}
                                >
                                    Délégué à la Protection des Données
                                </h5>
                                <p
                                    className="mb-3 text-xs leading-relaxed font-light"
                                    style={{ color: COLOR_NOIR }}
                                >
                                    Pour toute question sur vos données
                                    personnelles :
                                </p>
                                <a
                                    href={`mailto:${settings?.contact_email}`}
                                    className="text-xs font-medium"
                                    style={{ color: COLOR_VERT }}
                                >
                                    {settings?.contact_email}
                                </a>
                            </div>
                        </div>
                    </aside>

                    {/* Article */}
                    <article
                        className="space-y-16 text-sm leading-relaxed font-light"
                        style={{ color: COLOR_NOIR }}
                    >
                        {/* Intro box */}
                        <div
                            className="rounded-xl border-l-4 p-5"
                            style={{
                                background: COLOR_BLANC_SALE,
                                borderColor: COLOR_VERT,
                            }}
                        >
                            <p>
                                {`${settings?.app_name}`} traite des données à
                                caractère personnel, notamment des{' '}
                                <strong
                                    style={{
                                        color: COLOR_NOIR,
                                        fontWeight: 700,
                                    }}
                                >
                                    données de santé sensibles
                                </strong>
                                . Nous appliquons les principes du RGPD et des
                                législations locales en vigueur. La présente
                                politique vous explique de manière transparente
                                comment vos données sont collectées, utilisées
                                et protégées.
                            </p>
                        </div>

                        {/* Art 1 — Collecte */}
                        <section
                            data-sec="collecte"
                            id="collecte"
                            style={{ scrollMarginTop: '6rem' }}
                        >
                            <ArtHeader
                                icon="📂"
                                tag="Article 1"
                                titre="Données que nous collectons"
                            />
                            <p className="mb-4">
                                Nous collectons uniquement les données
                                nécessaires au fonctionnement de la plateforme (
                                <strong
                                    style={{
                                        color: COLOR_NOIR,
                                        fontWeight: 500,
                                    }}
                                >
                                    principe de minimisation
                                </strong>
                                ).
                            </p>

                            <div
                                className="overflow-x-auto rounded-xl"
                                style={{
                                    border: `1px solid rgba(212,168,83,0.15)`,
                                }}
                            >
                                <table className="w-full text-xs">
                                    <thead
                                        style={{ background: COLOR_BLANC_SALE }}
                                    >
                                        <tr>
                                            {[
                                                'Catégorie',
                                                'Données',
                                                'Obligatoire',
                                            ].map((h) => (
                                                <th
                                                    key={h}
                                                    className="px-4 py-3 text-left font-medium"
                                                    style={{
                                                        color: COLOR_NOIR,
                                                        borderBottom: `2px solid ${COLOR_VERT}`,
                                                    }}
                                                >
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            [
                                                'Identité',
                                                'Nom, prénom, date de naissance, photo',
                                                'Oui',
                                            ],
                                            [
                                                'Contact',
                                                'Email, numéro de téléphone',
                                                'Oui (email)',
                                            ],
                                            [
                                                'Géolocalisation',
                                                'Région, ville, coordonnées GPS',
                                                'Non',
                                            ],
                                            [
                                                'Profil professionnel',
                                                'Spécialités, expériences, langues',
                                                'Praticiens',
                                            ],
                                            [
                                                'Contenus publiés',
                                                'Articles, remèdes, commentaires',
                                                'Non',
                                            ],
                                            [
                                                'Navigation',
                                                'Pages visitées, durée session, appareil',
                                                'Anonymisé',
                                            ],
                                        ].map(([cat, data, req], i) => (
                                            <tr
                                                key={i}
                                                style={{
                                                    borderBottom: `1px solid ${COLOR_VERT}`,
                                                }}
                                            >
                                                <td className="px-4 py-3">
                                                    <strong
                                                        style={{
                                                            color: COLOR_NOIR,
                                                            fontWeight: 500,
                                                        }}
                                                    >
                                                        {cat}
                                                    </strong>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {data}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {req}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        {/* Art 2 — Utilisation */}
                        <section
                            data-sec="utilisation"
                            id="utilisation"
                            style={{ scrollMarginTop: '6rem' }}
                        >
                            <ArtHeader
                                icon="⚙️"
                                tag="Article 2"
                                titre="Comment nous utilisons vos données"
                            />
                            <p className="mb-3">
                                Vos données sont utilisées exclusivement pour
                                les finalités suivantes :
                            </p>
                            <ul className="space-y-2">
                                {[
                                    'Créer et gérer votre compte utilisateur et votre profil sur la plateforme',
                                    'Permettre la mise en relation entre tradipraticiens et patients',
                                    'Gérer les rendez-vous, notifications et rappels de consultation',
                                    'Alimenter votre tableau de bord analytique personnel',
                                    'Améliorer la qualité des fonctionnalités de recherche et géolocalisation',
                                    'Assurer la modération des contenus et la sécurité de la plateforme',
                                ].map((item, i) => (
                                    <li
                                        key={i}
                                        className="flex items-start gap-3"
                                    >
                                        <span
                                            className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full"
                                            style={{ background: COLOR_NOIR }}
                                        />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <div
                                className="mt-5 rounded-xl border-l-4 p-4"
                                style={{
                                    background: COLOR_BLANC_SALE,
                                    borderColor: COLOR_VERT,
                                }}
                            >
                                <p>
                                    {`${settings?.app_name}`}{' '}
                                    <strong
                                        style={{
                                            color: COLOR_NOIR,
                                            fontWeight: 500,
                                        }}
                                    >
                                        n'utilise pas vos données
                                    </strong>{' '}
                                    à des fins de profilage commercial, de
                                    ciblage publicitaire, ou de vente à des
                                    partenaires tiers.
                                </p>
                            </div>
                        </section>

                        {/* Art 3 — Partage */}
                        <section
                            data-sec="partage"
                            id="partage"
                            style={{ scrollMarginTop: '6rem' }}
                        >
                            <ArtHeader
                                icon="🤝"
                                tag="Article 3"
                                titre="Partage de vos données"
                            />
                            <p className="mb-4">
                                Vos données personnelles ne sont{' '}
                                <strong
                                    style={{
                                        color: COLOR_NOIR,
                                        fontWeight: 500,
                                    }}
                                >
                                    jamais vendues
                                </strong>
                                . Elles peuvent être partagées dans les cas
                                suivants uniquement :
                            </p>
                            <div
                                className="overflow-x-auto rounded-xl"
                                style={{
                                    border: `1px solid rgba(212,168,83,0.15)`,
                                }}
                            >
                                <table className="w-full text-xs">
                                    <thead
                                        style={{ background: COLOR_BLANC_SALE }}
                                    >
                                        <tr>
                                            {[
                                                'Destinataire',
                                                'Données partagées',
                                                'Raison',
                                            ].map((h) => (
                                                <th
                                                    key={h}
                                                    className="px-4 py-3 text-left font-medium"
                                                    style={{
                                                        color: COLOR_NOIR,
                                                        borderBottom: `2px solid ${COLOR_VERT}`,
                                                    }}
                                                >
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            [
                                                'Praticien consulté',
                                                'Nom, email, motif RDV',
                                                'Votre demande de RDV',
                                            ],
                                            [
                                                'Hébergeur cloud',
                                                'Données stockées chiffrées',
                                                'Infrastructure sécurisée',
                                            ],
                                            [
                                                'Service email',
                                                'Adresse email uniquement',
                                                'Notifications transactionnelles',
                                            ],
                                            [
                                                'Autorités légales',
                                                'Sur réquisition judiciaire',
                                                'Obligation légale',
                                            ],
                                        ].map(([dest, data, reason], i) => (
                                            <tr
                                                key={i}
                                                style={{
                                                    borderBottom: `1px solid ${COLOR_VERT}`,
                                                }}
                                            >
                                                <td className="px-4 py-3">
                                                    <strong
                                                        style={{
                                                            color: COLOR_NOIR,
                                                            fontWeight: 500,
                                                        }}
                                                    >
                                                        {dest}
                                                    </strong>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {data}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {reason}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        {/* Art 4 — Droits */}
                        <section
                            data-sec="droits"
                            id="droits"
                            style={{ scrollMarginTop: '6rem' }}
                        >
                            <ArtHeader
                                icon="⚖️"
                                tag="Article 4"
                                titre="Vos droits sur vos données"
                            />
                            <p className="mb-5">
                                Conformément au RGPD et aux législations
                                applicables, vous disposez des droits suivants :
                            </p>
                            <div className="grid gap-3 sm:grid-cols-2">
                                {droits.map((d) => (
                                    <div
                                        key={d.titre}
                                        className="flex items-start gap-3 rounded-xl p-4"
                                        style={{
                                            background: COLOR_BLANC_SALE,
                                            border: `1px solid ${COLOR_NOIR}`,
                                        }}
                                    >
                                        <span className="text-xl">
                                            {d.icon}
                                        </span>
                                        <div>
                                            <h5
                                                className="mb-1 text-sm font-semibold"
                                                style={{
                                                    fontFamily:
                                                        "'Cormorant Garamond', Georgia, serif",
                                                    color: COLOR_NOIR,
                                                }}
                                            >
                                                {d.titre}
                                            </h5>
                                            <p className="text-xs">{d.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <p className="mt-5">
                                Pour exercer vos droits :{' '}
                                <a
                                    href={`mailto:${settings?.contact_email}`}
                                    className="font-medium"
                                    style={{ color: COLOR_VERT }}
                                >
                                    {`${settings?.contact_email}`}
                                </a>{' '}
                                — Réponse garantie sous{' '}
                                <strong
                                    style={{
                                        color: COLOR_NOIR,
                                        fontWeight: 500,
                                    }}
                                >
                                    30 jours
                                </strong>
                                .
                            </p>
                        </section>

                        {/* Art 5 — Sécurité */}
                        <section
                            data-sec="securite"
                            id="securite"
                            style={{ scrollMarginTop: '6rem' }}
                        >
                            <ArtHeader
                                icon="🔐"
                                tag="Article 5"
                                titre="Sécurité des données"
                            />
                            <p className="mb-4">
                                {settings?.app_name} applique les mesures
                                techniques et organisationnelles suivantes :
                            </p>
                            <ul className="space-y-2">
                                {[
                                    'Chiffrement TLS/SSL pour toutes les communications réseau',
                                    'Chiffrement AES-256 pour les données de santé stockées au repos',
                                    'Authentification à deux facteurs (2FA) disponible et encouragée',
                                    "Tokens d'accès JWT à durée de vie limitée pour les sessions",
                                    'Audit de sécurité trimestriel par un prestataire indépendant',
                                    'Hachage bcrypt pour les mots de passe (jamais stockés en clair)',
                                    'Sauvegardes chiffrées quotidiennes avec rétention 90 jours',
                                ].map((item, i) => (
                                    <li
                                        key={i}
                                        className="flex items-start gap-3"
                                    >
                                        <span
                                            className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full"
                                            style={{
                                                background: COLOR_BLANC_SALE,
                                            }}
                                        />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </section>

                        {/* Art 6 — Cookies */}
                        <section
                            data-sec="cookies"
                            id="cookies"
                            style={{ scrollMarginTop: '6rem' }}
                        >
                            <ArtHeader
                                icon="🍪"
                                tag="Article 6"
                                titre="Cookies et traceurs"
                            />
                            <p className="mb-4">
                                Nous utilisons un nombre minimal de cookies,
                                uniquement ceux nécessaires au bon
                                fonctionnement de la plateforme.
                            </p>
                            <div className="space-y-2">
                                {cookies.map((c) => (
                                    <div
                                        key={c.titre}
                                        className="flex items-start gap-3 rounded-xl p-4"
                                        style={{
                                            background: COLOR_BLANC_SALE,
                                            border: `1px solid ${COLOR_VERT}`,
                                        }}
                                    >
                                        <span
                                            className="mt-0.5 flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium"
                                            style={{
                                                background:
                                                    badgeStyle[c.type].bg,
                                                color: badgeStyle[c.type].color,
                                            }}
                                        >
                                            {c.badge}
                                        </span>
                                        <div>
                                            <strong
                                                style={{
                                                    color: COLOR_NOIR,
                                                    fontWeight: 500,
                                                }}
                                            >
                                                {c.titre}
                                            </strong>
                                            {' — '}
                                            {c.desc}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Art 7 — Rétention */}
                        <section
                            data-sec="retention"
                            id="retention"
                            style={{ scrollMarginTop: '6rem' }}
                        >
                            <ArtHeader
                                icon="📅"
                                tag="Article 7"
                                titre="Durée de conservation"
                            />
                            <div
                                className="overflow-x-auto rounded-xl"
                                style={{
                                    border: `1px solid rgba(212,168,83,0.15)`,
                                }}
                            >
                                <table className="w-full text-xs">
                                    <thead
                                        style={{ background: COLOR_BLANC_SALE }}
                                    >
                                        <tr>
                                            {[
                                                'Type de données',
                                                'Durée de conservation',
                                            ].map((h) => (
                                                <th
                                                    key={h}
                                                    className="px-4 py-3 text-left font-medium"
                                                    style={{
                                                        color: COLOR_NOIR,
                                                        borderBottom: `2px solid rgba(212,168,83,0.3)`,
                                                    }}
                                                >
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            [
                                                'Données de compte actif',
                                                'Durée de la relation contractuelle',
                                            ],
                                            [
                                                'Données après suppression du compte',
                                                '30 jours (puis suppression définitive)',
                                            ],
                                            [
                                                'Données de facturation',
                                                '7 ans (obligation légale)',
                                            ],
                                            ['Journaux de sécurité', '12 mois'],
                                            [
                                                'Publications anonymisées',
                                                'Indéfinie (archive culturelle)',
                                            ],
                                            [
                                                'Données analytiques anonymes',
                                                '26 mois',
                                            ],
                                        ].map(([type, duree], i) => (
                                            <tr
                                                key={i}
                                                style={{
                                                    borderBottom: `1px solid ${COLOR_VERT}`,
                                                }}
                                            >
                                                <td className="px-4 py-3">
                                                    {type}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {duree}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        {/* Art 8 — Mineurs */}
                        <section
                            data-sec="mineurs"
                            id="mineurs"
                            style={{ scrollMarginTop: '6rem' }}
                        >
                            <ArtHeader
                                icon="👶"
                                tag="Article 8"
                                titre="Protection des mineurs"
                            />
                            <p>
                                {settings?.app_name} est une plateforme réservée
                                aux{' '}
                                <strong
                                    style={{
                                        color: COLOR_NOIR,
                                        fontWeight: 500,
                                    }}
                                >
                                    personnes de 18 ans et plus
                                </strong>
                                . Nous ne collectons pas sciemment de données
                                sur des mineurs. Si nous découvrons qu'un mineur
                                a créé un compte, nous procédons à la
                                suppression immédiate de ses données. Les
                                parents peuvent nous signaler une telle
                                situation à{' '}
                                <a
                                    href={`mailto:${settings?.contact_email}`}
                                    style={{ color: COLOR_VERT }}
                                >
                                    {`${settings?.contact_email}`}
                                </a>
                                .
                            </p>
                        </section>

                        {/* Art 9 — Modifications */}
                        <section
                            data-sec="modifications"
                            id="modifications"
                            style={{ scrollMarginTop: '6rem' }}
                        >
                            <ArtHeader
                                icon="🔄"
                                tag="Article 9"
                                titre="Modifications de la politique"
                            />
                            <p>
                                {settings?.app_name} se réserve le droit de
                                modifier la présente politique à tout moment. En
                                cas de modification substantielle, vous serez
                                notifié par email et via une bannière dans
                                l'application{' '}
                                <strong
                                    style={{
                                        color: COLOR_NOIR,
                                        fontWeight: 500,
                                    }}
                                >
                                    au moins 14 jours avant
                                </strong>{' '}
                                l'entrée en vigueur des changements.
                            </p>
                        </section>

                        {/* Art 10 — Contact */}
                        <section
                            data-sec="contact-dpo"
                            id="contact-dpo"
                            style={{ scrollMarginTop: '6rem' }}
                        >
                            <ArtHeader
                                icon="📬"
                                tag="Article 10"
                                titre="Contact & Réclamations"
                            />
                            <p className="mb-4">
                                Pour toute question relative à vos données
                                personnelles, contactez notre{' '}
                                <strong
                                    style={{
                                        color: COLOR_NOIR,
                                        fontWeight: 500,
                                    }}
                                >
                                    Délégué à la Protection des Données
                                </strong>{' '}
                                :
                            </p>
                            <div
                                className="rounded-2xl p-6"
                                style={{
                                    background: COLOR_BLANC_SALE,
                                    border: `1px solid rgba(212,168,83,0.2)`,
                                }}
                            >
                                <h5
                                    className="mb-4 text-base font-semibold"
                                    style={{
                                        fontFamily:
                                            "'Cormorant Garamond', Georgia, serif",
                                        color: COLOR_NOIR,
                                    }}
                                >
                                    {settings?.app_name} — Service DPO
                                </h5>
                                {[
                                    [
                                        '📧',
                                        'Email :',
                                        `${settings?.contact_email}`,
                                        `mailto:${settings?.contact_email}`,
                                    ],
                                    [
                                        '📮',
                                        'Adresse :',
                                        "12, Avenue Kwame N'Krumah, Ouagadougou, Burkina Faso",
                                        null,
                                    ],
                                    [
                                        '⏱️',
                                        'Délai de réponse :',
                                        '30 jours ouvrés garantis',
                                        null,
                                    ],
                                ].map(([icon, label, val, href], i) => (
                                    <div
                                        key={i}
                                        className="mb-2 flex gap-2 text-sm"
                                    >
                                        <span>{icon}</span>
                                        <span style={{ color: COLOR_NOIR }}>
                                            {label}
                                        </span>
                                        {href ? (
                                            <a
                                                href={href as string}
                                                className="font-medium"
                                                style={{ color: COLOR_VERT }}
                                            >
                                                {val}
                                            </a>
                                        ) : (
                                            <span style={{ color: COLOR_NOIR }}>
                                                {val}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    </article>
                </div>
            </div>
        </>
    );
}
