<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PostResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'content' => $this->content,
            'post_type' => $this->post_type,
            'user' => new UserResource($this->whenLoaded('user')),
            'images' => PostImageResource::collection($this->whenLoaded('images')),
            'image_urls' => $this->images()->pluck('image_url')->toArray(),
            'likes_count' => $this->likedBy()->count(),
            'is_liked' => $this->isLikedBy(auth()->user()),
            'liked_by' => UserResource::collection($this->whenLoaded('likedBy')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}