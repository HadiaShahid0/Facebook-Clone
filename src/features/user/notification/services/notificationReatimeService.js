import { supabase } from "../../../../utils/supabase";

export const subscribeToNotificationChanges = (callback) => {
  const channel = supabase
    .channel("notification-realtime")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notification",
      },
      (payload) => {
        console.log("New notification:", payload);

        callback(payload);
      },
    )
    .subscribe((status) => {
      console.log("Notification realtime status:", status);
    });

  return channel;
};