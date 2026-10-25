<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     * Cette méthode définit quels champs retourner
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            // Champs simples
            'id' => $this->id,
            'full_name' => $this->full_name,
            'username' => $this->username,
            'email' => $this->email,
            'bio' => $this->bio,
            'profile_picture' => $this->profile_picture,
            'cover_photo' => $this->cover_photo,
            'location' => $this->location,
            
            // Champs calculés
            'followers_count' => $this->followers()->count(),
            'following_count' => $this->following()->count(),
            'posts_count' => $this->posts()->count(),
            
            // Dates
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            
            // Champs conditionnels (seulement pour l'utilisateur connecté)
            'is_following' => $this->when(
                auth()->check(),
                fn() => auth()->user()->isFollowing($this->id)
            ),
            
            // Relations chargées
            'posts' => PostResource::collection($this->whenLoaded('posts')),
        ];
    }

    /**
     * Méthode optionnelle : ajouter des métadonnées
     */
    public function with(Request $request): array
    {
        return [
            'meta' => [
                'timestamp' => now(),
                'api_version' => '1.0',
            ],
        ];
    }
}