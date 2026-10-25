<?php

namespace App\Traits;

use App\Models\AdminLog;

trait LogsAdminActions
{
    /**
     * Logger une action admin
     * 
     * @param string $action L'action effectuée
     * @param mixed $target L'entité ciblée (Model instance ou null)
     * @param string|null $description Description optionnelle
     * @param array|null $metadata Données supplémentaires
     * @return AdminLog
     */
    protected function logAdminAction(
        string $action,
        $target = null,
        ?string $description = null,
        ?array $metadata = null
    ): AdminLog {
        $targetType = null;
        $targetId = null;

        if ($target) {
            $targetType = get_class($target);
            $targetId = $target->id;
        }

        return AdminLog::logAction(
            $action,
            $targetType,
            $targetId,
            $description,
            $metadata
        );
    }

    /**
     * Logger une vérification d'utilisateur
     */
    protected function logUserVerification($user): AdminLog
    {
        return $this->logAdminAction(
            'verify_practitioner',
            $user,
            "Vérification du tradipraticien {$user->full_name}",
            [
                'user_email' => $user->email,
                'certification_number' => $user->certification_number,
            ]
        );
    }

    /**
     * Logger une promotion au rang d'expert
     */
    protected function logExpertPromotion($user): AdminLog
    {
        return $this->logAdminAction(
            'promote_to_expert',
            $user,
            "Promotion de {$user->full_name} au rang d'expert",
            [
                'user_email' => $user->email,
                'years_experience' => $user->years_of_experience,
            ]
        );
    }

    /**
     * Logger une suspension d'utilisateur
     */
    protected function logUserSuspension($user, string $reason = null): AdminLog
    {
        return $this->logAdminAction(
            'suspend_user',
            $user,
            "Suspension de l'utilisateur {$user->full_name}" . ($reason ? " - Raison: {$reason}" : ""),
            [
                'user_email' => $user->email,
                'reason' => $reason,
            ]
        );
    }

    /**
     * Logger une suppression d'utilisateur
     */
    protected function logUserDeletion($user, string $reason = null): AdminLog
    {
        return $this->logAdminAction(
            'delete_user',
            $user,
            "Suppression de l'utilisateur {$user->full_name}" . ($reason ? " - Raison: {$reason}" : ""),
            [
                'user_email' => $user->email,
                'user_type' => $user->account_type,
                'reason' => $reason,
            ]
        );
    }

    /**
     * Logger une suppression de post
     */
    protected function logPostDeletion($post, string $reason = null): AdminLog
    {
        return $this->logAdminAction(
            'delete_post',
            $post,
            "Suppression de la publication" . ($reason ? " - Raison: {$reason}" : ""),
            [
                'author_id' => $post->user_id,
                'content_preview' => substr($post->content, 0, 100),
                'reason' => $reason,
            ]
        );
    }

    /**
     * Logger un traitement de signalement
     */
    protected function logReportResolution($report, string $action, $targetUser): AdminLog
    {
        return $this->logAdminAction(
            'resolve_report',
            $targetUser,
            "Traitement du signalement #{$report->id} - Action: {$action}",
            [
                'report_id' => $report->id,
                'report_reason' => $report->reason,
                'action_taken' => $action,
                'reported_user' => $targetUser->id,
            ]
        );
    }
}