import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────────────────────

interface Sponsor {
    id: string;
    title: string;
    description: string;
    image_url: string;
    link_url: string;
    cta_label: string;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Constantes
// ─────────────────────────────────────────────────────────────────────────────

/** Intervalle de défilement automatique en ms */
const SLIDE_INTERVAL_MS = 20_000; // 20 secondes

/** Endpoint Laravel – GET /sponsors/active */
const SPONSORS_ENDPOINT = '/sponsors/active';

// ─────────────────────────────────────────────────────────────────────────────
//  Hook : useSponsors
//  Récupère les sponsors actifs depuis l'API et les met en cache.
// ─────────────────────────────────────────────────────────────────────────────

function useSponsors() {
    const [sponsors, setSponsors] = useState<Sponsor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        const fetchSponsors = async () => {
            try {
                const res = await fetch(SPONSORS_ENDPOINT, {
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    credentials: 'same-origin',
                });

                if (!res.ok) throw new Error(`HTTP ${res.status}`);

                const json: { data: Sponsor[] } = await res.json();

                if (!cancelled) {
                    setSponsors(json.data);
                }
            } catch (err) {
                if (!cancelled) {
                    setError('Impossible de charger les sponsors.');
                    console.warn('[SponsorWidget] fetch error:', err);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchSponsors();
        return () => {
            cancelled = true;
        };
    }, []);

    return { sponsors, loading, error };
}

// ─────────────────────────────────────────────────────────────────────────────
//  Helpers : tracking silencieux (fire-and-forget)
// ─────────────────────────────────────────────────────────────────────────────

function trackImpression(sponsorId: string): void {
    fetch(`/sponsors/${sponsorId}/view`, {
        method: 'POST',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN':
                document.querySelector<HTMLMetaElement>(
                    'meta[name="csrf-token"]',
                )?.content ?? '',
        },
        credentials: 'same-origin',
    }).catch(() => {
        /* silencieux */
    });
}

function trackClick(sponsorId: string): void {
    fetch(`/sponsors/${sponsorId}/click`, {
        method: 'POST',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN':
                document.querySelector<HTMLMetaElement>(
                    'meta[name="csrf-token"]',
                )?.content ?? '',
        },
        credentials: 'same-origin',
    }).catch(() => {
        /* silencieux */
    });
}

// ─────────────────────────────────────────────────────────────────────────────
//  Composant : SponsorSlide  (un seul sponsor)
// ─────────────────────────────────────────────────────────────────────────────

interface SponsorSlideProps {
    sponsor: Sponsor;
}

