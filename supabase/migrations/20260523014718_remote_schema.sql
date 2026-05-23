


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


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pg_trgm" WITH SCHEMA "public";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."create_personal_account"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  new_account_id UUID;
BEGIN
  INSERT INTO accounts (id, name, slug)
  VALUES (
    uuid_generate_v4(),
    COALESCE(NEW.full_name, split_part(NEW.email, '@', 1)) || '''s Album',
    'personal-' || NEW.id
  )
  RETURNING id INTO new_account_id;

  INSERT INTO account_members (account_id, user_id, role)
  VALUES (new_account_id, NEW.id, 'owner');

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."create_personal_account"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_share_code"() RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..10 LOOP
    result := result || substr(chars, ceil(random() * length(chars))::integer, 1);
  END LOOP;
  RETURN result;
END;
$$;


ALTER FUNCTION "public"."generate_share_code"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_account_ids_for_user"() RETURNS SETOF "uuid"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT account_id FROM account_members WHERE user_id = auth.uid();
$$;


ALTER FUNCTION "public"."get_account_ids_for_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_collection_progress"("p_account_id" "uuid", "p_album_id" "uuid") RETURNS TABLE("total_stickers" bigint, "owned_stickers" bigint, "missing_stickers" bigint, "progress_percentage" numeric, "total_duplicates" bigint)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT s.id)::BIGINT as total_stickers,
    COUNT(DISTINCT us.id)::BIGINT as owned_stickers,
    (COUNT(DISTINCT s.id) - COUNT(DISTINCT us.id))::BIGINT as missing_stickers,
    ROUND(
      (COUNT(DISTINCT us.id)::DECIMAL / NULLIF(COUNT(DISTINCT s.id), 0)) * 100, 2
    ) as progress_percentage,
    COALESCE(SUM(sd.quantity), 0)::BIGINT as total_duplicates
  FROM stickers s
  LEFT JOIN user_stickers us ON s.id = us.sticker_id AND us.account_id = p_account_id
  LEFT JOIN sticker_duplicates sd ON s.id = sd.sticker_id AND sd.account_id = p_account_id
  WHERE s.album_id = p_album_id;
END;
$$;


ALTER FUNCTION "public"."get_collection_progress"("p_account_id" "uuid", "p_album_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_auth_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url, auth_provider, auth_uid)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture'
    ),
    COALESCE(NEW.raw_app_meta_data->>'provider', 'email'),
    NEW.id
  )
  ON CONFLICT (auth_uid) DO NOTHING;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_auth_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, auth_provider, auth_uid)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name',
    COALESCE(NEW.raw_app_meta_data ->> 'provider', 'email'),
    NEW.id
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."account_members" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "account_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "text" NOT NULL,
    "invited_by" "uuid",
    "joined_at" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "account_members_role_check" CHECK (("role" = ANY (ARRAY['owner'::"text", 'admin'::"text", 'member'::"text"])))
);


ALTER TABLE "public"."account_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."accounts" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "description" "text",
    "avatar_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."accounts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."albums" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "year" integer NOT NULL,
    "tournament_type" "text" NOT NULL,
    "description" "text",
    "image_url" "text",
    "total_stickers" integer NOT NULL,
    "special_stickers" integer DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."albums" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."audit_logs" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "action" "text" NOT NULL,
    "entity_type" "text" NOT NULL,
    "entity_id" "uuid",
    "old_values" "jsonb",
    "new_values" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."audit_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "code" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."confederations" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "code" "text" NOT NULL,
    "name" "text" NOT NULL,
    "region" "text",
    "color" "text"
);


ALTER TABLE "public"."confederations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."players" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "team_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "position" "text" NOT NULL,
    "jersey_number" integer,
    "photo_url" "text",
    "stats" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."players" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."shared_collections" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "share_code" "text" NOT NULL,
    "is_public" boolean DEFAULT true,
    "show_duplicates" boolean DEFAULT true,
    "show_missing" boolean DEFAULT true,
    "expires_at" timestamp with time zone,
    "view_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "account_id" "uuid"
);


ALTER TABLE "public"."shared_collections" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sticker_duplicates" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "sticker_id" "uuid" NOT NULL,
    "quantity" integer DEFAULT 1,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "account_id" "uuid",
    CONSTRAINT "sticker_duplicates_quantity_check" CHECK (("quantity" > 0))
);


ALTER TABLE "public"."sticker_duplicates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sticker_types" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "code" "text" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text"
);


ALTER TABLE "public"."sticker_types" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."stickers" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "album_id" "uuid" NOT NULL,
    "number" integer NOT NULL,
    "player_id" "uuid",
    "team_id" "uuid",
    "sticker_type_id" "uuid",
    "rarity" "text" NOT NULL,
    "image_url" "text" NOT NULL,
    "image_thumbnail" "text",
    "is_special" boolean DEFAULT false,
    "special_attribute" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "code" "text",
    "category_id" "uuid",
    "player_nombre" "text",
    "player_apellido" "text",
    "player_fecha_nacimiento" "text",
    "player_estatura" numeric(5,1),
    "player_peso" numeric(5,1),
    "player_club_actual" "text",
    "player_pais_club" "text",
    CONSTRAINT "stickers_rarity_check" CHECK (("rarity" = ANY (ARRAY['common'::"text", 'rare'::"text", 'legendary'::"text", 'holographic'::"text", 'limited'::"text"])))
);


ALTER TABLE "public"."stickers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."teams" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "album_id" "uuid" NOT NULL,
    "confederation_id" "uuid",
    "name" "text" NOT NULL,
    "code" "text" NOT NULL,
    "flag_url" "text",
    "group_stage" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."teams" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_stickers" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "sticker_id" "uuid" NOT NULL,
    "quantity_owned" integer DEFAULT 1,
    "obtained_at" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "account_id" "uuid",
    CONSTRAINT "user_stickers_quantity_owned_check" CHECK (("quantity_owned" > 0))
);


ALTER TABLE "public"."user_stickers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "email" "text" NOT NULL,
    "full_name" "text",
    "avatar_url" "text",
    "auth_provider" "text" NOT NULL,
    "auth_uid" "text" NOT NULL,
    "preferences" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "deleted_at" timestamp with time zone,
    CONSTRAINT "users_auth_provider_check" CHECK (("auth_provider" = ANY (ARRAY['google'::"text", 'email'::"text"])))
);


ALTER TABLE "public"."users" OWNER TO "postgres";


ALTER TABLE ONLY "public"."account_members"
    ADD CONSTRAINT "account_members_account_id_user_id_key" UNIQUE ("account_id", "user_id");



ALTER TABLE ONLY "public"."account_members"
    ADD CONSTRAINT "account_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."accounts"
    ADD CONSTRAINT "accounts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."accounts"
    ADD CONSTRAINT "accounts_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."albums"
    ADD CONSTRAINT "albums_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."confederations"
    ADD CONSTRAINT "confederations_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."confederations"
    ADD CONSTRAINT "confederations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."players"
    ADD CONSTRAINT "players_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."shared_collections"
    ADD CONSTRAINT "shared_collections_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."shared_collections"
    ADD CONSTRAINT "shared_collections_share_code_key" UNIQUE ("share_code");



ALTER TABLE ONLY "public"."sticker_duplicates"
    ADD CONSTRAINT "sticker_duplicates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sticker_duplicates"
    ADD CONSTRAINT "sticker_duplicates_user_id_sticker_id_key" UNIQUE ("user_id", "sticker_id");



ALTER TABLE ONLY "public"."sticker_types"
    ADD CONSTRAINT "sticker_types_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."sticker_types"
    ADD CONSTRAINT "sticker_types_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."stickers"
    ADD CONSTRAINT "stickers_album_id_number_key" UNIQUE ("album_id", "number");



ALTER TABLE ONLY "public"."stickers"
    ADD CONSTRAINT "stickers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."teams"
    ADD CONSTRAINT "teams_album_id_code_key" UNIQUE ("album_id", "code");



ALTER TABLE ONLY "public"."teams"
    ADD CONSTRAINT "teams_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_stickers"
    ADD CONSTRAINT "user_stickers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_stickers"
    ADD CONSTRAINT "user_stickers_user_id_sticker_id_key" UNIQUE ("user_id", "sticker_id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_auth_uid_key" UNIQUE ("auth_uid");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_account_members_account_id" ON "public"."account_members" USING "btree" ("account_id");



CREATE INDEX "idx_account_members_role" ON "public"."account_members" USING "btree" ("role");



CREATE INDEX "idx_account_members_user_id" ON "public"."account_members" USING "btree" ("user_id");



CREATE INDEX "idx_audit_created" ON "public"."audit_logs" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_audit_entity" ON "public"."audit_logs" USING "btree" ("entity_type", "entity_id");



CREATE INDEX "idx_audit_user" ON "public"."audit_logs" USING "btree" ("user_id");



CREATE INDEX "idx_duplicates_account_id" ON "public"."sticker_duplicates" USING "btree" ("account_id");



CREATE INDEX "idx_duplicates_sticker_id" ON "public"."sticker_duplicates" USING "btree" ("sticker_id");



CREATE INDEX "idx_duplicates_user_id" ON "public"."sticker_duplicates" USING "btree" ("user_id");



CREATE INDEX "idx_players_name_trgm" ON "public"."players" USING "gin" ("name" "public"."gin_trgm_ops");



CREATE INDEX "idx_players_team_id" ON "public"."players" USING "btree" ("team_id");



CREATE INDEX "idx_shared_account_id" ON "public"."shared_collections" USING "btree" ("account_id");



CREATE INDEX "idx_shared_code" ON "public"."shared_collections" USING "btree" ("share_code");



CREATE INDEX "idx_shared_user_id" ON "public"."shared_collections" USING "btree" ("user_id");



CREATE INDEX "idx_stickers_album_id" ON "public"."stickers" USING "btree" ("album_id");



CREATE INDEX "idx_stickers_album_rarity" ON "public"."stickers" USING "btree" ("album_id", "rarity");



CREATE INDEX "idx_stickers_category_id" ON "public"."stickers" USING "btree" ("category_id");



CREATE INDEX "idx_stickers_code" ON "public"."stickers" USING "btree" ("code");



CREATE INDEX "idx_stickers_number" ON "public"."stickers" USING "btree" ("album_id", "number");



CREATE INDEX "idx_stickers_player_id" ON "public"."stickers" USING "btree" ("player_id");



CREATE INDEX "idx_stickers_rarity" ON "public"."stickers" USING "btree" ("rarity");



CREATE INDEX "idx_stickers_special" ON "public"."stickers" USING "btree" ("is_special") WHERE ("is_special" = true);



CREATE INDEX "idx_stickers_team_id" ON "public"."stickers" USING "btree" ("team_id");



CREATE INDEX "idx_teams_album_id" ON "public"."teams" USING "btree" ("album_id");



CREATE INDEX "idx_teams_confederation" ON "public"."teams" USING "btree" ("confederation_id");



CREATE INDEX "idx_user_stickers_account_id" ON "public"."user_stickers" USING "btree" ("account_id");



CREATE INDEX "idx_user_stickers_obtained" ON "public"."user_stickers" USING "btree" ("user_id", "obtained_at" DESC);



CREATE INDEX "idx_user_stickers_sticker_id" ON "public"."user_stickers" USING "btree" ("sticker_id");



CREATE INDEX "idx_user_stickers_user_id" ON "public"."user_stickers" USING "btree" ("user_id");



CREATE OR REPLACE TRIGGER "accounts_updated_at" BEFORE UPDATE ON "public"."accounts" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "albums_updated_at" BEFORE UPDATE ON "public"."albums" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "on_user_created_create_account" AFTER INSERT ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."create_personal_account"();



CREATE OR REPLACE TRIGGER "players_updated_at" BEFORE UPDATE ON "public"."players" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "shared_collections_updated_at" BEFORE UPDATE ON "public"."shared_collections" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "sticker_duplicates_updated_at" BEFORE UPDATE ON "public"."sticker_duplicates" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "stickers_updated_at" BEFORE UPDATE ON "public"."stickers" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "teams_updated_at" BEFORE UPDATE ON "public"."teams" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "user_stickers_updated_at" BEFORE UPDATE ON "public"."user_stickers" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "users_updated_at" BEFORE UPDATE ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."account_members"
    ADD CONSTRAINT "account_members_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."account_members"
    ADD CONSTRAINT "account_members_invited_by_fkey" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."account_members"
    ADD CONSTRAINT "account_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."players"
    ADD CONSTRAINT "players_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."shared_collections"
    ADD CONSTRAINT "shared_collections_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."shared_collections"
    ADD CONSTRAINT "shared_collections_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sticker_duplicates"
    ADD CONSTRAINT "sticker_duplicates_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sticker_duplicates"
    ADD CONSTRAINT "sticker_duplicates_sticker_id_fkey" FOREIGN KEY ("sticker_id") REFERENCES "public"."stickers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sticker_duplicates"
    ADD CONSTRAINT "sticker_duplicates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."stickers"
    ADD CONSTRAINT "stickers_album_id_fkey" FOREIGN KEY ("album_id") REFERENCES "public"."albums"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."stickers"
    ADD CONSTRAINT "stickers_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."stickers"
    ADD CONSTRAINT "stickers_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."stickers"
    ADD CONSTRAINT "stickers_sticker_type_id_fkey" FOREIGN KEY ("sticker_type_id") REFERENCES "public"."sticker_types"("id");



ALTER TABLE ONLY "public"."stickers"
    ADD CONSTRAINT "stickers_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."teams"
    ADD CONSTRAINT "teams_album_id_fkey" FOREIGN KEY ("album_id") REFERENCES "public"."albums"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."teams"
    ADD CONSTRAINT "teams_confederation_id_fkey" FOREIGN KEY ("confederation_id") REFERENCES "public"."confederations"("id");



ALTER TABLE ONLY "public"."user_stickers"
    ADD CONSTRAINT "user_stickers_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_stickers"
    ADD CONSTRAINT "user_stickers_sticker_id_fkey" FOREIGN KEY ("sticker_id") REFERENCES "public"."stickers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_stickers"
    ADD CONSTRAINT "user_stickers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Account members can create shared collection" ON "public"."shared_collections" FOR INSERT WITH CHECK ((("account_id" IN ( SELECT "public"."get_account_ids_for_user"() AS "get_account_ids_for_user")) AND ("user_id" = "auth"."uid"())));



CREATE POLICY "Account members can delete own duplicates" ON "public"."sticker_duplicates" FOR DELETE USING ((("account_id" IN ( SELECT "public"."get_account_ids_for_user"() AS "get_account_ids_for_user")) AND ("user_id" = "auth"."uid"())));



CREATE POLICY "Account members can delete own stickers" ON "public"."user_stickers" FOR DELETE USING ((("account_id" IN ( SELECT "public"."get_account_ids_for_user"() AS "get_account_ids_for_user")) AND ("user_id" = "auth"."uid"())));



CREATE POLICY "Account members can delete shared collection" ON "public"."shared_collections" FOR DELETE USING ((("account_id" IN ( SELECT "public"."get_account_ids_for_user"() AS "get_account_ids_for_user")) AND ("user_id" = "auth"."uid"())));



CREATE POLICY "Account members can insert duplicates" ON "public"."sticker_duplicates" FOR INSERT WITH CHECK ((("account_id" IN ( SELECT "public"."get_account_ids_for_user"() AS "get_account_ids_for_user")) AND ("user_id" = "auth"."uid"())));



CREATE POLICY "Account members can insert stickers" ON "public"."user_stickers" FOR INSERT WITH CHECK ((("account_id" IN ( SELECT "public"."get_account_ids_for_user"() AS "get_account_ids_for_user")) AND ("user_id" = "auth"."uid"())));



CREATE POLICY "Account members can update own duplicates" ON "public"."sticker_duplicates" FOR UPDATE USING ((("account_id" IN ( SELECT "public"."get_account_ids_for_user"() AS "get_account_ids_for_user")) AND ("user_id" = "auth"."uid"())));



CREATE POLICY "Account members can update own stickers" ON "public"."user_stickers" FOR UPDATE USING ((("account_id" IN ( SELECT "public"."get_account_ids_for_user"() AS "get_account_ids_for_user")) AND ("user_id" = "auth"."uid"())));



CREATE POLICY "Account members can update shared collection" ON "public"."shared_collections" FOR UPDATE USING ((("account_id" IN ( SELECT "public"."get_account_ids_for_user"() AS "get_account_ids_for_user")) AND ("user_id" = "auth"."uid"())));



CREATE POLICY "Account members can view duplicates" ON "public"."sticker_duplicates" FOR SELECT USING (("account_id" IN ( SELECT "public"."get_account_ids_for_user"() AS "get_account_ids_for_user")));



CREATE POLICY "Account members can view own shared collections" ON "public"."shared_collections" FOR SELECT USING (("account_id" IN ( SELECT "public"."get_account_ids_for_user"() AS "get_account_ids_for_user")));



CREATE POLICY "Account members can view stickers" ON "public"."user_stickers" FOR SELECT USING (("account_id" IN ( SELECT "public"."get_account_ids_for_user"() AS "get_account_ids_for_user")));



CREATE POLICY "Admins can delete members" ON "public"."account_members" FOR DELETE USING (("account_id" IN ( SELECT "account_members_1"."account_id"
   FROM "public"."account_members" "account_members_1"
  WHERE (("account_members_1"."user_id" = "auth"."uid"()) AND ("account_members_1"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text"]))))));



CREATE POLICY "Admins can manage members" ON "public"."account_members" FOR INSERT WITH CHECK (("account_id" IN ( SELECT "account_members_1"."account_id"
   FROM "public"."account_members" "account_members_1"
  WHERE (("account_members_1"."user_id" = "auth"."uid"()) AND ("account_members_1"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text"]))))));



CREATE POLICY "Admins can update members" ON "public"."account_members" FOR UPDATE USING (("account_id" IN ( SELECT "account_members_1"."account_id"
   FROM "public"."account_members" "account_members_1"
  WHERE (("account_members_1"."user_id" = "auth"."uid"()) AND ("account_members_1"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text"]))))));



CREATE POLICY "Anyone can view public shared collections" ON "public"."shared_collections" FOR SELECT USING (("is_public" = true));



CREATE POLICY "Authenticated users can delete categories" ON "public"."categories" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can delete stickers" ON "public"."stickers" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can delete teams" ON "public"."teams" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can insert stickers" ON "public"."stickers" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Authenticated users can insert teams" ON "public"."teams" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Authenticated users can manage categories" ON "public"."categories" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Authenticated users can read categories" ON "public"."categories" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can read stickers" ON "public"."stickers" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can read teams" ON "public"."teams" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can update categories" ON "public"."categories" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Authenticated users can update stickers" ON "public"."stickers" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Authenticated users can update teams" ON "public"."teams" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Members can view account" ON "public"."accounts" FOR SELECT USING (("id" IN ( SELECT "public"."get_account_ids_for_user"() AS "get_account_ids_for_user")));



CREATE POLICY "Members can view account members" ON "public"."account_members" FOR SELECT USING (("account_id" IN ( SELECT "public"."get_account_ids_for_user"() AS "get_account_ids_for_user")));



CREATE POLICY "Owner can update account" ON "public"."accounts" FOR UPDATE USING (("id" IN ( SELECT "account_members"."account_id"
   FROM "public"."account_members"
  WHERE (("account_members"."user_id" = "auth"."uid"()) AND ("account_members"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text"]))))));



CREATE POLICY "System can insert audit logs" ON "public"."audit_logs" FOR INSERT WITH CHECK (true);



CREATE POLICY "Users can insert own row" ON "public"."users" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can select own row" ON "public"."users" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can update own profile" ON "public"."users" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can update own row" ON "public"."users" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view own audit logs" ON "public"."audit_logs" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view own profile" ON "public"."users" FOR SELECT USING (("auth"."uid"() = "id"));



ALTER TABLE "public"."account_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."accounts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."albums" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."audit_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."confederations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."players" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."shared_collections" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sticker_duplicates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sticker_types" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_stickers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "service_role";






















































































































































GRANT ALL ON FUNCTION "public"."create_personal_account"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_personal_account"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_personal_account"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_share_code"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_share_code"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_share_code"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_account_ids_for_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_account_ids_for_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_account_ids_for_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_collection_progress"("p_account_id" "uuid", "p_album_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_collection_progress"("p_account_id" "uuid", "p_album_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_collection_progress"("p_account_id" "uuid", "p_album_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_auth_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_auth_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_auth_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "postgres";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "anon";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "service_role";



GRANT ALL ON FUNCTION "public"."show_limit"() TO "postgres";
GRANT ALL ON FUNCTION "public"."show_limit"() TO "anon";
GRANT ALL ON FUNCTION "public"."show_limit"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."show_limit"() TO "service_role";



GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "service_role";


















GRANT ALL ON TABLE "public"."account_members" TO "anon";
GRANT ALL ON TABLE "public"."account_members" TO "authenticated";
GRANT ALL ON TABLE "public"."account_members" TO "service_role";



GRANT ALL ON TABLE "public"."accounts" TO "anon";
GRANT ALL ON TABLE "public"."accounts" TO "authenticated";
GRANT ALL ON TABLE "public"."accounts" TO "service_role";



GRANT ALL ON TABLE "public"."albums" TO "anon";
GRANT ALL ON TABLE "public"."albums" TO "authenticated";
GRANT ALL ON TABLE "public"."albums" TO "service_role";



GRANT ALL ON TABLE "public"."audit_logs" TO "anon";
GRANT ALL ON TABLE "public"."audit_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."audit_logs" TO "service_role";



GRANT ALL ON TABLE "public"."categories" TO "anon";
GRANT ALL ON TABLE "public"."categories" TO "authenticated";
GRANT ALL ON TABLE "public"."categories" TO "service_role";



GRANT ALL ON TABLE "public"."confederations" TO "anon";
GRANT ALL ON TABLE "public"."confederations" TO "authenticated";
GRANT ALL ON TABLE "public"."confederations" TO "service_role";



GRANT ALL ON TABLE "public"."players" TO "anon";
GRANT ALL ON TABLE "public"."players" TO "authenticated";
GRANT ALL ON TABLE "public"."players" TO "service_role";



GRANT ALL ON TABLE "public"."shared_collections" TO "anon";
GRANT ALL ON TABLE "public"."shared_collections" TO "authenticated";
GRANT ALL ON TABLE "public"."shared_collections" TO "service_role";



GRANT ALL ON TABLE "public"."sticker_duplicates" TO "anon";
GRANT ALL ON TABLE "public"."sticker_duplicates" TO "authenticated";
GRANT ALL ON TABLE "public"."sticker_duplicates" TO "service_role";



GRANT ALL ON TABLE "public"."sticker_types" TO "anon";
GRANT ALL ON TABLE "public"."sticker_types" TO "authenticated";
GRANT ALL ON TABLE "public"."sticker_types" TO "service_role";



GRANT ALL ON TABLE "public"."stickers" TO "anon";
GRANT ALL ON TABLE "public"."stickers" TO "authenticated";
GRANT ALL ON TABLE "public"."stickers" TO "service_role";



GRANT ALL ON TABLE "public"."teams" TO "anon";
GRANT ALL ON TABLE "public"."teams" TO "authenticated";
GRANT ALL ON TABLE "public"."teams" TO "service_role";



GRANT ALL ON TABLE "public"."user_stickers" TO "anon";
GRANT ALL ON TABLE "public"."user_stickers" TO "authenticated";
GRANT ALL ON TABLE "public"."user_stickers" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































