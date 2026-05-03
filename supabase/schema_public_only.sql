SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';
SET default_table_access_method = heap;

--
-- Name: create_document_with_contributors(uuid, text, text, text, uuid[]); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_document_with_contributors(p_project_id uuid, p_name text, p_type text, p_audience text DEFAULT 'client'::text, p_contributor_ids uuid[] DEFAULT '{}'::uuid[]) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare
  v_document_id uuid;
begin
  insert into public.documents (project_id, name, type, status, audience)
  values (p_project_id, p_name, p_type, 'draft', p_audience)
  returning id into v_document_id;

  if array_length(p_contributor_ids, 1) > 0 then
    insert into public.document_contributors (document_id, contributor_id)
    select v_document_id, unnest(p_contributor_ids);
  end if;

  return v_document_id;
end;
$$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;


--
-- Name: send_document_to_client(uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.send_document_to_client(p_document_id uuid, p_status text DEFAULT 'sent'::text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
begin
  update public.documents
  set status = p_status
  where id = p_document_id;
end;
$$;


--
-- Name: update_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public', 'pg_temp'
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


--
-- Name: contacts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contacts (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    email text,
    phone text,
    company_name text,
    profession_id uuid,
    notes text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: contributors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contributors (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    project_id uuid NOT NULL,
    name text NOT NULL,
    email text,
    profession_id uuid,
    role text,
    created_at timestamp with time zone DEFAULT now(),
    invite_token uuid DEFAULT extensions.uuid_generate_v4(),
    invite_status text DEFAULT 'pending'::text,
    contact_id uuid,
    invite_expires_at timestamp with time zone DEFAULT (now() + '30 days'::interval),
    CONSTRAINT contributors_invite_status_check CHECK ((invite_status = ANY (ARRAY['pending'::text, 'accepted'::text])))
);


--
-- Name: document_contributors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.document_contributors (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    document_id uuid NOT NULL,
    contributor_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    request_type text DEFAULT 'validation'::text NOT NULL,
    pro_message text,
    CONSTRAINT document_contributors_request_type_check CHECK ((request_type = ANY (ARRAY['validation'::text, 'transmission'::text])))
);


--
-- Name: document_versions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.document_versions (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    document_id uuid NOT NULL,
    version integer NOT NULL,
    file_url text,
    file_name text,
    file_type text,
    file_size integer,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.documents (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    project_id uuid NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    file_url text,
    content text,
    status text DEFAULT 'draft'::text,
    validation_token uuid DEFAULT extensions.uuid_generate_v4(),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    file_name text,
    file_type text,
    file_size integer,
    version integer DEFAULT 1,
    pro_message text,
    audience text DEFAULT 'client'::text,
    request_type text DEFAULT 'validation'::text,
    CONSTRAINT documents_audience_check CHECK ((audience = ANY (ARRAY['client'::text, 'contributor'::text, 'both'::text]))),
    CONSTRAINT documents_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'sent'::text, 'approved'::text, 'rejected'::text, 'commented'::text])))
);

ALTER TABLE ONLY public.documents REPLICA IDENTITY FULL;


--
-- Name: messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.messages (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    document_id uuid NOT NULL,
    author_name text NOT NULL,
    author_role text NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT messages_author_role_check CHECK ((author_role = ANY (ARRAY['pro'::text, 'client'::text])))
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    body text,
    link text,
    read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT notifications_type_check CHECK ((type = ANY (ARRAY['document_approved'::text, 'document_rejected'::text, 'message_received'::text, 'task_assigned'::text])))
);


--
-- Name: professions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.professions (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    slug text NOT NULL,
    label text NOT NULL,
    description text,
    icon text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    email text NOT NULL,
    full_name text,
    company_name text,
    phone text,
    profession_id uuid,
    onboarding_completed boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    onboarding_step integer DEFAULT 0,
    demo_project_id uuid,
    notif_email_approved boolean DEFAULT true,
    notif_email_rejected boolean DEFAULT true,
    notif_email_message boolean DEFAULT true,
    notif_email_task boolean DEFAULT true,
    notif_email_frequency text DEFAULT 'immediate'::text,
    notif_inapp_enabled boolean DEFAULT true,
    logo_url text,
    branding_enabled boolean DEFAULT false NOT NULL,
    active_profession_id uuid,
    CONSTRAINT profiles_notif_email_frequency_check CHECK ((notif_email_frequency = ANY (ARRAY['immediate'::text, 'daily'::text, 'weekly'::text, 'never'::text])))
);


