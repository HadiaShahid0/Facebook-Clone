import { supabase } from "../../../utils/supabase";

export const getTotalUsersService = async () => {
  const { count, error } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true });

  if (error) {
    throw error;
  }

  return count || 0;
};

export const getTotalReportsService = async () => {
  const { count, error } = await supabase
    .from("userReport")
    .select("id", { count: "exact", head: true });

  if (error) {
    throw error;
  }

  return count || 0;
};

export const getPendingReportsService = async () => {
  const { count, error } = await supabase
    .from("userReport")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");

  if (error) {
    throw error;
  }

  return count || 0;
};

export const getTotalSuspendedUsersService = async () => {
  const { count, error } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("isSuspended", true);

  if (error) {
    throw error;
  }

  return count || 0;
};

export const getSuspendedUsersService = async () => {
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, username, profileImage, isSuspended, suspensionType, suspensionReason, suspendedAt,suspendedUntil",
    )
    .eq("isSuspended", true)
    .order("suspendedAt", { ascending: false });

  if (error) {
    throw error;
  }

  return data;
};

export const getReportsService = async () => {
  const { data, error } = await supabase
    .from("userReport")
    .select(
      `
      id,
      reporterId,
      reportedUserId,
      category,
      reason,
      description,
      status,
      created_at,

      reporter:profiles!userreport_reporterid_fkey (
        id,
        username,
        profileImage
      ),

      reportedUser:profiles!userreport_reporteduserid_fkey (
        id,
        username,
        profileImage,
        isSuspended,
        suspensionType,
        suspensionReason,
        suspendedUntil
      )
    `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
};

// Combine reports by reported user
export const getReportedUsersService = async () => {
  const reports = await getReportsService();

  const users = {};

  reports.forEach((report) => {
    if (!users[report.reportedUserId]) {
      users[report.reportedUserId] = {
        reportedUser: report.reportedUser,
        reports: [],
        count: 0,
      };
    }

    users[report.reportedUserId].reports.push(report);
    users[report.reportedUserId].count++;
  });

  return Object.values(users);
};

// Get recent reported users
export const getRecentReportedUsersService = async () => {
  const users = await getReportedUsersService();

  return users.slice(0, 5);
};

export const getCurrentAdminService = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Admin not found.");
  }

  return user;
};

export const getUserModerationActionService = async (userId) => {
  const { data, error } = await supabase
    .from("moderationAction")
    .select("action, reason, createdAt")
    .eq("userId", userId)
    .order("createdAt", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
};

export const updateReportStatusService = async (userId, status) => {
  const { error } = await supabase
    .from("userReport")
    .update({
      status: status,
    })
    .eq("reportedUserId", userId)
    .eq("status", "pending");

  if (error) {
    throw error;
  }
};

export const dismissReportsService = async (userId, reason) => {
  const admin = await getCurrentAdminService();

  await updateReportStatusService(userId, "dismissed");

  const { error: actionError } = await supabase
    .from("moderationAction")
    .insert({
      userId,
      adminId: admin.id,
      action: "dismiss_report",
      reason,
    });

  if (actionError) {
    throw actionError;
  }
};

export const temporarySuspendUserService = async (
  userId,
  reason,
  suspendedUntil,
) => {
  const admin = await getCurrentAdminService();

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      isSuspended: true,
      suspensionType: "temporary",
      suspensionReason: reason,
      suspendedAt: new Date().toISOString(),
      suspendedUntil,
    })
    .eq("id", userId);

  if (profileError) {
    throw profileError;
  }
  await updateReportStatusService(userId, "action_taken");

  const { error: actionError } = await supabase
    .from("moderationAction")
    .insert({
      userId,
      adminId: admin.id,
      action: "temporary_suspend",
      reason,
    });

  if (actionError) {
    throw actionError;
  }
};

export const permanentSuspendUserService = async (userId, reason) => {
  const admin = await getCurrentAdminService();

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      isSuspended: true,
      suspensionType: "permanent",
      suspensionReason: reason,
      suspendedAt: new Date().toISOString(),
      suspendedUntil: null,
    })
    .eq("id", userId);

  if (profileError) {
    throw profileError;
  }
  await updateReportStatusService(userId, "action_taken");

  const { error: actionError } = await supabase
    .from("moderationAction")
    .insert({
      userId,
      adminId: admin.id,
      action: "permanent_suspend",
      reason,
    });

  if (actionError) {
    throw actionError;
  }
};

export const restoreUserService = async (userId, reason) => {
  const admin = await getCurrentAdminService();

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      isSuspended: false,
      suspensionType: null,
      suspensionReason: null,
      suspendedAt: null,
      suspendedUntil: null,
    })
    .eq("id", userId);

  if (profileError) {
    throw profileError;
  }
  await updateReportStatusService(userId, "reviewed");

  const { error: actionError } = await supabase
    .from("moderationAction")
    .insert({
      userId,
      adminId: admin.id,
      action: "restore_account",
      reason,
    });

  if (actionError) {
    throw actionError;
  }
};

export const getAllUsersService = async () => {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, profileImage, isAdmin, isSuspended")
    .order("username");

  if (error) {
    throw error;
  }

  return data;
};
