// components/connection-button.tsx
// Bouton à ajouter dans les pages de profil

import { router } from '@inertiajs/react';
import axios from 'axios';
import { Clock, UserCheck, UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface ConnectionButtonProps {
    userId: string;
    className?: string;
}

export const ConnectionButton = ({
    userId,
    className = '',
}: ConnectionButtonProps) => {
    const [status, setStatus] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    // Récupérer le statut de connexion
    const fetchStatus = async () => {
        try {
            const response = await axios.get(`/connections/status/${userId}`);
            setStatus(response.data);
        } catch (error) {
            console.error('Error fetching connection status:', error);
        }
    };

    useEffect(() => {
        fetchStatus();
    }, [userId]);

    // Envoyer une demande
    const sendRequest = () => {
        setLoading(true);
        router.post(
            '/connections',
            { user_id: userId },
            {
                preserveState: true,
                onSuccess: () => {
                    toast.success('Demande de connexion envoyée !');
                    fetchStatus();
                },
                onError: (errors) => {
                    toast.error(Object.values(errors)[0] as string);
                },
                onFinish: () => setLoading(false),
            },
        );
    };

    // Supprimer la connexion
    const removeConnection = () => {
        if (!status?.connection?.id) return;

        setLoading(true);
        router.delete(`/connections/${status.connection.id}`, {
            preserveState: true,
            onSuccess: () => {
                toast.success('Connexion supprimée !');
                fetchStatus();
            },
            onError: () => {
                toast.error('Échec de la suppression de la connexion');
            },
            onFinish: () => setLoading(false),
        });
    };

    if (!status) return null;

    // Si déjà connecté
    if (status.is_connected) {
        return (
            <button
                onClick={removeConnection}
                disabled={loading}
                className={`flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200 disabled:opacity-50 ${className}`}
            >
                <UserCheck className="h-4 w-4" />
                Connecté
            </button>
        );
    }

    // Si demande en attente
    if (status.is_pending) {
        return (
            <button
                onClick={removeConnection}
                disabled={loading}
                className={`flex items-center gap-2 rounded-lg bg-orange-100 px-4 py-2 text-sm font-medium text-orange-700 transition hover:bg-orange-200 disabled:opacity-50 ${className}`}
            >
                <Clock className="h-4 w-4" />
                En attente
            </button>
        );
    }

    // Bouton pour envoyer une demande
    return (
        <button
            onClick={sendRequest}
            disabled={loading}
            className={`flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50 ${className}`}
        >
            <UserPlus className="h-4 w-4" />
            Connecter
        </button>
    );
};
