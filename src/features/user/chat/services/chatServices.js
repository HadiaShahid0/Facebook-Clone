import { supabase } from "../../../../utils/supabase";
import { createNotificationService } from "../../notification/services/notificationServices";
import { getBlockedUserIdsService } from "../../profile/services/profileServices";

export const checkFriendshipService = async (myId, userId) => {
  const { data, error } = await supabase
    .from("friends")
    .select("id")
    .eq("status", "accepted")
    .or(
      `and(senderId.eq.${myId},receiverId.eq.${userId}),and(senderId.eq.${userId},receiverId.eq.${myId})`,
    )
    .maybeSingle();

  if (error) {
    throw error;
  }

  return !!data;
};

export const createMessageRequestService = async (senderId, receiverId) => {
  const blockedUserIds = await getBlockedUserIdsService(senderId);

  if (blockedUserIds.includes(receiverId)) {
    throw new Error("You cannot message this user.");
  }

  const { data, error } = await supabase
    .from("messageRequests")
    .insert({
      senderId,
      receiverId,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const acceptMessageRequestService = async (requestId) => {
  const { data, error } = await supabase
    .from("messageRequests")
    .update({
      status: "accepted",
    })
    .eq("id", requestId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const rejectMessageRequestService = async (requestId) => {
  const { error } = await supabase
    .from("messageRequests")
    .update({
      status: "rejected",
    })
    .eq("id", requestId);

  if (error) {
    throw error;
  }
};

export const sendMessageService = async (myId, userId, text) => {
  const blockedUserIds = await getBlockedUserIdsService(myId);

  if (blockedUserIds.includes(userId)) {
    throw new Error("You cannot message this user.");
  }

  const isFriend = await checkFriendshipService(myId, userId);

  let request = null;
  let isNewRequest = false;

  if (!isFriend) {
    request = await getMessageRequestBetweenUsersService(myId, userId);

    if (!request) {
      request = await createMessageRequestService(myId, userId);
      isNewRequest = true;
    }

    if (request.status === "rejected") {
      throw new Error("This message request was rejected.");
    }

    if (request.status === "pending" && request.receiverId === myId) {
      throw new Error("Please accept the message request first.");
    }
  }

  const { data, error } = await supabase
    .from("messages")
    .insert({
      senderId: myId,
      receiverId: userId,
      text,
      messageRequestId: request?.id || null,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  if (isFriend) {
    await createNotificationService({
      userId,
      senderId: myId,
      type: "message",
    });
  }

  if (isNewRequest) {
    await createNotificationService({
      userId,
      senderId: myId,
      type: "messageRequest",
    });
  }

  return data;
};

export const getChatUsersService = async (userId) => {
  const blockedUserIds = await getBlockedUserIdsService(userId);

  const { data: friends, error: friendsError } = await supabase
    .from("friends")
    .select(
      `
      id,
      senderId,
      receiverId,
      sender:profiles!friends_senderId_fkey (
        id,
        username,
        profileImage
      ),
      receiver:profiles!friends_receiverId_fkey (
        id,
        username,
        profileImage
      )
    `,
    )
    .eq("status", "accepted")
    .or(`senderId.eq.${userId},receiverId.eq.${userId}`);

  if (friendsError) {
    throw friendsError;
  }

  const { data: sentMessages, error: messagesError } = await supabase
    .from("messages")
    .select(
      `
      receiverId,
      receiver:profiles!messages_receiverid_fkey (
        id,
        username,
        profileImage
      )
    `,
    )
    .eq("senderId", userId);

  if (messagesError) {
    throw messagesError;
  }

  const friendUsers = friends.map((friend) => {
    if (friend.senderId === userId) {
      return friend.receiver;
    }

    return friend.sender;
  });

  const messageUsers = sentMessages.map((message) => message.receiver);

  const allUsers = [...friendUsers, ...messageUsers];

  const uniqueUsers = allUsers
    .filter(
      (user, index, array) =>
        user && array.findIndex((item) => item.id === user.id) === index,
    )
    .filter((user) => !blockedUserIds.includes(user.id));

  return uniqueUsers;
};

export const getMessageRequestsService = async (userId) => {
  const blockedUserIds = await getBlockedUserIdsService(userId);

  const { data, error } = await supabase
    .from("messageRequests")
    .select(
      `
      id,
      senderId,
      receiverId,
      status,
      created_at,
      sender:profiles!messagerequests_senderid_fkey (
        id,
        username,
        profileImage
      )
    `,
    )
    .eq("receiverId", userId)
    .in("status", ["pending", "rejected"])
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return data.filter((request) => !blockedUserIds.includes(request.sender?.id));
};

export const getMessageRequestBetweenUsersService = async (myId, userId) => {
  const blockedUserIds = await getBlockedUserIdsService(myId);

  if (blockedUserIds.includes(userId)) {
    return null;
  }

  const { data, error } = await supabase
    .from("messageRequests")
    .select("*")
    .or(
      `and(senderId.eq.${myId},receiverId.eq.${userId}),and(senderId.eq.${userId},receiverId.eq.${myId})`,
    )
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
};

export const getMessagesService = async (myId, userId) => {
  const blockedUserIds = await getBlockedUserIdsService(myId);

  if (blockedUserIds.includes(userId)) {
    return [];
  }

  const { data, error } = await supabase
    .from("messages")
    .select(
      `
      id,
      senderId,
      receiverId,
      text,
      created_at,
      messageRequestId
    `,
    )
    .or(
      `and(senderId.eq.${myId},receiverId.eq.${userId}),and(senderId.eq.${userId},receiverId.eq.${myId})`,
    )
    .order("created_at", {
      ascending: true,
    });

  if (error) {
    throw error;
  }

  return data;
};

export const getUnreadMessageCountsService = async (userId) => {
  const blockedUserIds = await getBlockedUserIdsService(userId);

  const { data, error } = await supabase
    .from("notification")
    .select("senderId")
    .eq("userId", userId)
    .eq("isRead", false)
    .in("type", ["message", "messageRequest"]);

  if (error) {
    throw error;
  }

  const counts = {};

  data.forEach((notification) => {
    if (blockedUserIds.includes(notification.senderId)) {
      return;
    }

    counts[notification.senderId] = (counts[notification.senderId] || 0) + 1;
  });

  return counts;
};

export const markMessageNotificationsReadService = async (userId, senderId) => {
  const { error } = await supabase
    .from("notification")
    .update({
      isRead: true,
    })
    .eq("userId", userId)
    .eq("senderId", senderId)
    .eq("isRead", false)
    .in("type", ["message", "messageRequest"]);

  if (error) {
    throw error;
  }
};
