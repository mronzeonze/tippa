import {
    BLANC,
    COLOR_BLANC_SALE,
    COLOR_NOIR,
    COLOR_VERT,
} from '@/components/assets/assets';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';
import {
    BookOpen,
    Calendar,
    MessageCircle,
    Search,
    UserCircle,
} from 'lucide-react';
import { useState } from 'react';


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
// ─── Données FAQ ──────────────────────────────────────────────────────────
const faqData = [
    {
        id: 'compte',
        label: 'Mon compte',
        icon: <UserCircle className="h-5 w-5" />,
        items: [
            {
                q: 'Comment créer un compte sur TradiBridge ?',
                a: "Rendez-vous sur la page d'inscription et choisissez votre type de compte : tradipraticien, patient ou modérateur. Renseignez votre email, un mot de passe sécurisé, puis validez votre adresse via le lien reçu par email. Votre compte est actif immédiatement après validation.",
            },
            {
                q: 'Quelle est la différence entre les rôles praticien, patient et modérateur ?',
                a: 'Tradipraticien : accès complet — profil professionnel, publications, consultations, tableau de bord analytique, géolocalisation. Patient : rechercher des praticiens, lire les publications, prendre des rendez-vous, laisser des témoignages. Modérateur : valider et superviser les contenus publiés selon la charte TradiBridge.',
            },
            {
                q: 'Comment réinitialiser mon mot de passe ?',
                a: 'Sur la page de connexion, cliquez sur "Mot de passe oublié". Entrez votre email et vous recevrez un lien de réinitialisation valable 60 minutes. Si vous avez activé la 2FA, vous devrez également valider via votre application d\'authentification.',
            },
            {
                q: 'Puis-je supprimer mon compte ?',
                a: 'Oui. Rendez-vous dans Paramètres → Compte → Supprimer mon compte. Vos données personnelles seront effacées sous 30 jours conformément au RGPD.',
            },
        ],
    },
    {
        id: 'profil',
        label: 'Profil praticien',
        icon: <BookOpen className="h-5 w-5" />,
        items: [
            {
                q: 'Quelles informations puis-je renseigner dans mon profil ?',
                a: "Votre fiche comprend : spécialités (phytothérapie, tradithérapie…), région et zone géographique, années d'expérience, langues parlées, photo de profil, biographie, horaires de disponibilité et mode de consultation (présentiel / téléconsultation).",
            },
            {
                q: 'Comment obtenir le badge "Praticien vérifié" ?',
                a: "Soumettez vos justificatifs dans Paramètres → Vérification. Un modérateur examine votre dossier sous 3 à 5 jours ouvrés. Les documents acceptés incluent : attestation d'une association reconnue, acte communautaire, ou recommandation d'autorités sanitaires locales.",
            },
        ],
    },
    {
        id: 'publications',
        label: 'Publications',
        icon: <BookOpen className="h-5 w-5" />,
        items: [
            {
                q: 'Comment publier un remède ou un article ?',
                a: 'Dans votre fil d\'actualité, cliquez sur "Nouvelle publication". Vous pouvez rédiger un article, décrire un remède, ajouter des photos ou vidéos, et choisir une visibilité : publique, praticiens uniquement, ou privée.',
            },
            {
                q: 'Comment signaler un contenu inapproprié ?',
                a: 'Cliquez sur les trois points (⋯) de n\'importe quelle publication puis sur "Signaler". L\'équipe de modération examine chaque signalement sous 24h.',
            },
        ],
    },
    {
        id: 'consultations',
        label: 'Consultations',
        icon: <Calendar className="h-5 w-5" />,
        items: [
            {
                q: 'Comment prendre rendez-vous avec un tradipraticien ?',
                a: 'Sur le profil du praticien, cliquez sur "Prendre rendez-vous". Sélectionnez une date disponible, le type de consultation (présentiel ou visio), et confirmez. Vous recevrez une confirmation par email et une notification.',
            },
            {
                q: 'Comment fonctionne la téléconsultation ?',
                a: "À l'heure du rendez-vous, un lien de visioconférence sécurisé est envoyé aux deux parties. La session est chiffrée de bout en bout et n'est pas enregistrée par TradiBridge.",
            },
        ],
    },
    {
        id: 'messages',
        label: 'Messagerie',
        icon: <MessageCircle className="h-5 w-5" />,
        items: [
            {
                q: 'Mes messages sont-ils privés et sécurisés ?',
                a: "Oui. Tous les messages échangés sont chiffrés en transit (TLS) et au repos. Seuls vous et votre interlocuteur pouvez lire vos échanges. TradiBridge n'a pas accès au contenu de vos conversations.",
            },
            {
                q: 'Comment activer les notifications push ?',
                a: "Sur l'application mobile, allez dans Paramètres → Notifications. Vous pouvez activer séparément les notifications pour les messages, les rendez-vous, les likes/commentaires.",
            },
        ],
    },
];

