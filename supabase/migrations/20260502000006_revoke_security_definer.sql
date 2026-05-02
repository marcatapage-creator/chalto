-- Corrige "Public/Signed-In Can Execute SECURITY DEFINER Function"
-- REVOKE FROM anon seul ne suffit pas quand le grant vient de PUBLIC.
-- On révoque de PUBLIC puis on re-GRANT uniquement aux rôles nécessaires.

-- ── Fonctions appelées par les utilisateurs authentifiés (rpc / API routes) ──

REVOKE EXECUTE ON FUNCTION public.create_document_with_contributors(uuid, text, text, text, uuid[])
  FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_document_with_contributors(uuid, text, text, text, uuid[])
  TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.get_projects_unread_counts()
  FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_projects_unread_counts()
  TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.send_document_to_client(uuid, text)
  FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.send_document_to_client(uuid, text)
  TO authenticated, service_role;

-- ── Fonction trigger : appelée par supabase_auth_admin, pas par les users ───
-- Le trigger on_auth_user_created (schema auth) s'exécute sous supabase_auth_admin.
-- Ce rôle doit garder EXECUTE — on révoque uniquement anon et authenticated.

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;
GRANT  EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin;