--
-- Name: project_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_messages (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    project_id uuid NOT NULL,
    author_name text NOT NULL,
    author_role text NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT project_messages_author_role_check CHECK ((author_role = ANY (ARRAY['pro'::text, 'prestataire'::text])))
);


--
-- Name: projects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.projects (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    description text,
    client_name text,
    client_email text,
    address text,
    status text DEFAULT 'draft'::text,
    profession_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    budget_range text,
    work_type text,
    deadline text,
    constraints text,
    phase text DEFAULT 'cadrage'::text,
    CONSTRAINT projects_phase_check CHECK ((phase = ANY (ARRAY['cadrage'::text, 'conception'::text, 'validation'::text, 'chantier'::text, 'reception'::text, 'cloture'::text]))),
    CONSTRAINT projects_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'active'::text, 'completed'::text, 'archived'::text])))
);


--
-- Name: task_comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.task_comments (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    task_id uuid NOT NULL,
    author_name text NOT NULL,
    author_role text NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT task_comments_author_role_check CHECK ((author_role = ANY (ARRAY['pro'::text, 'prestataire'::text])))
);


--
-- Name: tasks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tasks (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    project_id uuid NOT NULL,
    title text NOT NULL,
    description text,
    status text DEFAULT 'todo'::text,
    assigned_to uuid,
    suggested_by text,
    due_date date,
    created_by uuid,
    approved_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT tasks_status_check CHECK ((status = ANY (ARRAY['todo'::text, 'in_progress'::text, 'done'::text, 'suggestion'::text, 'rejected'::text])))
);


