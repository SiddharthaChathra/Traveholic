-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "email" TEXT,
    "password_hash" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "phone" TEXT,
    "avatar_url" TEXT,
    "role" TEXT NOT NULL,
    "traveller_type" TEXT DEFAULT 'normal',
    "bio" TEXT,
    "website" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "countries_count" INTEGER NOT NULL DEFAULT 0,
    "is_private" BOOLEAN NOT NULL DEFAULT false,
    "reset_otp" TEXT,
    "reset_otp_expiry" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "business_profiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "business_type" TEXT NOT NULL,
    "business_name" TEXT NOT NULL,
    "registration_number" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "website_url" TEXT,
    "booking_model" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "business_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "posts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caption" TEXT NOT NULL,
    "images" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "likes_count" INTEGER NOT NULL DEFAULT 0,
    "creator_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "vlogs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "views" TEXT NOT NULL,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "video_url" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "followers" TEXT NOT NULL,
    "is_verified" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "comments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "text" TEXT NOT NULL,
    "user" TEXT NOT NULL,
    "avatar_color" TEXT NOT NULL,
    "post_id" TEXT,
    "vlog_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "comments_vlog_id_fkey" FOREIGN KEY ("vlog_id") REFERENCES "vlogs" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "listings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "rating" REAL NOT NULL DEFAULT 5.0,
    "reviews_count" INTEGER NOT NULL DEFAULT 0,
    "location" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "business_profile_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "listings_business_profile_id_fkey" FOREIGN KEY ("business_profile_id") REFERENCES "business_profiles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "check_in" DATETIME NOT NULL,
    "check_out" DATETIME NOT NULL,
    "price" REAL NOT NULL,
    "guest_count" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'upcoming',
    "listing_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "bookings_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sender_id" TEXT NOT NULL,
    "receiver_id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "destinations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "full_name" TEXT NOT NULL,
    "visa_status" TEXT NOT NULL,
    "visa_details" TEXT NOT NULL,
    "visa_url" TEXT NOT NULL,
    "visa_time" TEXT NOT NULL,
    "visa_documents" TEXT NOT NULL,
    "exchange_rate" TEXT NOT NULL,
    "exchange_advice" TEXT NOT NULL,
    "card_acceptance" INTEGER NOT NULL,
    "flights" TEXT NOT NULL,
    "itinerary" TEXT NOT NULL,
    "attractions" TEXT NOT NULL,
    "food" TEXT NOT NULL,
    "souvenirs" TEXT NOT NULL,
    "weather_backup" TEXT NOT NULL,
    "emergency_contacts" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "follows" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "follower_id" TEXT NOT NULL,
    "following_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'accepted',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "follows_follower_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "follows_following_id_fkey" FOREIGN KEY ("following_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "post_likes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "post_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "post_likes_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "saved_posts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "saved_posts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "saved_posts_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "stories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "caption" TEXT,
    "expires_at" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "stories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "story_views" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "story_id" TEXT NOT NULL,
    "viewer_id" TEXT NOT NULL,
    "viewed_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "story_views_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "stories" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "actor_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "entity_id" TEXT,
    "message" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "highlights" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "cover_url" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "highlights_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "highlight_stories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "highlight_id" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "caption" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "highlight_stories_highlight_id_fkey" FOREIGN KEY ("highlight_id") REFERENCES "highlights" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "business_profiles_user_id_key" ON "business_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "follows_follower_id_following_id_key" ON "follows"("follower_id", "following_id");

-- CreateIndex
CREATE UNIQUE INDEX "post_likes_user_id_post_id_key" ON "post_likes"("user_id", "post_id");

-- CreateIndex
CREATE UNIQUE INDEX "saved_posts_user_id_post_id_key" ON "saved_posts"("user_id", "post_id");

-- CreateIndex
CREATE UNIQUE INDEX "story_views_story_id_viewer_id_key" ON "story_views"("story_id", "viewer_id");
