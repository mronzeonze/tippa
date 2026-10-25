<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\Permission;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // ==========================================
        // CRÉATION DES PERMISSIONS
        // ==========================================
        
        $permissions = [
            // UTILISATEURS
            ['name' => 'Voir utilisateurs', 'slug' => 'view-users', 'group' => 'users'],
            ['name' => 'Créer utilisateurs', 'slug' => 'create-users', 'group' => 'users'],
            ['name' => 'Modifier utilisateurs', 'slug' => 'edit-users', 'group' => 'users'],
            ['name' => 'Supprimer utilisateurs', 'slug' => 'delete-users', 'group' => 'users'],
            ['name' => 'Bannir utilisateurs', 'slug' => 'ban-users', 'group' => 'users'],
            ['name' => 'Attribuer rôles', 'slug' => 'assign-roles', 'group' => 'users'],

            // POSTS
            ['name' => 'Voir posts', 'slug' => 'view-posts', 'group' => 'posts'],
            ['name' => 'Créer posts', 'slug' => 'create-posts', 'group' => 'posts'],
            ['name' => 'Modifier ses posts', 'slug' => 'edit-own-posts', 'group' => 'posts'],
            ['name' => 'Modifier tous posts', 'slug' => 'edit-all-posts', 'group' => 'posts'],
            ['name' => 'Supprimer ses posts', 'slug' => 'delete-own-posts', 'group' => 'posts'],
            ['name' => 'Supprimer tous posts', 'slug' => 'delete-all-posts', 'group' => 'posts'],
            
            // COMMENTAIRES
            ['name' => 'Créer commentaires', 'slug' => 'create-comments', 'group' => 'comments'],
            ['name' => 'Suppr. commentaires', 'slug' => 'delete-comments', 'group' => 'comments'],

            // MODÉRATION
            ['name' => 'Modérer contenus', 'slug' => 'moderate-content', 'group' => 'moderation'],
            ['name' => 'Gérer signalements', 'slug' => 'manage-reports', 'group' => 'moderation'],
            ['name' => 'Voir logs', 'slug' => 'view-logs', 'group' => 'moderation'],

            // TRADIPRATICIENS
            ['name' => 'Vérifier praticiens', 'slug' => 'verify-practitioners', 'group' => 'practitioners'],
            ['name' => 'Gérer rendez-vous', 'slug' => 'manage-appointments', 'group' => 'practitioners'],
            ['name' => 'Créer contenu éducatif', 'slug' => 'create-educational-content', 'group' => 'practitioners'],

            // MESSAGES
            ['name' => 'Envoyer messages', 'slug' => 'send-messages', 'group' => 'messages'],

            // SYSTÈME
            ['name' => 'Accès admin panel', 'slug' => 'access-admin-panel', 'group' => 'system'],
            ['name' => 'Gérer paramètres', 'slug' => 'manage-settings', 'group' => 'system'],
        ];


        foreach ($permissions as $permission) {
            Permission::firstOrCreate(
                ['slug' => $permission['slug']],
                $permission
            );
        }

        // ==========================================
        // CRÉATION DES RÔLES
        // ==========================================

        // SUPER ADMIN (niveau 100)
        $superAdmin = Role::firstOrCreate(
            ['slug' => 'super-admin'],
            [
                'name' => 'Super Administrateur',
                'description' => 'Accès complet au système',
                'level' => 100,
            ]
        );
        $superAdmin->syncPermissions(Permission::pluck('slug')->toArray());

        // ADMIN (niveau 80)
        $admin = Role::firstOrCreate(
            ['slug' => 'admin'],
            [
                'name' => 'Administrateur',
                'description' => 'Gestion des utilisateurs et modération',
                'level' => 80,
            ]
        );
        $admin->syncPermissions([
            'view-users', 'edit-users', 'ban-users', 'assign-roles',
            'view-posts', 'edit-all-posts', 'delete-all-posts',
            'delete-comments',
            'moderate-content', 'manage-reports', 'view-logs',
            'verify-practitioners',
            'access-admin-panel',
        ]);

        // MODERATOR (niveau 60)
        $moderator = Role::firstOrCreate(
            ['slug' => 'moderator'],
            [
                'name' => 'Modérateur',
                'description' => 'Modération des contenus',
                'level' => 60,
            ]
        );
        $moderator->syncPermissions([
            'view-users', 'view-posts',
            'moderate-content', 'manage-reports',
            'delete-all-posts', 'delete-comments',
        ]);

        // PRACTITIONER (niveau 40)
        $practitioner = Role::firstOrCreate(
            ['slug' => 'practitioner'],
            [
                'name' => 'Tradipraticien Vérifié',
                'description' => 'Tradipraticien certifié',
                'level' => 40,
            ]
        );
        $practitioner->syncPermissions([
            'view-posts', 'create-posts', 'edit-own-posts', 'delete-own-posts',
            'create-comments',
            'manage-appointments',
            'create-educational-content',
            'send-messages',
        ]);

        // USER (niveau 20 - par défaut)
        $user = Role::firstOrCreate(
            ['slug' => 'user'],
            [
                'name' => 'Utilisateur',
                'description' => 'Utilisateur standard',
                'level' => 20,
                'is_default' => true,
            ]
        );
        $user->syncPermissions([
            'view-posts', 'create-posts', 'edit-own-posts', 'delete-own-posts',
            'create-comments',
            'send-messages',
        ]);

        $this->command->info('✅ Rôles et permissions créés avec succès !');

    }
}
