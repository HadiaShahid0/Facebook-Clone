import { supabase } from "../../../../utils/supabase";

export const getNotificationsService = async (userId) => {
  const { data, error } = await supabase
    .from("notification")
    .select(
      `
      *,
      profiles!notification_senderId_fkey (
        id,
        username,
        profileImage
      )
    `,
    )
    .eq("userId", userId)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return data;
};

export const getNotificationByIdService = async (notificationId) => {
  const { data, error } = await supabase
    .from("notification")
    .select(
      `
      *,
      profiles!notification_senderId_fkey (
        id,
        username,
        profileImage
      )
    `,
    )
    .eq("id", notificationId)
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const markNotificationReadService = async (notificationId) => {
  const { error } = await supabase
    .from("notification")
    .update({
      isRead: true,
    })
    .eq("id", notificationId);

  if (error) {
    throw error;
  }
};

export const markAllNotificationsReadService = async (userId) => {
  const { error } = await supabase
    .from("notification")
    .update({
      isRead: true,
    })
    .eq("userId", userId)
    .eq("isRead", false);

  if (error) {
    throw error;
  }
};

export const createNotificationService = async ({
  userId,
  senderId,
  type,
  postId = null,
  friendId = null,
}) => {
  const { data, error } = await supabase
    .from("notification")
    .insert({
      userId,
      senderId,
      type,
      postId,
      friendId,
      isRead: false,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};
