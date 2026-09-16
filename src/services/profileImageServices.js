export const getAvatarUrl = (user) => {
  if (user?.profileImage) {
    return user.profileImage;
  }
  if (!user?.username) {
    return null;
  }
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=random&color=fff`;
};
