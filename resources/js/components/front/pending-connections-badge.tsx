// components/pending-connections-badge.tsx
// Badge à ajouter dans le menu/navbar pour afficher les demandes en attente

import { router } from '@inertiajs/react';
import { UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';

export const PendingConnectionsBadge = () => {
    const [pendingCount, setPendingCount] = useState(0);

    // Récupérer le nombre de demandes en attente
    const fetchPendingCount = () => {
        // Vous pouvez créer une route API pour cela
        // Pour l'instant, on peut le récupérer depuis les props Inertia
        router.get(
            '/connections',
            { tab: 'pending' },
            {
                preserveState: true,
                only: ['counts'],
                onSuccess: (page: any) => {
                    setPendingCount(page.props.counts?.pending || 0);
                },
            },
        );
    };

    // Polling toutes les 60 secondes
    useEffect(() => {
        fetchPendingCount();

        const interval = setInterval(() => {
            fetchPendingCount();
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    if (pendingCount === 0) return null;

    return (
        <div className="relative">
            <UserPlus className="h-6 w-6" />
            <div className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">
                {pendingCount > 9 ? '9+' : pendingCount}
            </div>
        </div>
    );
};