const categories = [
    {
        label: 'Mon compte',
        icon: '👤',
        id: 'compte',
        sub: 'Inscription, profil, sécurité',
    },
    {
        label: 'Publications',
        icon: '🌿',
        id: 'publications',
        sub: 'Remèdes, articles, partages',
    },
    {
        label: 'Consultations',
        icon: '📅',
        id: 'consultations',
        sub: 'RDV, visio, paiements',
    },
    {
        label: 'Messagerie',
        icon: '💬',
        id: 'messages',
        sub: 'Chat sécurisé, notifications',
    },
];

const guides = [
    {
        icon: '🌿',
        titre: 'Créer votre fiche praticien',
        desc: 'Un guide complet pour construire un profil attractif en 10 minutes.',
    },
    {
        icon: '📸',
        titre: 'Publier votre premier remède',
        desc: "Structure, photos, avertissements — tout ce qu'il faut pour une publication de qualité.",
    },
    {
        icon: '📱',
        titre: 'Gérer ses rendez-vous',
        desc: 'Disponibilités, notifications, et gestion des téléconsultations.',
    },
];

// ─── Accordéon FAQ ────────────────────────────────────────────────────────
function FaqItem({ q, a }: { q: string; a: string }) {
    const [open, setOpen] = useState(false);

    return (
        <div
            className="overflow-hidden rounded-xl transition duration-200 hover:shadow-md"
            style={{
                border: `1px solid rgba(212,168,83,0.2)`,
                background: BLANC,
            }}
        >
            <button
                onClick={() => setOpen(!open)}
                className="flex w-full items-center justify-between px-6 py-4 text-left text-sm font-medium transition"
                style={{
                    color: COLOR_NOIR,
                    background: open ? COLOR_BLANC_SALE : 'transparent',
                }}
            >
                {q}
                <span
                    className="ml-4 flex-shrink-0 text-lg transition-transform duration-300"
                    style={{
                        color: COLOR_NOIR,
                        transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
                    }}
                >
                    +
                </span>
            </button>
            <div
                className="overflow-hidden text-sm leading-relaxed font-light transition-all duration-300"
                style={{
                    maxHeight: open ? '300px' : '0',
                    padding: open ? '0 1.5rem 1.25rem' : '0 1.5rem',
                    color: COLOR_NOIR,
                }}
            >
                {a}
            </div>
        </div>
    );
}