--
-- Name: user_professions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_professions (
    user_id uuid NOT NULL,
    profession_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: validations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.validations (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    document_id uuid NOT NULL,
    client_name text,
    client_email text,
    status text DEFAULT 'pending'::text,
    comment text,
    approved_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    contributor_id uuid,
    version integer,
    CONSTRAINT validations_status_check CHECK ((status = ANY (ARRAY['approved'::text, 'rejected'::text, 'commented'::text])))
);

ALTER TABLE ONLY public.validations REPLICA IDENTITY FULL;


--
-- Name: waitlist; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.waitlist (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    email text NOT NULL,
    name text,
    profession text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: contacts contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contacts
    ADD CONSTRAINT contacts_pkey PRIMARY KEY (id);


--
-- Name: contributors contributors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contributors
    ADD CONSTRAINT contributors_pkey PRIMARY KEY (id);


--
-- Name: document_contributors document_contributors_document_id_contributor_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_contributors
    ADD CONSTRAINT document_contributors_document_id_contributor_id_key UNIQUE (document_id, contributor_id);


--
-- Name: document_contributors document_contributors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_contributors
    ADD CONSTRAINT document_contributors_pkey PRIMARY KEY (id);


--
-- Name: document_versions document_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_versions
    ADD CONSTRAINT document_versions_pkey PRIMARY KEY (id);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: professions professions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.professions
    ADD CONSTRAINT professions_pkey PRIMARY KEY (id);


--
-- Name: professions professions_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.professions
    ADD CONSTRAINT professions_slug_key UNIQUE (slug);


--
-- Name: profiles profiles_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_email_key UNIQUE (email);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: project_messages project_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_messages
    ADD CONSTRAINT project_messages_pkey PRIMARY KEY (id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: task_comments task_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_comments
    ADD CONSTRAINT task_comments_pkey PRIMARY KEY (id);


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- Name: user_professions user_professions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_professions
    ADD CONSTRAINT user_professions_pkey PRIMARY KEY (user_id, profession_id);


--
-- Name: validations validations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.validations
    ADD CONSTRAINT validations_pkey PRIMARY KEY (id);


--
-- Name: waitlist waitlist_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.waitlist
    ADD CONSTRAINT waitlist_email_key UNIQUE (email);


--
-- Name: waitlist waitlist_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.waitlist
    ADD CONSTRAINT waitlist_pkey PRIMARY KEY (id);


--
-- Name: idx_contacts_profession_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contacts_profession_id ON public.contacts USING btree (profession_id);


--
-- Name: idx_contacts_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contacts_user_id ON public.contacts USING btree (user_id);


--
-- Name: idx_contributors_contact_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contributors_contact_id ON public.contributors USING btree (contact_id);


--
-- Name: idx_contributors_invite_token; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contributors_invite_token ON public.contributors USING btree (invite_token);


--
-- Name: idx_contributors_profession_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contributors_profession_id ON public.contributors USING btree (profession_id);


--
-- Name: idx_contributors_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contributors_project_id ON public.contributors USING btree (project_id);


--
-- Name: idx_document_contributors_contributor_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_document_contributors_contributor_id ON public.document_contributors USING btree (contributor_id);


--
-- Name: idx_document_contributors_document_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_document_contributors_document_id ON public.document_contributors USING btree (document_id);


--
-- Name: idx_document_versions_document_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_document_versions_document_id ON public.document_versions USING btree (document_id);


--
-- Name: idx_documents_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_documents_project_id ON public.documents USING btree (project_id);


--
-- Name: idx_documents_validation_token; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_documents_validation_token ON public.documents USING btree (validation_token);


--
-- Name: idx_messages_document_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_document_id ON public.messages USING btree (document_id);


--
-- Name: idx_notifications_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_user_id ON public.notifications USING btree (user_id);


--
-- Name: idx_notifications_user_id_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_user_id_created_at ON public.notifications USING btree (user_id, created_at DESC);


--
-- Name: idx_profiles_demo_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_profiles_demo_project_id ON public.profiles USING btree (demo_project_id);


--
-- Name: idx_profiles_profession_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_profiles_profession_id ON public.profiles USING btree (profession_id);


--
-- Name: idx_project_messages_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_project_messages_project_id ON public.project_messages USING btree (project_id);


--
-- Name: idx_projects_profession_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_projects_profession_id ON public.projects USING btree (profession_id);


--
-- Name: idx_projects_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_projects_user_id ON public.projects USING btree (user_id);


--
-- Name: idx_task_comments_task_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_task_comments_task_id ON public.task_comments USING btree (task_id);


--
-- Name: idx_tasks_approved_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tasks_approved_by ON public.tasks USING btree (approved_by);


--
-- Name: idx_tasks_assigned_to; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tasks_assigned_to ON public.tasks USING btree (assigned_to);


--
-- Name: idx_tasks_created_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tasks_created_by ON public.tasks USING btree (created_by);


--
-- Name: idx_tasks_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tasks_project_id ON public.tasks USING btree (project_id);


--
-- Name: idx_validations_contributor_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_validations_contributor_id ON public.validations USING btree (contributor_id);


--
-- Name: idx_validations_document_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_validations_document_id ON public.validations USING btree (document_id);


--
-- Name: idx_validations_document_id_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_validations_document_id_created_at ON public.validations USING btree (document_id, created_at DESC);


--
-- Name: notifications_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notifications_user_id_idx ON public.notifications USING btree (user_id);


--
-- Name: users on_auth_user_created; Type: TRIGGER; Schema: auth; Owner: -
--

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


--
-- Name: documents update_documents_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- Name: projects update_projects_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- Name: tasks update_tasks_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- Name: contacts contacts_profession_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contacts
    ADD CONSTRAINT contacts_profession_id_fkey FOREIGN KEY (profession_id) REFERENCES public.professions(id);


--
-- Name: contacts contacts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contacts
    ADD CONSTRAINT contacts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: contributors contributors_contact_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contributors
    ADD CONSTRAINT contributors_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES public.contacts(id) ON DELETE SET NULL;


--
-- Name: contributors contributors_profession_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contributors
    ADD CONSTRAINT contributors_profession_id_fkey FOREIGN KEY (profession_id) REFERENCES public.professions(id);


--
-- Name: contributors contributors_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contributors
    ADD CONSTRAINT contributors_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: document_contributors document_contributors_contributor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_contributors
    ADD CONSTRAINT document_contributors_contributor_id_fkey FOREIGN KEY (contributor_id) REFERENCES public.contributors(id) ON DELETE CASCADE;


--
-- Name: document_contributors document_contributors_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_contributors
    ADD CONSTRAINT document_contributors_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.documents(id) ON DELETE CASCADE;


--
-- Name: document_versions document_versions_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_versions
    ADD CONSTRAINT document_versions_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.documents(id) ON DELETE CASCADE;


--
-- Name: documents documents_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: messages messages_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.documents(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_active_profession_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_active_profession_id_fkey FOREIGN KEY (active_profession_id) REFERENCES public.professions(id);


--
-- Name: profiles profiles_demo_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_demo_project_id_fkey FOREIGN KEY (demo_project_id) REFERENCES public.projects(id) ON DELETE SET NULL;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_profession_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_profession_id_fkey FOREIGN KEY (profession_id) REFERENCES public.professions(id);


--
-- Name: project_messages project_messages_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_messages
    ADD CONSTRAINT project_messages_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: projects projects_profession_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_profession_id_fkey FOREIGN KEY (profession_id) REFERENCES public.professions(id);


--
-- Name: projects projects_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: task_comments task_comments_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_comments
    ADD CONSTRAINT task_comments_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE;


--
-- Name: tasks tasks_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: tasks tasks_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.contacts(id) ON DELETE SET NULL;


--
-- Name: tasks tasks_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: tasks tasks_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: user_professions user_professions_profession_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_professions
    ADD CONSTRAINT user_professions_profession_id_fkey FOREIGN KEY (profession_id) REFERENCES public.professions(id) ON DELETE CASCADE;


--
-- Name: user_professions user_professions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_professions
    ADD CONSTRAINT user_professions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: validations validations_contributor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.validations
    ADD CONSTRAINT validations_contributor_id_fkey FOREIGN KEY (contributor_id) REFERENCES public.contributors(id) ON DELETE SET NULL;


--
-- Name: validations validations_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.validations
    ADD CONSTRAINT validations_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.documents(id) ON DELETE CASCADE;


--
-- Name: tasks Anyone can insert suggestions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can insert suggestions" ON public.tasks FOR INSERT WITH CHECK ((status = 'suggestion'::text));


--
-- Name: document_versions Anyone can read document versions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can read document versions" ON public.document_versions FOR SELECT USING (true);


--
-- Name: document_contributors Anyone can read document_contributors; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can read document_contributors" ON public.document_contributors FOR SELECT USING (true);


--
-- Name: tasks Anyone can read tasks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can read tasks" ON public.tasks FOR SELECT USING (true);


--
-- Name: document_versions Authenticated can insert document versions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated can insert document versions" ON public.document_versions FOR INSERT WITH CHECK ((( SELECT auth.role() AS role) = 'authenticated'::text));


--
-- Name: document_contributors Authenticated can insert document_contributors; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated can insert document_contributors" ON public.document_contributors FOR INSERT WITH CHECK ((( SELECT auth.role() AS role) = 'authenticated'::text));


--
-- Name: waitlist Only admin can read waitlist; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admin can read waitlist" ON public.waitlist FOR SELECT USING ((( SELECT auth.role() AS role) = 'service_role'::text));


--
-- Name: waitlist Public can join waitlist; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can join waitlist" ON public.waitlist FOR INSERT WITH CHECK (((email IS NOT NULL) AND (length(email) > 0)));


--
-- Name: projects Users can create projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create projects" ON public.projects FOR INSERT WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));


--
-- Name: projects Users can delete own projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own projects" ON public.projects FOR DELETE USING ((( SELECT auth.uid() AS uid) = user_id));


--
-- Name: profiles Users can insert own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK ((( SELECT auth.uid() AS uid) = id));


--
-- Name: project_messages Users can insert project messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert project messages" ON public.project_messages FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.projects
  WHERE ((projects.id = project_messages.project_id) AND (projects.user_id = ( SELECT auth.uid() AS uid))))));


--
-- Name: task_comments Users can insert task comments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert task comments" ON public.task_comments FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM (public.tasks
     JOIN public.projects ON ((projects.id = tasks.project_id)))
  WHERE ((tasks.id = task_comments.task_id) AND (projects.user_id = ( SELECT auth.uid() AS uid))))));


