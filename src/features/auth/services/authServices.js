import { supabase } from "../../../utils/supabase";

export const signupService = async (username, email, password) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  const user = data.user;

  if (!user) {
    throw new Error("User was not created.");
  }

  const { error: profileError } = await supabase.from("profiles").insert({
    id: user.id,
    username: username,
  });

  if (profileError) {
    throw profileError;
  }

  return data;
};

export const loginService = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  const user = data.user;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(
      "isAdmin, isSuspended, suspensionType, suspensionReason, suspendedUntil",
    )
    .eq("id", user.id)
    .single();

  if (profileError) {
    await supabase.auth.signOut();
    throw profileError;
  }

  // Account is suspended
  if (profile?.isSuspended) {
    return {
      ...data,
      isSuspended: true,
      suspensionType: profile.suspensionType,
      suspensionReason: profile.suspensionReason,
      suspendedUntil: profile.suspendedUntil,
      isAdmin: false,
    };
  }

  return {
    ...data,
    isAdmin: profile?.isAdmin || false,
    isSuspended: false,
  };
};

export const logoutService = async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
};

export const getCurrentUserService = async () => {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  return data.user;
};
