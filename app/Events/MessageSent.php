<?php

namespace App\Events;

use App\Models\Message;
use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $message;
    public $sender;

    /**
     * Créer une nouvelle instance d'événement
     */
    public function __construct(Message $message)
    {
        $this->message = $message;
        $this->sender = $message->sender;
        
        // Charger les relations nécessaires
        $this->message->load(['sender:id,full_name,username,profile_picture']);
    }

    /**
     * Canal(aux) sur lesquels diffuser l'événement
     */
    public function broadcastOn(): array
    {
        // Canal privé pour le destinataire uniquement
        return [
            new PrivateChannel('user.' . $this->message->to_user_id),
        ];
    }

    /**
     * Nom de l'événement diffusé
     */
    public function broadcastAs(): string
    {
        return 'message.sent';
    }

    /**
     * Données à diffuser avec l'événement
     */
    public function broadcastWith(): array
    {
        return [
            'message' => [
                'id' => $this->message->id,
                'text' => $this->message->text,
                'message_type' => $this->message->message_type,
                'media_url' => $this->message->media_url,
                'created_at' => $this->message->created_at->toISOString(),
                'from_user_id' => $this->message->from_user_id,
                'to_user_id' => $this->message->to_user_id,
            ],
            'sender' => [
                'id' => $this->sender->id,
                'full_name' => $this->sender->full_name,
                'username' => $this->sender->username,
                'profile_picture' => $this->sender->profile_picture,
            ],
            'notification' => [
                'title' => 'Nouveau message',
                'body' => $this->sender->full_name . ' vous a envoyé un message',
                'timestamp' => now()->toISOString(),
            ],
        ];
    }
}