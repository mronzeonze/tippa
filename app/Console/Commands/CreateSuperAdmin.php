<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class CreateSuperAdmin extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'admin:create-super
                          {--email= : Email du super-admin}
                          {--name= : Nom complet du super-admin}
                          {--password= : Mot de passe}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Créer un compte super-administrateur';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔐 Création d\'un compte Super-Administrateur');
        $this->newLine();

        // Collecter les informations
        $email = $this->option('email') ?: $this->ask('Email du super-admin');
        $fullName = $this->option('name') ?: $this->ask('Nom complet');
        $password = $this->option('password') ?: $this->secret('Mot de passe (min 8 caractères)');

        // Validation
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->error('❌ Email invalide');
            return 1;
        }

        if (strlen($password) < 8) {
            $this->error('❌ Le mot de passe doit contenir au moins 8 caractères');
            return 1;
        }

        // Vérifier si l'email existe déjà
        if (User::where('email', $email)->exists()) {
            $this->error('❌ Un utilisateur avec cet email existe déjà');
            return 1;
        }

        // Générer le username
        $username = $this->generateUsername($fullName);

        // Confirmation
        $this->newLine();
        $this->table(
            ['Champ', 'Valeur'],
            [
                ['Email', $email],
                ['Nom', $fullName],
                ['Username', $username],
                ['Rôle', 'super-admin'],
            ]
        );

        if (!$this->confirm('Confirmer la création ?', true)) {
            $this->warn('⚠️  Opération annulée');
            return 0;
        }

        // Créer le super-admin
        try {
            $user = User::create([
                'id' => Str::uuid()->toString(),
                'email' => $email,
                'full_name' => $fullName,
                'username' => $username,
                'password' => Hash::make($password),
                'account_type' => 'super-admin',
                'email_verified_at' => now(),
                'is_active' => true,
                'bio' => 'Super Administrateur de la plateforme Pharmacopée',
            ]);

            $this->newLine();
            $this->info('✅ Super-admin créé avec succès !');
            $this->newLine();
            $this->line('📧 Email: ' . $user->email);
            $this->line('👤 Username: ' . $user->username);
            $this->line('🔑 Rôle: ' . $user->account_type);
            $this->newLine();
            $this->info('🚀 Vous pouvez maintenant vous connecter avec ces identifiants.');

            return 0;
        } catch (\Exception $e) {
            $this->error('❌ Erreur lors de la création: ' . $e->getMessage());
            return 1;
        }
    }

    /**
     * Générer un username unique à partir du nom
     */
    private function generateUsername(string $fullName): string
    {
        $baseUsername = Str::slug(Str::lower($fullName), '');
        $username = $baseUsername;
        
        $counter = 1;
        while (User::where('username', $username)->exists()) {
            $username = $baseUsername . $counter;
            $counter++;
        }

        return $username;
    }
}