import {
    BLANC,
    COLOR_BLANC_SALE,
    COLOR_NOIR,
    COLOR_VERT,
} from '@/components/assets/assets';
import { Head, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

interface AppSettings {
    app_name: string;
    app_description: string;
    contact_email: string;
    app_domain: string;
    app_address: string;
    // Ajoutez d'autres paramètres globaux si nécessaire
}
interface PageProps {
    settings: AppSettings;
    [key: string]: any;
}

const FEUILLE = '#4A7C59';

// ─── Sommaire ─────────────────────────────────────────────────────────────
const sommaire = [
    { id: 'objet', num: '01', titre: 'Objet & Acceptation' },
    { id: 'inscription', num: '02', titre: 'Inscription & Comptes' },
    { id: 'roles', num: '03', titre: 'Rôles & Permissions' },
    { id: 'contenus', num: '04', titre: 'Règles de publication' },
    { id: 'sante', num: '05', titre: 'Avertissement médical' },
    { id: 'rdv', num: '06', titre: 'Consultations & RDV' },
    { id: 'moderation', num: '07', titre: 'Modération' },
    { id: 'pi', num: '08', titre: 'Propriété intellectuelle' },
    { id: 'responsabilite', num: '09', titre: 'Responsabilité' },
    { id: 'resiliation', num: '10', titre: 'Résiliation' },
    { id: 'droit', num: '11', titre: 'Droit applicable' },
    { id: 'contact-legal', num: '12', titre: 'Contact' },
];

// ─── Données ──────────────────────────────────────────────────────────────
const rolesData = [
    {
        feature: 'Profil public visible',
        patient: '✓ Limité',
        praticien: '✓ Complet',
        modo: '✓',
    },
    {
        feature: 'Publication de remèdes',
        patient: '✗',
        praticien: '✓',
        modo: '✗',
    },
    {
        feature: 'Prise de rendez-vous',
        patient: '✓',
        praticien: '✓',
        modo: '✗',
    },
    {
        feature: 'Messagerie sécurisée',
        patient: '✓',
        praticien: '✓',
        modo: '✗',
    },
    {
        feature: 'Tableau de bord analytique',
        patient: '✗',
        praticien: '✓',
        modo: '✗',
    },
    {
        feature: 'Gestion des contenus',
        patient: '✗',
        praticien: '✗',
        modo: '✓',
    },
    {
        feature: 'Témoignages & notations',
        patient: '✓',
        praticien: '✗',
        modo: '✗',
    },
    {
        feature: 'Géolocalisation profil',
        patient: '✗',
        praticien: '✓',
        modo: '✗',
    },
];

const contenuPermis = [
    'Descriptions de plantes médicinales avec leurs propriétés connues',
    "Préparations traditionnelles avec précautions d'usage claires",
    'Articles éducatifs sur les pratiques traditionnelles de santé',
    "Témoignages et retours d'expériences vérifiables",
    'Questions et discussions communautaires sur la santé traditionnelle',
];

const contenuInterdit = [
    {
        icon: '🚫',
        text: 'Affirmations thérapeutiques non étayées ou mensongères',
    },
    {
        icon: '🚫',
        text: 'Remèdes présentant un danger avéré pour la santé sans avertissement',
    },
    {
        icon: '🚫',
        text: 'Publicité déguisée pour des produits commerciaux non déclarés',
    },
    {
        icon: '🚫',
        text: 'Discours discriminatoires, haineux ou à caractère sexuel',
    },
    {
        icon: '🚫',
        text: "Usurpation d'identité ou fausse identité professionnelle",
    },
    {
        icon: '🚫',
        text: "Partage de données personnelles d'autrui sans consentement",
    },
    {
        icon: '🚫',
        text: "Spam, messages automatisés ou tentatives d'hameçonnage",
    },
    {
        icon: '🚫',
        text: 'Contenus violant les droits de propriété intellectuelle',
    },
];

function ArtHeader({
    num,
    tag,
    titre,
}: {
    num: string;
    tag: string;
    titre: string;
}) {
    return (
        <div
            className="mb-8 flex items-start gap-5 border-b pb-5"
            style={{ borderColor: COLOR_VERT }}
        >
            <span
                className="flex-shrink-0 text-5xl leading-none font-light"
                style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    color: COLOR_NOIR,
                }}
            >
                {num}
            </span>
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

function BadgeCell({ val }: { val: string }) {
    const isOk = val.startsWith('✓');
    const isNok = val === '✗';
    return (
        <td className="px-4 py-3">
            <span
                className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
                style={{
                    background: isOk
                        ? 'rgba(74,124,89,0.12)'
                        : isNok
                          ? 'rgba(92,61,46,0.07)'
                          : 'rgba(212,168,83,0.12)',
                    color: isOk ? FEUILLE : isNok ? COLOR_NOIR : COLOR_NOIR,
                }}
            >
                {val}
            </span>
        </td>
    );
}

function ListItem({ children }: { children: React.ReactNode }) {
    return (
        <li
            className="flex items-start gap-3 text-sm leading-relaxed font-light"
            style={{ color: COLOR_NOIR }}
        >
            <span
                className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full"
                style={{ background: COLOR_NOIR }}
            />
            {children}
        </li>
    );
}

function OListItem({
    num,
    children,
}: {
    num: number;
    children: React.ReactNode;
}) {
    return (
        <li
            className="flex items-start gap-3 text-sm leading-relaxed font-light"
            style={{ color: COLOR_NOIR }}
        >
            <span
                className="flex-shrink-0 text-xs font-semibold"
                style={{ color: COLOR_NOIR, minWidth: '1.2rem' }}
            >
                {num}.
            </span>
            {children}
        </li>
    );
}

function WarningBox({ children }: { children: React.ReactNode }) {
    return (
        <div
            className="my-5 flex items-start gap-3 rounded-xl p-4"
            style={{
                background: COLOR_BLANC_SALE,
                border: `1px solid rgba(212,168,83,0.25)`,
            }}
        >
            <span className="flex-shrink-0 text-xl">⚠️</span>
            <div
                className="text-sm leading-relaxed font-light"
                style={{ color: COLOR_NOIR }}
            >
                {children}
            </div>
        </div>
    );
}

function HighlightBox({ children }: { children: React.ReactNode }) {
    return (
        <div
            className="my-5 rounded-xl border-l-4 p-4"
            style={{ background: COLOR_BLANC_SALE, borderColor: FEUILLE }}
        >
            <div
                className="text-sm leading-relaxed font-light"
                style={{ color: COLOR_NOIR }}
            >
                {children}
            </div>
        </div>
    );
}

// ─── Page Conditions ──────────────────────────────────────────────────────
export default function Conditions() {
    const { settings } = usePage<PageProps>().props;
    const [activeId, setActiveId] = useState('objet');

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

    const p = (text: string | React.ReactNode) => (
        <p
            className="mb-4 text-sm leading-relaxed font-light"
            style={{ color: COLOR_NOIR }}
        >
            {text}
        </p>
    );

    return (
        <>
            <Head title={`Conditions d'utilisation — ${settings?.app_name}`} />

            <div className="min-h-screen" style={{ background: BLANC }}>
                {/* ── HERO ─────────────────────────────────────── */}
                <header
                    className="relative overflow-hidden px-8 pt-36 pb-24 lg:px-24"
                    style={{
                        background: `linear-gradient(150deg, ${FEUILLE} 0%, #2d5a40 100%)`,
                    }}
                >
                    {/* § décoratif */}
                    <span
                        className="pointer-events-none absolute top-1/2 right-12 -translate-y-1/2 select-none"
                        style={{
                            fontFamily: "'Cormorant Garamond', Georgia, serif",
                            fontSize: '28vw',
                            fontWeight: 300,
                            color: 'rgba(255,255,255,0.04)',
                            lineHeight: 1,
                        }}
                    >
                        §
                    </span>
                    <span
                        className="mb-5 inline-block rounded-full border px-4 py-1 text-xs font-medium tracking-widest uppercase"
                        style={{
                            borderColor: COLOR_VERT,
                            color: BLANC,
                        }}
                    >
                        Document légal
                    </span>
                    <h1
                        className="mb-4 max-w-2xl text-5xl leading-tight font-light text-white"
                        style={{
                            fontFamily: "'Cormorant Garamond', Georgia, serif",
                        }}
                    >
                        Conditions générales{' '}
                        <em style={{ color: COLOR_NOIR }}>d'utilisation</em>
                    </h1>
                    <p
                        className="mb-8 max-w-xl text-base font-light"
                        style={{ color: 'rgba(255,255,255,0.75)' }}
                    >
                        En utilisant {`${settings?.app_name}`}, vous acceptez
                        les présentes conditions. Elles sont rédigées pour être
                        comprises par tous — sans jargon juridique inutile.
                    </p>
                    <div className="flex flex-wrap gap-6">
                        {[
                            ['📅', 'Version en vigueur : 15 janvier 2025'],
                            ['🌍', 'Juridiction : Burkina Faso / RGPD'],
                            ['📖', 'Lecture : ~8 minutes'],
                        ].map(([icon, label]) => (
                            <div
                                key={label}
                                className="flex items-center gap-2 text-sm"
                                style={{ color: 'rgba(255,255,255,0.65)' }}
                            >
                                <span>{icon}</span>
                                {label}
                            </div>
                        ))}
                    </div>
                </header>

                {/* ── RÉSUMÉ ───────────────────────────────────── */}
                <section
                    className="px-8 py-10 lg:px-24"
                    style={{ background: COLOR_BLANC_SALE }}
                >
                    <p
                        className="mb-5 text-lg font-semibold"
                        style={{ color: COLOR_NOIR }}
                    >
                        ⚡ En résumé — Ce qui compte vraiment
                    </p>
                    <div className="grid gap-4 sm:grid-cols-3">
                        {[
                            {
                                titre: '✅ Ce que vous pouvez faire',
                                desc: 'Créer un profil, publier des remèdes, consulter, discuter, prendre des RDV et gérer votre activité.',
                            },
                            {
                                titre: '🚫 Ce qui est interdit',
                                desc: "Fausses informations médicales, usurpation d'identité, harcèlement, spam, revente de données.",
                            },
                            {
                                titre: '🔐 Vos données',
                                desc: 'Elles vous appartiennent. Vous pouvez les exporter ou supprimer à tout moment.',
                            },
                        ].map((s) => (
                            <div
                                key={s.titre}
                                className="rounded-xl p-5"
                                style={{
                                    background: 'rgba(255,255,255,0.35)',
                                    border: `1px solid rgba(255,255,255,0.4)`,
                                }}
                            >
                                <h4
                                    className="mb-2 text-sm font-medium"
                                    style={{ color: COLOR_NOIR }}
                                >
                                    {s.titre}
                                </h4>
                                <p
                                    className="text-xs leading-relaxed"
                                    style={{ color: COLOR_NOIR }}
                                >
                                    {s.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── CORPS ────────────────────────────────────── */}
                <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 lg:grid-cols-[260px_1fr]">
                    {/* Sidebar */}
                    <aside className="hidden lg:block">
                        <div className="sticky top-24">
                            <p
                                className="mb-3 text-xs font-medium tracking-widest uppercase"
                                style={{ color: COLOR_NOIR }}
                            >
                                Articles
                            </p>
                            <nav className="space-y-0.5">
                                {sommaire.map((s) => (
                                    <a
                                        key={s.id}
                                        href={`#${s.id}`}
                                        className="flex items-center gap-3 rounded-lg border-l-2 px-4 py-2 text-sm transition"
                                        style={{
                                            color:
                                                activeId === s.id
                                                    ? BLANC
                                                    : COLOR_NOIR,
                                            background:
                                                activeId === s.id
                                                    ? COLOR_VERT
                                                    : 'transparent',
                                            borderLeftColor:
                                                activeId === s.id
                                                    ? FEUILLE
                                                    : 'transparent',
                                        }}
                                    >
                                        <span
                                            className="text-xs font-semibold"
                                            style={{
                                                color:
                                                    activeId === s.id
                                                        ? BLANC
                                                        : COLOR_NOIR,
                                                minWidth: '1.5rem',
                                            }}
                                        >
                                            {s.num}
                                        </span>
                                        {s.titre}
                                    </a>
                                ))}
                            </nav>
                        </div>
                    </aside>

                    {/* Article */}
                    <article className="space-y-16">
                        {/* Art 1 */}
                        <section
                            data-sec="objet"
                            id="objet"
                            style={{ scrollMarginTop: '6.5rem' }}
                        >
                            <ArtHeader
                                num="01"
                                tag="Préambule"
                                titre="Objet & Acceptation des conditions"
                            />
                            {p(
                                `Les présentes Conditions Générales d'Utilisation (ci-après "CGU") régissent l'accès et 
                                l'utilisation de la plateforme ${settings?.app_name}, éditée par 5G VISION + SARL.`,
                            )}
                            {p(
                                `En créant un compte ou en accédant aux services de ${settings?.app_name}, 
                                vous reconnaissez avoir lu, compris et accepté sans réserve les présentes CGU dans leur intégralité.`,
                            )}
                            <WarningBox>
                                Si vous n'acceptez pas ces conditions, vous ne
                                pouvez pas utiliser {settings?.app_name}. Nous
                                vous invitons à contacter notre équipe si
                                certains points vous semblent flous.
                            </WarningBox>
                            {p(
                                <>
                                    {settings?.app_name} se réserve le droit de
                                    modifier ces CGU à tout moment. Les
                                    utilisateurs seront notifiés de toute
                                    modification substantielle{' '}
                                    <strong
                                        style={{
                                            color: COLOR_VERT,
                                            fontWeight: 500,
                                        }}
                                    >
                                        14 jours avant son entrée en vigueur
                                    </strong>
                                    .
                                </>,
                            )}
                        </section>

                        {/* Art 2 */}
                        <section
                            data-sec="inscription"
                            id="inscription"
                            style={{ scrollMarginTop: '6.5rem' }}
                        >
                            <ArtHeader
                                num="02"
                                tag="Accès à la plateforme"
                                titre="Inscription & Gestion des comptes"
                            />
                            {p(
                                <>
                                    L'inscription sur {settings?.app_name} est{' '}
                                    <strong
                                        style={{
                                            color: COLOR_VERT,
                                            fontWeight: 500,
                                        }}
                                    >
                                        gratuite
                                    </strong>{' '}
                                    pour les comptes patients et tradipraticiens
                                    en version standard.
                                </>,
                            )}
                            {p(
                                <>
                                    <strong
                                        style={{
                                            color: COLOR_VERT,
                                            fontWeight: 500,
                                        }}
                                    >
                                        Conditions d'inscription :
                                    </strong>
                                </>,
                            )}
                            <ul className="mb-4 space-y-2">
                                {[
                                    'Être âgé de 18 ans minimum',
                                    'Fournir des informations exactes, complètes et actualisées',
                                    "Disposer d'une adresse email valide",
                                    'Créer un mot de passe sécurisé (minimum 8 caractères)',
                                    'Valider votre compte via le lien envoyé par email',
                                ].map((item) => (
                                    <ListItem key={item}>{item}</ListItem>
                                ))}
                            </ul>
                            {p(
                                'Vous êtes seul responsable de la confidentialité de vos identifiants. En cas de compromission de votre compte, contactez immédiatement notre support.',
                            )}
                        </section>

                        {/* Art 3 */}
                        <section
                            data-sec="roles"
                            id="roles"
                            style={{ scrollMarginTop: '6.5rem' }}
                        >
                            <ArtHeader
                                num="03"
                                tag="Système de rôles"
                                titre="Rôles, permissions & accès"
                            />
                            {p(
                                `${settings?.app_name} fonctionne avec un système multi-rôles. 
                                Chaque rôle dispose de droits et responsabilités spécifiques :`,
                            )}
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
                                                'Fonctionnalité',
                                                'Patient',
                                                'Tradipraticien',
                                                'Modérateur',
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
                                        {rolesData.map((row, i) => (
                                            <tr
                                                key={i}
                                                style={{
                                                    borderBottom: `1px solid rgba(212,168,83,0.1)`,
                                                }}
                                            >
                                                <td
                                                    className="px-4 py-3 text-sm"
                                                    style={{
                                                        color: COLOR_NOIR,
                                                    }}
                                                >
                                                    {row.feature}
                                                </td>
                                                <BadgeCell val={row.patient} />
                                                <BadgeCell
                                                    val={row.praticien}
                                                />
                                                <BadgeCell val={row.modo} />
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <p
                                className="mt-4 text-sm font-light"
                                style={{ color: COLOR_NOIR }}
                            >
                                Le changement de rôle nécessite la soumission de
                                justificatifs et une validation manuelle par
                                l'équipe {settings?.app_name}.
                            </p>
                        </section>

                        {/* Art 4 */}
                        <section
                            data-sec="contenus"
                            id="contenus"
                            style={{ scrollMarginTop: '6.5rem' }}
                        >
                            <ArtHeader
                                num="04"
                                tag="Charte éditoriale"
                                titre="Règles de publication & contenus"
                            />
                            {p(
                                `${settings?.app_name} est un espace de partage professionnel et bienveillant. En publiant du contenu, vous vous engagez à respecter les règles suivantes :`,
                            )}
                            {p(
                                <strong
                                    style={{
                                        color: COLOR_VERT,
                                        fontWeight: 500,
                                    }}
                                >
                                    Contenus autorisés :
                                </strong>,
                            )}
                            <ul className="mb-6 space-y-2">
                                {contenuPermis.map((item) => (
                                    <ListItem key={item}>{item}</ListItem>
                                ))}
                            </ul>
                            {p(
                                <strong
                                    style={{
                                        color: COLOR_VERT,
                                        fontWeight: 500,
                                    }}
                                >
                                    Contenus strictement interdits :
                                </strong>,
                            )}
                            <div className="grid gap-2 sm:grid-cols-2">
                                {contenuInterdit.map((c) => (
                                    <div
                                        key={c.text}
                                        className="flex items-start gap-2 rounded-lg border-l-2 p-3 text-xs font-light"
                                        style={{
                                            background: 'rgba(92,61,46,0.04)',
                                            borderColor: 'rgba(92,61,46,0.2)',
                                            color: COLOR_NOIR,
                                        }}
                                    >
                                        <span className="flex-shrink-0">
                                            {c.icon}
                                        </span>
                                        {c.text}
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Art 5 */}
                        <section
                            data-sec="sante"
                            id="sante"
                            style={{ scrollMarginTop: '6.5rem' }}
                        >
                            <ArtHeader
                                num="05"
                                tag="Important"
                                titre="Avertissement médical & limites"
                            />
                            <WarningBox>
                                <strong
                                    style={{
                                        color: COLOR_VERT,
                                        fontWeight: 500,
                                    }}
                                >
                                    {settings?.app_name} n'est pas un service
                                    médical.
                                </strong>{' '}
                                Les informations publiées sont à but informatif
                                et documentaire. Elles ne remplacent en aucun
                                cas un diagnostic médical ou un traitement
                                prescrit par un professionnel de santé
                                conventionnel.
                            </WarningBox>
                            {p(
                                `En utilisant ${settings?.app_name}, vous acceptez que :`,
                            )}
                            <ul className="mb-5 space-y-2">
                                {[
                                    'Les informations partagées sont issues de savoirs traditionnels et ne constituent pas des avis médicaux certifiés',
                                    'Vous consultez en parallèle un professionnel de santé conventionnel pour tout problème grave de santé',
                                    `${settings?.app_name} ne peut être tenu responsable des effets d'un remède traditionnel appliqué sans précaution`,
                                ].map((item) => (
                                    <ListItem key={item}>{item}</ListItem>
                                ))}
                            </ul>
                            <HighlightBox>
                                En cas d'urgence médicale,{' '}
                                <strong
                                    style={{
                                        color: COLOR_VERT,
                                        fontWeight: 500,
                                    }}
                                >
                                    appelez immédiatement les secours
                                </strong>
                                . {settings?.app_name} ne doit pas être utilisé
                                comme outil de gestion de situations médicales
                                urgentes.
                            </HighlightBox>
                        </section>

                        {/* Art 6 */}
                        <section
                            data-sec="rdv"
                            id="rdv"
                            style={{ scrollMarginTop: '6.5rem' }}
                        >
                            <ArtHeader
                                num="06"
                                tag="Services"
                                titre="Consultations, rendez-vous & paiements"
                            />
                            {p(
                                <>
                                    Le système de rendez-vous met en relation
                                    patients et tradipraticiens.
                                    {settings?.app_name}
                                    joue le rôle d'
                                    <strong
                                        style={{
                                            color: COLOR_VERT,
                                            fontWeight: 500,
                                        }}
                                    >
                                        intermédiaire technique
                                    </strong>{' '}
                                    et n'est pas partie au contrat de soin entre
                                    les deux parties.
                                </>,
                            )}
                            {p(
                                <strong
                                    style={{
                                        color: COLOR_VERT,
                                        fontWeight: 500,
                                    }}
                                >
                                    Politique d'annulation :
                                </strong>,
                            )}
                            <ol className="mb-5 space-y-2">
                                {[
                                    'Annulation plus de 24h avant : remboursement intégral si paiement en ligne',
                                    'Annulation entre 2h et 24h : remboursement à 50%',
                                    'Annulation moins de 2h ou absence : aucun remboursement',
                                    'Annulation par le praticien : remboursement intégral immédiat',
                                ].map((item, i) => (
                                    <OListItem key={i} num={i + 1}>
                                        {item}
                                    </OListItem>
                                ))}
                            </ol>
                            {p(
                                `Les sessions de visioconférence sont chiffrées et non enregistrées par ${settings?.app_name}. 
                                La qualité de la connexion réseau est sous la responsabilité de chaque partie.`,
                            )}
                        </section>

                        {/* Art 7 */}
                        <section
                            data-sec="moderation"
                            id="moderation"
                            style={{ scrollMarginTop: '6.5rem' }}
                        >
                            <ArtHeader
                                num="07"
                                tag="Gouvernance"
                                titre="Système de modération"
                            />
                            {p(
                                `${settings?.app_name} s'appuie sur une combinaison de modération automatique et de 
                                modération humaine pour maintenir la qualité et la sécurité des contenus.`,
                            )}
                            {p(
                                <strong
                                    style={{
                                        color: COLOR_VERT,
                                        fontWeight: 500,
                                    }}
                                >
                                    Processus de modération :
                                </strong>,
                            )}
                            <ul className="mb-5 space-y-2">
                                {[
                                    'Tout contenu publié est soumis à une analyse automatique avant parution',
                                    'Les contenus signalés par des utilisateurs sont examinés sous 24 heures',
                                    "Les décisions de modération peuvent être contestées via le formulaire d'appel",
                                    'En cas de violation grave, le compte peut être suspendu immédiatement',
                                ].map((item) => (
                                    <ListItem key={item}>{item}</ListItem>
                                ))}
                            </ul>
                            {p(
                                <strong
                                    style={{
                                        color: COLOR_VERT,
                                        fontWeight: 500,
                                    }}
                                >
                                    Système de sanctions progressif :
                                </strong>,
                            )}
                            <ol className="space-y-2">
                                {[
                                    '1ère infraction mineure : avertissement et suppression du contenu',
                                    '2ème infraction : restriction temporaire (7 jours)',
                                    '3ème infraction ou infraction grave : suspension permanente',
                                ].map((item, i) => (
                                    <OListItem key={i} num={i + 1}>
                                        {item}
                                    </OListItem>
                                ))}
                            </ol>
                        </section>

                        {/* Art 8 */}
                        <section
                            data-sec="pi"
                            id="pi"
                            style={{ scrollMarginTop: '6.5rem' }}
                        >
                            <ArtHeader
                                num="08"
                                tag="Droits d'auteur"
                                titre="Propriété intellectuelle"
                            />
                            {p(
                                <>
                                    <strong
                                        style={{
                                            color: COLOR_VERT,
                                            fontWeight: 500,
                                        }}
                                    >
                                        Vos contenus vous appartiennent.
                                    </strong>{' '}
                                    En publiant du contenu sur
                                    {settings?.app_name}, vous conservez
                                    l'intégralité de vos droits. Vous accordez à{' '}
                                    {settings?.app_name} une licence non
                                    exclusive, mondiale et révocable pour
                                    afficher et indexer vos contenus sur la
                                    plateforme.
                                </>,
                            )}
                            {p(
                                `Le nom ${settings?.app_name}, son logo, son design et ses fonctionnalités sont protégés par le droit de la propriété intellectuelle et ne peuvent être reproduits sans autorisation écrite préalable.`,
                            )}
                            {p(
                                `${settings?.app_name} reconnaît la valeur culturelle et patrimoniale des savoirs médicaux traditionnels et encourage les praticiens à indiquer l'origine communautaire de leurs pratiques.`,
                            )}
                        </section>

                        {/* Art 9 */}
                        <section
                            data-sec="responsabilite"
                            id="responsabilite"
                            style={{ scrollMarginTop: '6.5rem' }}
                        >
                            <ArtHeader
                                num="09"
                                tag="Limites"
                                titre="Responsabilité & garanties"
                            />
                            {p(
                                `${settings?.app_name} s'efforce de maintenir la plateforme disponible 24h/24, 7j/7, 
                                mais ne peut garantir une disponibilité sans interruption.`,
                            )}
                            {p(
                                <strong
                                    style={{
                                        color: COLOR_VERT,
                                        fontWeight: 500,
                                    }}
                                >
                                    {settings?.app_name} n'est pas responsable :
                                </strong>,
                            )}
                            <ul className="space-y-2">
                                {[
                                    'Des contenus publiés par les utilisateurs',
                                    "Des conséquences de l'application de remèdes partagés sur la plateforme",
                                    "Des litiges entre un tradipraticien et un patient issus d'une consultation",
                                    "Des pertes de données résultant d'une cause extérieure (piratage, force majeure)",
                                ].map((item) => (
                                    <ListItem key={item}>{item}</ListItem>
                                ))}
                            </ul>
                        </section>

                        {/* Art 10 */}
                        <section
                            data-sec="resiliation"
                            id="resiliation"
                            style={{ scrollMarginTop: '6.5rem' }}
                        >
                            <ArtHeader
                                num="10"
                                tag="Fin du service"
                                titre="Résiliation du compte"
                            />
                            {p(
                                <>
                                    <strong
                                        style={{
                                            color: COLOR_VERT,
                                            fontWeight: 500,
                                        }}
                                    >
                                        Résiliation par l'utilisateur :
                                    </strong>{' '}
                                    vous pouvez fermer votre compte à tout
                                    moment depuis Paramètres → Compte →
                                    Supprimer mon compte. Vos données seront
                                    effacées sous 30 jours.
                                </>,
                            )}
                            {p(
                                <strong
                                    style={{
                                        color: COLOR_VERT,
                                        fontWeight: 500,
                                    }}
                                >
                                    Résiliation par {settings?.app_name} :
                                </strong>,
                            )}
                            <ul className="space-y-2">
                                {[
                                    'Violation grave ou répétée des présentes CGU',
                                    "Comportement frauduleux, usurpation d'identité ou activité illégale",
                                    "Publication de contenus mettant en danger la santé d'autrui",
                                    'Inactivité de plus de 24 mois consécutifs (avec préavis de 30 jours)',
                                ].map((item) => (
                                    <ListItem key={item}>{item}</ListItem>
                                ))}
                            </ul>
                        </section>

                        {/* Art 11 */}
                        <section
                            data-sec="droit"
                            id="droit"
                            style={{ scrollMarginTop: '6.5rem' }}
                        >
                            <ArtHeader
                                num="11"
                                tag="Cadre légal"
                                titre="Droit applicable & litiges"
                            />
                            {p(
                                `Les présentes CGU sont régies par le droit burkinabè et, 
                                pour les utilisateurs, par le droit de l'Union Européenne applicable (notamment le RGPD).`,
                            )}
                            {p(
                                <>
                                    En cas de litige, les parties s'engagent à
                                    rechercher une solution amiable dans un
                                    délai de{' '}
                                    <strong
                                        style={{
                                            color: COLOR_VERT,
                                            fontWeight: 500,
                                        }}
                                    >
                                        30 jours
                                    </strong>{' '}
                                    avant tout recours judiciaire. En cas
                                    d'échec, le litige sera soumis aux tribunaux
                                    compétents de Ouagadougou.
                                </>,
                            )}
                            <HighlightBox>
                                Pour tout litige relatif aux données
                                personnelles, vous pouvez également saisir
                                l'autorité de protection des données compétente
                                dans votre pays de résidence.
                            </HighlightBox>
                        </section>

                        {/* Art 12 */}
                        <section
                            data-sec="contact-legal"
                            id="contact-legal"
                            style={{ scrollMarginTop: '6.5rem' }}
                        >
                            <ArtHeader
                                num="12"
                                tag="Nous contacter"
                                titre="Contact légal"
                            />
                            {p(
                                'Pour toute question relative aux présentes CGU ou pour exercer vos droits :',
                            )}
                            <div
                                className="rounded-2xl p-6"
                                style={{
                                    background: COLOR_BLANC_SALE,
                                    border: `1px solid rgba(212,168,83,0.2)`,
                                }}
                            >
                                <h5
                                    className="mb-5 text-lg font-semibold"
                                    style={{
                                        fontFamily:
                                            "'Cormorant Garamond', Georgia, serif",
                                        color: COLOR_NOIR,
                                    }}
                                >
                                    {settings?.app_name} SAS — Service juridique
                                </h5>
                                {[
                                    {
                                        icon: '📧',
                                        label: 'Légal :',
                                        val: `legal@${settings?.app_domain}`,
                                        href: `mailto:legal@${settings?.app_domain}`,
                                    },
                                    {
                                        icon: '🛡️',
                                        label: 'DPO :',
                                        val: `dpo@${settings?.app_domain}`,
                                        href: `mailto:dpo@${settings?.app_domain}`,
                                    },
                                    {
                                        icon: '📮',
                                        label: 'Adresse :',
                                        val: `${settings?.app_address}`,
                                        href: null,
                                    },
                                    {
                                        icon: '⏱️',
                                        label: 'Délai de réponse :',
                                        val: '30 jours ouvrés garantis',
                                        href: null,
                                    },
                                ].map((c, i) => (
                                    <div
                                        key={i}
                                        className="mb-3 flex items-start gap-2 text-sm"
                                        style={{ color: COLOR_NOIR }}
                                    >
                                        <span className="flex-shrink-0">
                                            {c.icon}
                                        </span>
                                        <span
                                            className="mr-1 font-medium"
                                            style={{ color: COLOR_NOIR }}
                                        >
                                            {c.label}
                                        </span>
                                        {c.href ? (
                                            <a
                                                href={c.href}
                                                className="font-medium"
                                                style={{ color: COLOR_VERT }}
                                            >
                                                {c.val}
                                            </a>
                                        ) : (
                                            <span>{c.val}</span>
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
