<?php

namespace App\Console\Commands;

use App\Models\Story;
use Illuminate\Console\Command;

class CleanupExpiredStories extends Command
{
    protected $signature = 'stories:cleanup';
    protected $description = 'Delete expired stories and their media files';

    public function handle()
    {
        $expiredStories = Story::expired()->get();
        $count = 0;

        foreach ($expiredStories as $story) {
            if ($story->media_url) {
                $mediaPath = str_replace(asset('storage/'), '', $story->media_url);
                \Storage::disk('public')->delete($mediaPath);
            }
            
            $story->delete();
            $count++;
        }

        $this->info("Cleaned up {$count} expired stories.");
        return 0;
    }
}