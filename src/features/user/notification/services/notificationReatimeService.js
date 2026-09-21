import { supabase } from "../../../../utils/supabase";

export const subscribeToNotificationChangesServices = (
  userId,
  callback,
) => {
  // 1. Create the channel and register the listener first
  const channel = supabase
    .channel(`notification-realtime-${userId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notification",
        filter: `userId=eq.${userId}`,
      },
      (payload) => {
        console.log("New notification:", payload);
        callback(payload);
      },
    );

  // 2. Call subscribe separately so it initiates the connection
  channel.subscribe((status) => {
    console.log("Notification realtime status:", status);
  });

  // 3. Return the original channel object so your cleanups work correctly
  return channel;
};