--
-- Name: documents Users can manage documents via projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage documents via projects" ON public.documents USING ((EXISTS ( SELECT 1
   FROM public.projects
  WHERE ((projects.id = documents.project_id) AND (projects.user_id = ( SELECT auth.uid() AS uid))))));


--
-- Name: contacts Users can manage own contacts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage own contacts" ON public.contacts USING ((( SELECT auth.uid() AS uid) = user_id));


--
-- Name: tasks Users can manage tasks via projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage tasks via projects" ON public.tasks USING ((EXISTS ( SELECT 1
   FROM public.projects
  WHERE ((projects.id = tasks.project_id) AND (projects.user_id = ( SELECT auth.uid() AS uid))))));


--
-- Name: document_versions Users can manage versions via documents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage versions via documents" ON public.document_versions USING ((EXISTS ( SELECT 1
   FROM (public.documents d
     JOIN public.projects p ON ((p.id = d.project_id)))
  WHERE ((d.id = document_versions.document_id) AND (p.user_id = ( SELECT auth.uid() AS uid))))));


--
-- Name: notifications Users can read own notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can read own notifications" ON public.notifications FOR SELECT USING ((( SELECT auth.uid() AS uid) = user_id));


--
-- Name: project_messages Users can read project messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can read project messages" ON public.project_messages FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.projects
  WHERE ((projects.id = project_messages.project_id) AND (projects.user_id = ( SELECT auth.uid() AS uid))))));


