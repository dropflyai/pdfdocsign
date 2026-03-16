-- Fix delete_user_account: signature_requests uses sender_id, not user_id
CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid;
BEGIN
  -- Get the current user's ID
  _user_id := auth.uid();

  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Delete user's signature events (via signature_requests cascade, but explicit is safer)
  DELETE FROM public.signature_events WHERE request_id IN (
    SELECT id FROM public.signature_requests WHERE sender_id = _user_id
  );

  -- Delete user's signature requests (fixed: was user_id, correct column is sender_id)
  DELETE FROM public.signature_requests WHERE sender_id = _user_id;

  -- Delete user's signatures
  DELETE FROM public.signatures WHERE user_id = _user_id;

  -- Delete user's documents
  DELETE FROM public.documents WHERE user_id = _user_id;

  -- Delete user's subscription record
  DELETE FROM public.subscriptions WHERE user_id = _user_id;

  -- Delete user's audit logs
  DELETE FROM public.audit_logs WHERE user_id = _user_id::text;

  -- Finally, delete the auth user (cascades to auth.identities, etc.)
  DELETE FROM auth.users WHERE id = _user_id;
END;
$$;

-- Only authenticated users can call this
GRANT EXECUTE ON FUNCTION public.delete_user_account() TO authenticated;