// ─── Page Aide ────────────────────────────────────────────────────────────
export default function Aide() {
    const { settings } = usePage<PageProps>().props;
    const [search, setSearch] = useState('');
    const [activeGroup, setActiveGroup] = useState('compte');

    const filtered = search.trim()
        ? faqData
              .map((g) => ({
                  ...g,
                  items: g.items.filter(
                      (i) =>
                          i.q.toLowerCase().includes(search.toLowerCase()) ||
                          i.a.toLowerCase().includes(search.toLowerCase()),
                  ),
              }))
              .filter((g) => g.items.length > 0)
        : faqData;

    const handleSearch = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            /* handled by live filter */
        }
    };

    return (
        <        >
            <Head title={`Centre d'aide — ${settings?.app_name}`} />
            <div className="min-h-screen" style={{ background: BLANC }}>
                {/* <Navbar /> */}

                {/* ── HERO ─────────────────────────────────────── */}
                <section
                    className="px-8 pt-36 pb-20 text-center"
                    style={{
                        background: `linear-gradient(150deg, ${COLOR_BLANC_SALE} 60%, rgba(74,124,89,0.12))`,
                    }}
                >
                    <span
                        className="mb-5 inline-block rounded-full border px-4 py-1 text-xs font-medium tracking-widest uppercase"
                        style={{ borderColor: COLOR_NOIR, color: COLOR_VERT }}
                    >
                        Centre d'aide
                    </span>
                    <h1
                        className="mx-auto mb-5 text-5xl leading-tight font-light"
                        style={{
                            fontFamily: "'Cormorant Garamond', Georgia, serif",
                            color: COLOR_NOIR,
                            maxWidth: '16ch',
                        }}
                    >
                        Comment pouvons-nous vous{' '}
                        <em style={{ color: COLOR_VERT }}>aider</em> ?
                    </h1>
                    <p
                        className="mx-auto mb-10 max-w-lg text-lg leading-relaxed font-light"
                        style={{ color: COLOR_NOIR }}
                    >
                        Trouvez des réponses à vos questions sur TradiBridge —
                        utilisation de la plateforme, profils, consultations et
                        bien plus.
                    </p>

                    {/* Barre de recherche */}
                    <div className="relative mx-auto max-w-xl">
                        <Search
                            className="absolute top-1/2 left-5 h-5 w-5 -translate-y-1/2"
                            style={{ color: COLOR_NOIR }}
                        />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={handleSearch}
                            placeholder="Rechercher une question, un thème…"
                            className="w-full rounded-full py-4 pr-6 pl-14 text-sm shadow-lg transition outline-none focus:shadow-xl"
                            style={{
                                background: BLANC,
                                border: `1.5px solid rgba(212,168,83,0.4)`,
                                color: COLOR_NOIR,
                                fontFamily: 'inherit',
                            }}
                        />
                    </div>
                </section>

                {/* ── CATÉGORIES ───────────────────────────────── */}
                <section className="px-8 py-12 lg:px-24">
                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                        {categories.map((c) => (
                            <a
                                key={c.id}
                                href={`#${c.id}`}
                                onClick={() => setActiveGroup(c.id)}
                                className="block rounded-2xl p-6 text-center transition duration-200 hover:-translate-y-1 hover:shadow-xl"
                                style={{
                                    background: BLANC,
                                    border: `1px solid ${COLOR_VERT}`,
                                }}
                            >
                                <span className="mb-3 block text-3xl">
                                    {c.icon}
                                </span>
                                <h3
                                    className="text-base font-semibold"
                                    style={{
                                        fontFamily:
                                            "'Cormorant Garamond', Georgia, serif",
                                        color: COLOR_NOIR,
                                    }}
                                >
                                    {c.label}
                                </h3>
                                <span
                                    className="mt-1 block text-base"
                                    style={{ color: COLOR_VERT }}
                                >
                                    {c.sub}
                                </span>
                            </a>
                        ))}
                    </div>
                </section>

                {/* ── FAQ ──────────────────────────────────────── */}
                <section className="px-8 pb-24 lg:px-24">
                    <span
                        className="mb-4 inline-block rounded-full border px-4 py-1 text-xs font-medium tracking-widest uppercase"
                        style={{ borderColor: COLOR_NOIR, color: COLOR_VERT }}
                    >
                        Questions fréquentes
                    </span>
                    <h2
                        className="mb-12 text-4xl font-light"
                        style={{
                            fontFamily: "'Cormorant Garamond', Georgia, serif",
                            color: COLOR_NOIR,
                        }}
                    >
                        Tout ce que vous{' '}
                        <em style={{ color: COLOR_VERT }}>devez savoir</em>
                    </h2>

                    <div className="grid gap-12 lg:grid-cols-[240px_1fr]">
                        {/* Nav latérale */}
                        <aside className="hidden lg:block">
                            <p
                                className="mb-3 text-xs font-medium tracking-widest uppercase"
                                style={{ color: COLOR_NOIR }}
                            >
                                Sections
                            </p>
                            <nav className="space-y-1">
                                {faqData.map((g) => (
                                    <a
                                        key={g.id}
                                        href={`#${g.id}`}
                                        className="flex items-center gap-3 rounded-lg border-l-2 px-4 py-2 text-sm transition"
                                        style={{
                                            color:
                                                activeGroup === g.id
                                                    ? BLANC
                                                    : COLOR_NOIR,
                                            background:
                                                activeGroup === g.id
                                                    ? COLOR_VERT
                                                    : 'transparent',
                                            borderLeftColor:
                                                activeGroup === g.id
                                                    ? COLOR_BLANC_SALE
                                                    : 'transparent',
                                        }}
                                        onClick={() => setActiveGroup(g.id)}
                                    >
                                        {g.label}
                                    </a>
                                ))}
                            </nav>
                        </aside>

                        {/* Contenu FAQ */}
                        <div className="space-y-12">
                            {filtered.length === 0 ? (
                                <p
                                    className="text-lg"
                                    style={{ color: COLOR_NOIR }}
                                >
                                    Aucun résultat pour « {search} »
                                </p>
                            ) : (
                                filtered.map((g) => (
                                    <div key={g.id} id={g.id}>
                                        <h3
                                            className="mb-4 flex items-center gap-2 border-b pb-3 text-2xl font-light"
                                            style={{
                                                fontFamily:
                                                    "'Cormorant Garamond', Georgia, serif",
                                                color: COLOR_NOIR,
                                                borderColor: `${COLOR_BLANC_SALE}`,
                                            }}
                                        >
                                            {g.icon} {g.label}
                                        </h3>
                                        <div className="space-y-3">
                                            {g.items.map((item, i) => (
                                                <FaqItem
                                                    key={i}
                                                    q={item.q}
                                                    a={item.a}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </section>

                {/* ── GUIDES ───────────────────────────────────── */}
                <section
                    className="px-8 py-24 lg:px-24"
                    style={{ background: COLOR_BLANC_SALE }}
                >
                    <span
                        className="mb-4 inline-block rounded-full border px-4 py-1 text-xs font-medium tracking-widest uppercase"
                        style={{ borderColor: COLOR_NOIR, color: COLOR_VERT }}
                    >
                        Guides pas-à-pas
                    </span>
                    <h2
                        className="mb-10 text-4xl font-light"
                        style={{
                            fontFamily: "'Cormorant Garamond', Georgia, serif",
                            color: COLOR_NOIR,
                        }}
                    >
                        Premiers pas sur{' '}
                        <em
                            style={{ color: COLOR_VERT }}
                        >{`${settings?.app_name}`}</em>
                    </h2>
                    <div className="grid gap-6 lg:grid-cols-3">
                        {guides.map((g) => (
                            <a
                                key={g.titre}
                                href="#"
                                className="block overflow-hidden rounded-2xl transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
                                style={{
                                    background: BLANC,
                                    border: `1px solid rgba(212,168,83,0.15)`,
                                }}
                            >
                                <div
                                    className="flex h-36 items-center justify-center text-5xl"
                                    style={{
                                        background: `linear-gradient(135deg, ${COLOR_VERT}, #2d5a40)`,
                                    }}
                                >
                                    {g.icon}
                                </div>
                                <div className="p-6">
                                    <h4
                                        className="mb-2 text-xl font-semibold"
                                        style={{
                                            fontFamily:
                                                "'Cormorant Garamond', Georgia, serif",
                                            color: COLOR_NOIR,
                                        }}
                                    >
                                        {g.titre}
                                    </h4>
                                    <p
                                        className="mb-3 text-sm leading-relaxed font-light"
                                        style={{ color: COLOR_VERT }}
                                    >
                                        {g.desc}
                                    </p>
                                    <span
                                        className="text-xs font-medium"
                                        style={{ color: COLOR_NOIR }}
                                    >
                                        Lire le guide →
                                    </span>
                                </div>
                            </a>
                        ))}
                    </div>
                </section>

                {/* ── CONTACT ──────────────────────────────────── */}
                <section className="px-8 py-24 lg:px-24">
                    <span
                        className="mb-4 inline-block rounded-full border px-4 py-1 text-xs font-medium tracking-widest uppercase"
                        style={{ borderColor: COLOR_NOIR, color: COLOR_VERT }}
                    >
                        Besoin d'aide ?
                    </span>
                    <h2
                        className="mb-10 text-4xl font-light"
                        style={{
                            fontFamily: "'Cormorant Garamond', Georgia, serif",
                            color: COLOR_NOIR,
                        }}
                    >
                        Contactez notre{' '}
                        <em style={{ color: COLOR_VERT }}>équipe</em>
                    </h2>
                    <div className="grid gap-6 lg:grid-cols-3">
                        {[
                            {
                                icon: '💬',
                                titre: 'Chat en direct',
                                desc: 'Disponible 24H/24. Temps de réponse moyen : 5 minutes.',
                                cta: 'Ouvrir le chat',
                                href: '#',
                            },
                            {
                                icon: '✉️',
                                titre: 'Email support',
                                desc: 'Pour les demandes complexes. Nous répondons sous 24h ouvrées.',
                                cta: `${settings?.contact_email} `,
                                href: 'mailto:aide@tradibridge.com',
                            },
                            {
                                icon: '🌍',
                                titre: 'Communauté',
                                desc: "Rejoignez notre forum praticiens pour partager et s'entraider.",
                                cta: 'Accéder au forum',
                                href: '#',
                            },
                        ].map((c) => (
                            <div
                                key={c.titre}
                                className="rounded-2xl p-8 text-center transition duration-200 hover:shadow-md"
                                style={{
                                    border: `1px solid ${COLOR_NOIR}`,
                                }}
                            >
                                <span className="mb-4 block text-4xl">
                                    {c.icon}
                                </span>
                                <h4
                                    className="mb-2 text-xl font-semibold"
                                    style={{
                                        fontFamily:
                                            "'Cormorant Garamond', Georgia, serif",
                                        color: COLOR_NOIR,
                                    }}
                                >
                                    {c.titre}
                                </h4>
                                <p
                                    className="mb-5 text-sm leading-relaxed font-light"
                                    style={{ color: COLOR_NOIR }}
                                >
                                    {c.desc}
                                </p>
                                <a
                                    href={c.href}
                                    className="inline-block rounded-full px-6 py-2 text-sm font-medium transition hover:opacity-90"
                                    style={{
                                        background: COLOR_VERT,
                                        color: BLANC,
                                    }}
                                >
                                    {c.cta}
                                </a>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </>
    );
}