--
-- Name: task_comments Users can read task comments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can read task comments" ON public.task_comments FOR SELECT USING ((EXISTS ( SELECT 1
   FROM (public.tasks
     JOIN public.projects ON ((projects.id = tasks.project_id)))
  WHERE ((tasks.id = task_comments.task_id) AND (projects.user_id = ( SELECT auth.uid() AS uid))))));


--
-- Name: notifications Users can update own notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING ((( SELECT auth.uid() AS uid) = user_id));


--
-- Name: projects Users can update own projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own projects" ON public.projects FOR UPDATE USING ((( SELECT auth.uid() AS uid) = user_id));


--
-- Name: profiles Users can view own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING ((( SELECT auth.uid() AS uid) = id));


--
-- Name: projects Users can view own projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own projects" ON public.projects FOR SELECT USING ((( SELECT auth.uid() AS uid) = user_id));


--
-- Name: validations Users can view own validations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own validations" ON public.validations FOR SELECT USING ((EXISTS ( SELECT 1
   FROM (public.documents d
     JOIN public.projects p ON ((p.id = d.project_id)))
  WHERE ((d.id = validations.document_id) AND (p.user_id = ( SELECT auth.uid() AS uid))))));


--
-- Name: project_messages anon can read project_messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "anon can read project_messages" ON public.project_messages FOR SELECT TO anon USING (true);


--
-- Name: contacts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

--
-- Name: contributors; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.contributors ENABLE ROW LEVEL SECURITY;

--
-- Name: contributors contributors_anon_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY contributors_anon_select ON public.contributors FOR SELECT TO anon USING (true);


--
-- Name: contributors contributors_pro; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY contributors_pro ON public.contributors TO authenticated USING ((project_id IN ( SELECT projects.id
   FROM public.projects
  WHERE (projects.user_id = ( SELECT auth.uid() AS uid))))) WITH CHECK ((project_id IN ( SELECT projects.id
   FROM public.projects
  WHERE (projects.user_id = ( SELECT auth.uid() AS uid)))));


--
-- Name: document_contributors; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.document_contributors ENABLE ROW LEVEL SECURITY;

--
-- Name: document_versions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;

--
-- Name: documents; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

--
-- Name: documents documents_anon_validate; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY documents_anon_validate ON public.documents FOR UPDATE TO anon USING ((status = 'sent'::text)) WITH CHECK ((status = ANY (ARRAY['approved'::text, 'rejected'::text])));


--
-- Name: messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: messages messages_anon_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY messages_anon_insert ON public.messages FOR INSERT TO anon WITH CHECK ((EXISTS ( SELECT 1
   FROM public.documents
  WHERE (documents.id = messages.document_id))));


--
-- Name: messages messages_anon_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY messages_anon_select ON public.messages FOR SELECT TO anon USING (true);


--
-- Name: messages messages_pro; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY messages_pro ON public.messages TO authenticated USING ((document_id IN ( SELECT d.id
   FROM (public.documents d
     JOIN public.projects p ON ((d.project_id = p.id)))
  WHERE (p.user_id = ( SELECT auth.uid() AS uid))))) WITH CHECK ((document_id IN ( SELECT d.id
   FROM (public.documents d
     JOIN public.projects p ON ((d.project_id = p.id)))
  WHERE (p.user_id = ( SELECT auth.uid() AS uid)))));


--
-- Name: notifications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

--
-- Name: professions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.professions ENABLE ROW LEVEL SECURITY;

--
-- Name: professions professions_select_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY professions_select_all ON public.professions FOR SELECT USING (true);


--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: project_messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.project_messages ENABLE ROW LEVEL SECURITY;

--
-- Name: projects; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

--
-- Name: task_comments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;

--
-- Name: tasks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

--
-- Name: user_professions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_professions ENABLE ROW LEVEL SECURITY;

--
-- Name: user_professions users can read own professions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "users can read own professions" ON public.user_professions FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: profiles users can update own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "users can update own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = id)) WITH CHECK ((auth.uid() = id));


--
-- Name: validations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.validations ENABLE ROW LEVEL SECURITY;

--
-- Name: waitlist; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

--
-- Name: supabase_realtime documents; Type: PUBLICATION TABLE; Schema: public; Owner: -
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.documents;


--
-- Name: supabase_realtime notifications; Type: PUBLICATION TABLE; Schema: public; Owner: -
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.notifications;


--
-- Name: supabase_realtime validations; Type: PUBLICATION TABLE; Schema: public; Owner: -
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.validations;

