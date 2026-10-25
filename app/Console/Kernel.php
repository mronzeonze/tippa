<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // ========================================
        // STORIES - Nettoyage automatique
        // ========================================
        $schedule->command('stories:cleanup')
                 ->hourly()
                 ->withoutOverlapping()
                 ->onOneServer()
                 ->runInBackground()
                 ->before(function () {
                     \Log::info('Stories cleanup started');
                 })
                 ->after(function () {
                     \Log::info('Stories cleanup completed');
                 });

        // ========================================
        // AUTRES TÂCHES DE MAINTENANCE
        // ========================================
        
        // Nettoyer les anciennes notifications (plus de 30 jours)
        // $schedule->command('notifications:cleanup')->daily();

        // Nettoyer les sessions expirées
        // $schedule->command('session:gc')->daily();

        // Sauvegarder la base de données tous les jours à 2h du matin
        // $schedule->command('backup:run')->dailyAt('02:00');

        // Générer un sitemap tous les jours
        // $schedule->command('sitemap:generate')->daily();

        // Envoyer les emails en file d'attente
        // $schedule->command('queue:work --stop-when-empty')->everyMinute();

        // Nettoyer les fichiers temporaires
        // $schedule->command('cache:prune-stale-tags')->hourly();
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }

    /**
     * Get the timezone that should be used by default for scheduled events.
     */
    protected function scheduleTimezone(): string
    {
        // Définir le fuseau horaire pour l'Afrique de l'Ouest (Burkina Faso, etc.)
        return config('app.timezone', 'UTC');
    }
}