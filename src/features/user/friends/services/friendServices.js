import { supabase } from "../../../../utils/supabase";
import { createNotificationService } from "../../notification/services/notificationServices";
import { getBlockedUserIdsService } from "../../profile/services/profileServices";


export const sendFriendRequestService = async ({ senderId, receiverId }) => {
  const { data: requests, error } = await supabase
    .from("friends")
    .select("id, senderId, receiverId, status")
    .or(
      `and(senderId.eq.${senderId},receiverId.eq.${receiverId}),and(senderId.eq.${receiverId},receiverId.eq.${senderId})`,
    );

  if (error) throw error;

  const request = requests.find(
    (r) => r.senderId === senderId && r.receiverId === receiverId,
  );

  const opposite = requests.find(
    (r) => r.senderId === receiverId && r.receiverId === senderId,
  );

  if (request?.status === "accepted" || opposite?.status === "accepted")
    throw new Error("You are already friends with this user.");

  if (request?.status === "pending")
    throw new Error("Friend request is already pending.");

  if (opposite?.status === "pending")
    throw new Error("This user has already sent you a friend request.");

  const { data, error: insertError } = await supabase
    .from("friends")
    .insert({ senderId, receiverId, status: "pending" })
    .select()
    .single();

  if (insertError) throw insertError;

  await createNotificationService({
    userId: receiverId,
    senderId,
    type: "friendRequest",
    friendId: data.id,
  });

  return data;
};

export const acceptFriendRequestService = async (requestId, currentUserId) => {
  const { data, error } = await supabase
    .from("friends")
    .update({
      status: "accepted",
    })
    .eq("id", requestId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  await createNotificationService({
    userId: data.senderId,
    senderId: currentUserId,
    type: "friendRequestAccepted",
    friendId: data.id,
  });

  return data;
};

export const deleteFriendRequestService = async (requestId) => {
  const { error: deleteError } = await supabase
    .from("friends")
    .delete()
    .eq("id", requestId);

  if (deleteError) {
    throw deleteError;
  }
};

// Get sent pending requests
export const getSentFriendRequestsService = async (userId) => {
  const { data, error } = await supabase
    .from("friends")
    .select(
      `
      id,
      receiverId,
      status,
      created_at,
      profiles:profiles!friends_receiverId_fkey (
        id,
        username,
        profileImage
      )
    `,
    )
    .eq("senderId", userId)
    .eq("status", "pending")
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return data;
};

// Get received pending requests
export const getFriendRequestsService = async (userId) => {
  const { data, error } = await supabase
    .from("friends")
    .select(
      `
      id,
      created_at,
      senderId,
      receiverId,

      sender:profiles!friends_senderId_fkey (
        id,
        username,
        profileImage
      )
    `,
    )
    .eq("receiverId", userId)
    .eq("status", "pending")
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return data;
};

export const getFriendsService = async (userId) => {
  const { data, error } = await supabase
    .from("friends")
    .select(
      `
      id,
      senderId,
      receiverId,
      status,
      sender:senderId (
        id,
        username,
        profileImage
      ),
      receiver:receiverId (
        id,
        username,
        profileImage
      )
    `,
    )
    .eq("status", "accepted")
    .or(`senderId.eq.${userId},receiverId.eq.${userId}`);

  if (error) throw error;

  const blockedUserIds = await getBlockedUserIdsService(userId);

  return data
    .map((friend) => {
      const friendUser =
        String(friend.senderId) === String(userId)
          ? friend.receiver
          : friend.sender;

      return {
        ...friendUser,
        friendshipId: friend.id,
      };
    })
    .filter((friend) => !blockedUserIds.includes(friend.id));
};

export const getAllUsersService = async (currentUserId) => {
  const { data, error } = await supabase
    .from("profiles")
    .select(
      `
      id,
      username,
      profileImage,
      isAdmin
    `,
    )
    .neq("id", currentUserId)
    .order("username", {
      ascending: true,
    });

  if (error) {
    throw error;
  }

  return data;
};

export const getFriendStatusService = async (currentUserId, profileUserId) => {
  const { data, error } = await supabase
    .from("friends")
    .select("id, senderId, receiverId, status")
    .or(
      `and(senderId.eq.${currentUserId},receiverId.eq.${profileUserId}),and(senderId.eq.${profileUserId},receiverId.eq.${currentUserId})`,
    )
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return {
      status: "none",
      requestId: null,
    };
  }

  if (data.status === "accepted") {
    return {
      status: "friends",
      requestId: data.id,
    };
  }

  if (
    data.status === "pending" &&
    String(data.senderId) === String(currentUserId)
  ) {
    return {
      status: "sent",
      requestId: data.id,
    };
  }

  if (
    data.status === "pending" &&
    String(data.receiverId) === String(currentUserId)
  ) {
    return {
      status: "received",
      requestId: data.id,
    };
  }

  return {
    status: "none",
    requestId: null,
  };
};