function SponsorSlide({ sponsor }: SponsorSlideProps) {
    const handleCta = () => {
        trackClick(sponsor.id);
        window.open(sponsor.link_url, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="flex h-full w-full flex-shrink-0 flex-col">
            {/* Image – hauteur fixe pour conserver les dimensions de la section */}
            <img
                src={sponsor.image_url}
                alt={sponsor.title}
                className="mt-2 h-40 w-full rounded-lg object-cover"
                loading="lazy"
                onError={(e) => {
                    // Fallback si l'image est introuvable
                    e.currentTarget.style.display = 'none';
                }}
            />

            {/* Titre */}
            <p className="mt-2 line-clamp-1 font-medium text-slate-700">
                {sponsor.title}
            </p>

            {/* Description */}
            <p className="mt-1 line-clamp-2 flex-1 text-slate-600">
                {sponsor.description}
            </p>

            {/* Bouton CTA */}
            <button
                onClick={handleCta}
                className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg bg-emerald-600 py-2 text-xs font-medium text-white transition hover:bg-emerald-700 active:scale-[0.98]"
            >
                {sponsor.cta_label}
                <ExternalLink className="h-3 w-3" />
            </button>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Composant principal : SponsorWidget
//
//  Dimensions conservées exactement comme dans l'original :
//  - rounded-xl bg-white p-4 text-xs shadow
//  - image h-40 w-full
// ─────────────────────────────────────────────────────────────────────────────

export default function SponsorWidget() {
    const { sponsors, loading, error } = useSponsors();

    const [currentIndex, setCurrentIndex] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const totalRef = useRef(0); // sync avec sponsors.length sans re-render
    const trackedRef = useRef<Set<string>>(new Set()); // évite les doubles impressions

    totalRef.current = sponsors.length;

    // ── Aller au slide suivant ──────────────────────────────────────────────
    const goNext = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % totalRef.current);
    }, []);

    // ── Aller au slide précédent ────────────────────────────────────────────
    const goPrev = useCallback(() => {
        setCurrentIndex((prev) =>
            prev === 0 ? totalRef.current - 1 : prev - 1,
        );
    }, []);

    // ── Timer auto-défilement (20 s) ────────────────────────────────────────
    const resetTimer = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(goNext, SLIDE_INTERVAL_MS);
    }, [goNext]);

    useEffect(() => {
        if (sponsors.length > 1) {
            resetTimer();
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [sponsors.length, resetTimer]);

    // ── Réinitialiser le timer lors d'une navigation manuelle ───────────────
    const handleNav = useCallback(
        (direction: 'prev' | 'next') => {
            if (direction === 'prev') goPrev();
            else goNext();
            resetTimer();
        },
        [goPrev, goNext, resetTimer],
    );

    // ── Enregistrer l'impression lors du changement de slide ────────────────
    useEffect(() => {
        if (!sponsors[currentIndex]) return;
        const id = sponsors[currentIndex].id;
        if (!trackedRef.current.has(id)) {
            trackedRef.current.add(id);
            trackImpression(id);
        }
    }, [currentIndex, sponsors]);

    // ─────────────────────────────────────────────────────────────────────────
    //  Rendu : états de chargement / erreur / vide
    // ─────────────────────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div className="rounded-xl bg-white p-4 text-xs shadow">
                <h3 className="font-semibold text-slate-800">Sponsorisé</h3>
                {/* Skeleton */}
                <div className="mt-2 h-40 w-full animate-pulse rounded-lg bg-slate-200" />
                <div className="mt-2 h-3 w-3/4 animate-pulse rounded bg-slate-200" />
                <div className="mt-1 h-3 w-full animate-pulse rounded bg-slate-200" />
                <div className="mt-2 h-7 w-full animate-pulse rounded-lg bg-slate-200" />
            </div>
        );
    }

    if (error || sponsors.length === 0) {
        // Aucun sponsor → ne rien afficher (évite un widget vide disgracieux)
        return null;
    }

    const currentSponsor = sponsors[currentIndex];

    // ─────────────────────────────────────────────────────────────────────────
    //  Rendu principal
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div className="rounded-xl bg-white p-4 text-xs shadow">
            {/* ── En-tête ─────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-800">Sponsorisé</h3>

                {/* Navigation (uniquement si plusieurs sponsors) */}
                {sponsors.length > 1 && (
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => handleNav('prev')}
                            aria-label="Sponsor précédent"
                            className="rounded p-0.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        >
                            <ChevronLeft className="h-3.5 w-3.5" />
                        </button>

                        {/* Indicateur position */}
                        <span className="text-[10px] text-slate-400 tabular-nums">
                            {currentIndex + 1}/{sponsors.length}
                        </span>

                        <button
                            onClick={() => handleNav('next')}
                            aria-label="Sponsor suivant"
                            className="rounded p-0.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        >
                            <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                    </div>
                )}
            </div>

            {/* ── Slide actuel ────────────────────────────────────────────── */}
            <SponsorSlide key={currentSponsor.id} sponsor={currentSponsor} />

            {/* ── Points de pagination (dots) ─────────────────────────────── */}
            {sponsors.length > 1 && (
                <div className="mt-2 flex justify-center gap-1">
                    {sponsors.map((s, i) => (
                        <button
                            key={s.id}
                            onClick={() => {
                                setCurrentIndex(i);
                                resetTimer();
                            }}
                            aria-label={`Aller au sponsor ${i + 1}`}
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                                i === currentIndex
                                    ? 'w-4 bg-emerald-600'
                                    : 'w-1.5 bg-slate-300 hover:bg-slate-400'
                            }`}
                        />
                    ))}
                </div>
            )}

            {/* ── Barre de progression auto-défilement ────────────────────── */}
            {sponsors.length > 1 && (
                <div className="mt-1.5 h-0.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                        key={`${currentIndex}-progress`} // reset l'animation au changement de slide
                        className="h-full rounded-full bg-emerald-500"
                        style={{
                            animation: `sponsor-progress ${SLIDE_INTERVAL_MS}ms linear forwards`,
                        }}
                    />
                </div>
            )}

            {/* ── Animation CSS injectée inline (pas de fichier CSS séparé) ── */}
            <style>{`
                @keyframes sponsor-progress {
                    from { width: 0%; }
                    to   { width: 100%; }
                }
            `}</style>
        </div>
    );
}
