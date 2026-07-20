ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_author_id_fkey;
ALTER TABLE public.posts ADD CONSTRAINT posts_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.comments DROP CONSTRAINT IF EXISTS comments_author_id_fkey;
ALTER TABLE public.comments ADD CONSTRAINT comments_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.post_likes DROP CONSTRAINT IF EXISTS post_likes_user_id_fkey;
ALTER TABLE public.post_likes ADD CONSTRAINT post_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.stories DROP CONSTRAINT IF EXISTS stories_user_id_fkey;
ALTER TABLE public.stories ADD CONSTRAINT stories_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.follows DROP CONSTRAINT IF EXISTS follows_follower_id_fkey;
ALTER TABLE public.follows ADD CONSTRAINT follows_follower_id_fkey FOREIGN KEY (follower_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.follows DROP CONSTRAINT IF EXISTS follows_following_id_fkey;
ALTER TABLE public.follows ADD CONSTRAINT follows_following_id_fkey FOREIGN KEY (following_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_actor_id_fkey;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;
ALTER TABLE public.messages ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_receiver_id_fkey;
ALTER TABLE public.messages ADD CONSTRAINT messages_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.users(id) ON DELETE CASCADE;
