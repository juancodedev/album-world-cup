CREATE TABLE IF NOT EXISTS "public"."exchange_offers" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "from_user_id" "uuid" NOT NULL,
    "from_account_id" "uuid" NOT NULL,
    "offered_sticker_id" "uuid" NOT NULL,
    "requested_sticker_id" "uuid",
    "status" "text" DEFAULT 'pending' NOT NULL,
    "accepted_by" "uuid",
    "accepted_account_id" "uuid",
    "message" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "exchange_offers_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'accepted'::"text", 'rejected'::"text", 'cancelled'::"text", 'completed'::"text"])))
);

ALTER TABLE "public"."exchange_offers" OWNER TO "postgres";

ALTER TABLE ONLY "public"."exchange_offers"
    ADD CONSTRAINT "exchange_offers_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."exchange_offers"
    ADD CONSTRAINT "exchange_offers_from_user_id_fkey" FOREIGN KEY ("from_user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."exchange_offers"
    ADD CONSTRAINT "exchange_offers_from_account_id_fkey" FOREIGN KEY ("from_account_id") REFERENCES "public"."accounts"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."exchange_offers"
    ADD CONSTRAINT "exchange_offers_offered_sticker_id_fkey" FOREIGN KEY ("offered_sticker_id") REFERENCES "public"."stickers"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."exchange_offers"
    ADD CONSTRAINT "exchange_offers_requested_sticker_id_fkey" FOREIGN KEY ("requested_sticker_id") REFERENCES "public"."stickers"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."exchange_offers"
    ADD CONSTRAINT "exchange_offers_accepted_by_fkey" FOREIGN KEY ("accepted_by") REFERENCES "public"."users"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."exchange_offers"
    ADD CONSTRAINT "exchange_offers_accepted_account_id_fkey" FOREIGN KEY ("accepted_account_id") REFERENCES "public"."accounts"("id") ON DELETE SET NULL;

CREATE INDEX "idx_exchange_offers_status" ON "public"."exchange_offers" ("status");
CREATE INDEX "idx_exchange_offers_from_user" ON "public"."exchange_offers" ("from_user_id");
CREATE INDEX "idx_exchange_offers_from_account" ON "public"."exchange_offers" ("from_account_id");

-- Enable RLS
ALTER TABLE "public"."exchange_offers" ENABLE ROW LEVEL SECURITY;

-- RLS: everyone authenticated can read all pending offers
CREATE POLICY "Anyone authenticated can read exchange offers"
    ON "public"."exchange_offers"
    FOR SELECT
    TO authenticated
    USING (true);

-- RLS: users can create their own offers
CREATE POLICY "Users can create their own offers"
    ON "public"."exchange_offers"
    FOR INSERT
    TO authenticated
    WITH CHECK ((select auth.uid()) = from_user_id);

-- RLS: users can update their own offers
CREATE POLICY "Users can update their own offers"
    ON "public"."exchange_offers"
    FOR UPDATE
    TO authenticated
    USING ((select auth.uid()) = from_user_id)
    WITH CHECK ((select auth.uid()) = from_user_id);
