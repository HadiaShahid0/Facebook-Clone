import { supabase } from "../../../../utils/supabase";

export const subscribeToNewPosts = (callback) => {
  const channel = supabase
    .channel("post-realtime")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "post",
      },
      (payload) => {
        callback(payload.new);
      },
    )
    .subscribe();

  return channel;
};

export const subscribeToPostComments = (postId, callback) => {
  const channel = supabase
    .channel(`post-comments-${postId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "comment",
        filter: `postId=eq.${postId}`,
      },
      (payload) => {
        console.log("Realtime new comment:", payload.new);

        callback(payload.new);
      }
    )
    .subscribe((status) => {
      console.log(`Post ${postId} comments realtime:`, status);
    });

  return channel;
};

export const subscribeToPostLikes = (callback) => {
  const channel = supabase.channel("post-likes-realtime");

  channel.on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "like",
    },
    (payload) => {

      callback(payload.new);
    }
  );

  channel.subscribe((status) => {
    console.log("Post likes realtime:", status);
  });

  return channel;
};