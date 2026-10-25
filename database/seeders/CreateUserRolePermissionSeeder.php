<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Support\Str;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class CreateUserRolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
         
        $super_admin = User::create([
            'id' => Str::uuid(),
            'full_name' => 'Super Admin',
            'username' => 'superadmin',
            'email' => 'superadmin@pharmacopee.com',
            'password' => Hash::make('password'),
            'account_type' => 'user',         // ✅ Métier : utilisateur simple
            'email_verified_at' => now(), 
        ]);

        // Créer un super admin
         UserRole::create([
            'user_id' => $super_admin->id, // Utiliser l'UUID du super admin créé ci-dessus
            'role_id' => Role::where('slug', 'super-admin')->first()->id, // ID du rôle "super-admin" (assurez-vous que ce rôle existe dans la table des rôles)
            'assigned_by' => $super_admin->id, // L'utilisateur super admin s'assign lui-même ce rôle
            'assigned_at' => now(),
            'expires_at' => null, // Le super admin n'expire jamais
        ]);
        
        // Créer un admin
        $admin = User::create([
            'id' => Str::uuid(),
            'full_name' => 'Admin User',
            'username' => 'admin',
            'email' => 'admin@pharmacopee.com',
            'password' => Hash::make('password'),
            'account_type' => 'user',
            'email_verified_at' => now(),
        ]);
        // Créer un super admin
         UserRole::create([
            'user_id' => $admin->id, // Utiliser l'UUID du super admin créé ci-dessus
            'role_id' => Role::where('slug', 'admin')->first()->id, // ID du rôle "admin" (assurez-vous que ce rôle existe dans la table des rôles)
            'assigned_by' => $super_admin->id, // L'utilisateur super admin s'assign lui-même ce rôle
            'assigned_at' => now(),
            'expires_at' => null, // Le super admin n'expire jamais
        ]);
        
        // Créer un modérateur
        $moderator =User::create([
            'id' => Str::uuid(),
            'full_name' => 'Moderator User',
            'username' => 'moderator',
            'email' => 'moderator@pharmacopee.com',
            'password' => Hash::make('password'),
            'account_type' => 'user',
            'email_verified_at' => now(),
        ]);

        // Créer un super admin
        UserRole::create([
            'user_id' => $moderator->id, // Utiliser l'UUID du super admin créé ci-dessus
            'role_id' => Role::where('slug', 'moderator')->first()->id, // ID du rôle "admin" (assurez-vous que ce rôle existe dans la table des rôles)
            'assigned_by' => $super_admin->id, // L'utilisateur super admin s'assign lui-même ce rôle
            'assigned_at' => now(),
            'expires_at' => null, // Le super admin n'expire jamais
        ]);
        
        // Créer un tradipraticien (utilisateur simple avec permissions de base)
        $user = User::create([
            'id' => Str::uuid(),
            'full_name' => 'Dr. Kofi Mensah',
            'username' => 'drkofi',
            'email' => 'kofi@pharmacopee.com',
            'password' => Hash::make('password'),
            'account_type' => 'practitioner',  // ✅ Métier : tradipraticien
            'years_of_experience' => 15,
            'email_verified_at' => now(),
        ]);
        UserRole::create([
            'user_id' => $user->id, // Utiliser l'UUID du super admin créé ci-dessus
            'role_id' => Role::where('slug', 'user')->first()->id, // ID du rôle "admin" (assurez-vous que ce rôle existe dans la table des rôles)
            'assigned_by' => $super_admin->id, // L'utilisateur super admin s'assign lui-même ce rôle
            'assigned_at' => now(),
            'expires_at' => null, // Le super admin n'expire jamais
        ]);
    }
}
