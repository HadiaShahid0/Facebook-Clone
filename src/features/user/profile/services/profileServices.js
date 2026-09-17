import { supabase } from "../../../../utils/supabase";
import { getCurrentAdminService } from "../../../admin/services/adminServices";
import { createNotificationService } from "../../notification/services/notificationServices";

//PROFILE SERVICES
export const getProfileService = async (userId) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const updateProfileService = async (userId, updates) => {
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const uploadCoverImageService = async (userId, file) => {
  const fileExtension = file.name.split(".").pop();

  const fileName = `${userId}-${Date.now()}.${fileExtension}`;

  const filePath = `covers/${fileName}`;

  const { error } = await supabase.storage
    .from("profileCover")
    .upload(filePath, file);

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from("profileCover").getPublicUrl(filePath);

  return data.publicUrl;
};

export const uploadProfileImageService = async (userId, file) => {
  const fileExtension = file.name.split(".").pop();

  const fileName = `${userId}-${Date.now()}.${fileExtension}`;

  const filePath = `profiles/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("profileImage")
    .upload(filePath, file);

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage.from("profileImage").getPublicUrl(filePath);
  return data.publicUrl;
};

//BLOCK SERVICES
export const blockUserService = async (userId, blockedUserId) => {
  const { error: blockError } = await supabase.from("blockedUser").insert({
    userId,
    blockedUserId,
  });

  if (blockError) throw blockError;

  const { error: friendError } = await supabase
    .from("friends")
    .delete()
    .or(
      `and(senderId.eq.${userId},receiverId.eq.${blockedUserId}),and(senderId.eq.${blockedUserId},receiverId.eq.${userId})`,
    );

  if (friendError) throw friendError;
};

export const getBlockedUserIdsService = async (userId) => {
  const { data, error } = await supabase
    .from("blockedUser")
    .select("userId, blockedUserId")
    .or(`userId.eq.${userId},blockedUserId.eq.${userId}`);

  if (error) throw error;

  const blockedUserIds = new Set();

  data.forEach((block) => {
    if (String(block.userId) === String(userId)) {
      blockedUserIds.add(block.blockedUserId);
    } else {
      blockedUserIds.add(block.userId);
    }
  });

  return [...blockedUserIds];
};

export const unblockUserService = async (userId, blockedUserId) => {
  const { error } = await supabase
    .from("blockedUser")
    .delete()
    .eq("userId", userId)
    .eq("blockedUserId", blockedUserId);

  if (error) throw error;
};

export const getBlockedUsersService = async (userId) => {
  const { data, error } = await supabase
    .from("blockedUser")
    .select(
      `
      blockedUserId,
      profiles!blockedUser_blockedUserId_fkey (
        id,
        username,
        profileImage
      )
    `,
    )
    .eq("userId", userId);

  if (error) throw error;

  return data
    .map((item) => item.profiles)
    .filter((user) => user && String(user.id) !== String(userId));
};


//REPORT SERVICES
export const reportUserService = async ({
  reporterId,
  reportedUserId,
  category,
  reason,
  description,
}) => {
  const { error: reportError } = await supabase.from("userReport").insert({
    reporterId,
    reportedUserId,
    category,
    reason,
    description: description || null,
  });

  if (reportError) {
    // 23505 = duplicate key value
    if (reportError.code === "23505") {
      throw new Error("You have already reported this user.");
    }

    throw reportError;
  }

  const { data: admin, error: adminError } = await supabase
    .from("profiles")
    .select("id")
    .eq("isAdmin", true)
    .limit(1)
    .single();

  if (adminError) {
    throw adminError;
  }

  await createNotificationService({
    userId: admin.id,
    senderId: reporterId,
    type: "userReport",
  });

  const { error: suspendError } = await supabase.rpc("check_and_suspend_user", {
    reported_user_id: reportedUserId,
  });

  if (suspendError) {
    throw suspendError;
  }
};
