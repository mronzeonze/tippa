<?php

use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Ici vous pouvez enregistrer tous les canaux de diffusion d'événements
| que votre application supporte. L'expression callable donnée sera
| utilisée pour déterminer si l'utilisateur peut écouter le canal.
|
*/

// Canal privé pour chaque utilisateur
Broadcast::channel('user.{userId}', function ($user, $userId) {
    // L'utilisateur ne peut écouter que son propre canal
    return (string) $user->id === (string) $userId;
});

// Canal de présence pour le chat (optionnel)
Broadcast::channel('chat.{conversationId}', function ($user, $conversationId) {
    // Vérifier que l'utilisateur fait partie de cette conversation
    // Vous pouvez ajouter votre propre logique ici
    return ['id' => $user->id, 'name' => $user->full_name];
});