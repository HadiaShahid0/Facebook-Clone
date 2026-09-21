import { supabase } from "../../../../utils/supabase";

export const subscribeToFriendChangesServices = (callback) => {
  const channel = supabase
    .channel("friend-realtime")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "friends",
      },
      (payload) => {
        console.log("Friend realtime event:", payload);
        callback(payload);
      },
    )
    .subscribe((status) => {
      console.log("Friend realtime status:", status);
    });
  return channel;
};
