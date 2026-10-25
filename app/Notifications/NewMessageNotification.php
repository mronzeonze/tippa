<?php

namespace App\Notifications;

use App\Models\Message;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewMessageNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $message;

    /**
     * Créer une nouvelle instance de notification
     */
    public function __construct(Message $message)
    {
        $this->message = $message;
    }

    /**
     * Canaux de notification
     */
    public function via($notifiable): array
    {
        return ['database'];
    }

    /**
     * Représentation en base de données
     */
    public function toArray($notifiable): array
    {
        return [
            'type' => 'message',
            'message_id' => $this->message->id,
            'sender_id' => $this->message->from_user_id,
            'sender_name' => $this->message->sender->full_name,
            'sender_username' => $this->message->sender->username,
            'sender_avatar' => $this->message->sender->profile_picture,
            'message_preview' => $this->message->message_type === 'text' 
                ? \Str::limit($this->message->text, 50) 
                : '📷 Image',
            'message_type' => $this->message->message_type,
            'timestamp' => $this->message->created_at->toISOString(),
            'url' => "api/messages/{$this->message->from_user_id}",
        ];
    }
}