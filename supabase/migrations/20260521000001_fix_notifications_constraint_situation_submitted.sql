-- Remet la contrainte notifications_type_check à jour sur tous les environnements.
-- Sur staging elle est déjà correcte (idempotent via DROP IF EXISTS).
-- Sur production, la contrainte originale n'incluait pas situation_submitted /
-- situation_reviewed / cloud_file_synced / cloud_token_expired / deadline_alert,
-- ce qui provoquait un échec silencieux à l'INSERT et aucune notif in-app.

ALTER TABLE public.notifications
  DROP CONSTRAINT IF EXISTS notifications_type_check,
  ADD CONSTRAINT notifications_type_check CHECK (
    type = ANY (ARRAY[
      'document_approved',
      'document_rejected',
      'message_received',
      'task_assigned',
      'situation_submitted',
      'situation_reviewed',
      'cloud_file_synced',
      'cloud_token_expired',
      'deadline_alert'
    ])
  );
