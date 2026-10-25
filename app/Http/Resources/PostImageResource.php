<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PostImageResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     * Cette méthode définit les champs retournés pour chaque image
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            // ID unique de l'image
            'id' => $this->id,
            
            // ID du post auquel appartient l'image
            'post_id' => $this->post_id,
            
            // URL de l'image
            'image_url' => $this->image_url,
            
            // Champs calculés : vérifier si l'image est valide
            'is_valid' => $this->when(
                !empty($this->image_url),
                fn() => $this->isValidImageUrl()
            ),
            
            // Champs conditionnels : seulement pour les administrateurs
            'file_size' => $this->when(
                auth()->user()?->role === 'admin',
                fn() => $this->getImageFileSize()
            ),
            
            'file_type' => $this->when(
                auth()->user()?->role === 'admin',
                fn() => $this->getImageFileType()
            ),
            
            // Dates
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }

    /**
     * Ajouter des métadonnées à la réponse
     */
    public function with(Request $request): array
    {
        return [
            'meta' => [
                'image_count' => $this->collection?->count() ?? 1,
                'timestamp' => now(),
            ],
        ];
    }

    /**
     * Vérifier si l'URL de l'image est valide
     */
    private function isValidImageUrl(): bool
    {
        if (empty($this->image_url)) {
            return false;
        }

        // Vérifier si c'est une URL valide
        return filter_var($this->image_url, FILTER_VALIDATE_URL) !== false;
    }

    /**
     * Récupérer la taille du fichier image
     */
    private function getImageFileSize(): ?int
    {
        $headers = @get_headers($this->image_url, true);
        
        if ($headers && isset($headers['Content-Length'])) {
            return (int) $headers['Content-Length'];
        }

        return null;
    }

    /**
     * Récupérer le type de fichier de l'image
     */
    private function getImageFileType(): ?string
    {
        $headers = @get_headers($this->image_url, true);
        
        if ($headers && isset($headers['Content-Type'])) {
            return $headers['Content-Type'];
        }

        return null;
    }
}