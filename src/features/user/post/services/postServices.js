import { supabase } from "../../../../utils/supabase";
import { createNotificationService } from "../../notification/services/notificationServices";
import { getBlockedUserIdsService } from "../../profile/services/profileServices";

//Add like count, comment count, and current user's like status to posts.
const addPostEngagementData = async (posts, currentUserId) => {
  if (!posts.length) {
    return [];
  }

  const postIds = posts.map((post) => post.id);

  const { data: likes, error: likesError } = await supabase
    .from("like")
    .select("postId, userId")
    .in("postId", postIds);

  if (likesError) {
    throw likesError;
  }

  const { data: comments, error: commentsError } = await supabase
    .from("comment")
    .select("postId")
    .in("postId", postIds);

  if (commentsError) {
    throw commentsError;
  }

  const likeCounts = {};

  likes.forEach((like) => {
    likeCounts[like.postId] = (likeCounts[like.postId] || 0) + 1;
  });

  const commentCounts = {};

  comments.forEach((comment) => {
    commentCounts[comment.postId] = (commentCounts[comment.postId] || 0) + 1;
  });

  const likedPostIds = new Set(
    currentUserId
      ? likes
          .filter((like) => like.userId === currentUserId)
          .map((like) => like.postId)
      : [],
  );

  return posts.map((post) => ({
    ...post,
    likeCount: likeCounts[post.id] || 0,
    commentCount: commentCounts[post.id] || 0,
    likedByMe: likedPostIds.has(post.id),
  }));
};

//POST SERVICES
export const getPostsService = async (userId, from = 0, to = 9) => {
  const blockedUserIds = await getBlockedUserIdsService(userId);

  const { data, error } = await supabase
    .from("post")
    .select(
      `
      *,
      profiles (
        id,
        username,
        profileImage,
        isSuspended
      )
    `,
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw error;
  }

  return data.filter(
    (post) =>
      !blockedUserIds.includes(post.userId) && !post.profiles?.isSuspended,
  );
};

export const getSinglePostService = async (postId, userId) => {
  const { data: post, error } = await supabase
    .from("post")
    .select(
      `
      *,
      profiles (
        id,
        username,
        profileImage,
        isSuspended
      )
    `,
    )
    .eq("id", postId)
    .single();

  if (error) {
    throw error;
  }
  if(post.profiles?.isSuspended) return null;
  
  const posts = await addPostEngagementData([post], userId);

  return posts[0];
};

export const createPostService = async ({
  userId,
  content,
  imageUrl,
  postVisibility,
}) => {
  const { data, error } = await supabase
    .from("post")
    .insert({
      userId,
      content,
      imageUrl,
      visibility: postVisibility,
    })
    .select(
      `
      *,
      profiles (
        id,
        username,
        profileImage
      )
    `,
    )
    .single();

  if (error) {
    throw error;
  }

  const { data: friends, error: friendsError } = await supabase
    .from("friends")
    .select("senderId, receiverId")
    .eq("status", "accepted")
    .or(`senderId.eq.${userId},receiverId.eq.${userId}`);

  if (friendsError) {
    throw friendsError;
  }

  const friendIds = friends.map((friend) => {
    if (friend.senderId === userId) {
      return friend.receiverId;
    }

    return friend.senderId;
  });

  if (friendIds.length > 0) {
    await Promise.all(
      friendIds.map((friendId) =>
        createNotificationService({
          userId: friendId,
          senderId: userId,
          type: "newPost",
          postId: data.id,
        }),
      ),
    );
  }

  return {
    ...data,
    likeCount: 0,
    commentCount: 0,
    likedByMe: false,
  };
};

export const uploadPostImageService = async (userId, file) => {
  const fileExtension = file.name.split(".").pop();

  const fileName = `${userId}-${Date.now()}.${fileExtension}`;

  const filePath = `posts/${fileName}`;

  const { error } = await supabase.storage.from("posts").upload(filePath, file);

  if (error) throw error;

  const { data } = supabase.storage.from("posts").getPublicUrl(filePath);

  return data.publicUrl;
};


//LIKE SERVICES
export const likePostService = async (postId, userId) => {
  const { data: post, error: postError } = await supabase
    .from("post")
    .select("userId")
    .eq("id", postId)
    .single();

  if (postError) {
    throw postError;
  }

  const { error: likeError } = await supabase.from("like").insert({
    postId,
    userId,
  });

  if (likeError) {
    throw likeError;
  }

  if (post.userId !== userId) {
    await createNotificationService({
      userId: post.userId,
      senderId: userId,
      type: "like",
      postId,
    });
  }
};

export const unlikePostService = async (postId, userId) => {
  const { error } = await supabase
    .from("like")
    .delete()
    .eq("postId", postId)
    .eq("userId", userId);

  if (error) throw error;
};


//COMMENT SERVICES
export const getCommentsService = async (postId, currentUserId) => {
  const { data: comments, error: commentsError } = await supabase
    .from("comment")
    .select(
      `
      *,
      profiles (
        id,
        username,
        profileImage
      )
    `,
    )
    .eq("postId", postId)
    .order("created_at", {
      ascending: true,
    });

  if (commentsError) {
    throw commentsError;
  }

  if (!comments.length) {
    return [];
  }

  const commentIds = comments.map((comment) => comment.id);

  const { data: likes, error: likesError } = await supabase
    .from("commentLike")
    .select("commentId, userId")
    .in("commentId", commentIds);

  if (likesError) {
    throw likesError;
  }

  const likeCounts = {};

  likes.forEach((like) => {
    likeCounts[like.commentId] = (likeCounts[like.commentId] || 0) + 1;
  });

  const likedCommentIds = new Set(
    currentUserId
      ? likes
          .filter((like) => like.userId === currentUserId)
          .map((like) => like.commentId)
      : [],
  );

  return comments.map((comment) => ({
    ...comment,
    likeCount: likeCounts[comment.id] || 0,
    likedByMe: likedCommentIds.has(comment.id),
  }));
};

export const addCommentService = async ({
  postId,
  userId,
  content,
  parentId = null,
}) => {
  const { data: post, error: postError } = await supabase
    .from("post")
    .select("userId")
    .eq("id", postId)
    .single();

  if (postError) {
    throw postError;
  }

  const { data, error } = await supabase
    .from("comment")
    .insert({
      postId,
      userId,
      content,
      parentId,
    })
    .select(
      `
      *,
      profiles (
        id,
        username,
        profileImage
      )
    `,
    )
    .single();

  if (error) {
    throw error;
  }

  if (post.userId !== userId) {
    await createNotificationService({
      userId: post.userId,
      senderId: userId,
      type: "comment",
      postId,
    });
  }

  return data;
};

export const likeCommentService = async (commentId, userId) => {
  const { data: comment, error: commentError } = await supabase
    .from("comment")
    .select("userId, postId")
    .eq("id", commentId)
    .single();

  if (commentError) {
    throw commentError;
  }

  const { error: likeError } = await supabase.from("commentLike").insert({
    commentId,
    userId,
  });

  if (likeError) {
    throw likeError;
  }

  if (comment.userId !== userId) {
    await createNotificationService({
      userId: comment.userId,
      senderId: userId,
      type: "likeComment",
      postId: comment.postId,
    });
  }
};

export const unlikeCommentService = async (commentId, userId) => {
  const { data, error } = await supabase
    .from("commentLike")
    .delete()
    .eq("commentId", commentId)
    .eq("userId", userId)
    .select();

  if (error) {
    throw error;
  }

  return data;
};

export const getUserPostsService = async (profileUserId, currentUserId) => {
  const { data: posts, error: postsError } = await supabase
    .from("post")
    .select(
      `
      *,
      profiles (
        id,
        username,
        profileImage,
        isSuspended
      )
    `,
    )
    .eq("userId", profileUserId)
    .order("created_at", {
      ascending: false,
    });

  if (postsError) {
    throw postsError;
  }

  const visiblePosts = posts.filter((post) => !post.profiles?.isSuspended);
  return addPostEngagementData(visiblePosts, currentUserId);
};


//SAVE POST SERVICES
export const savePostService = async (postId, userId) => {
  const { data, error } = await supabase
    .from("savedPost")
    .insert({
      postId,
      userId,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const unsavePostService = async (postId, userId) => {
  const { error } = await supabase
    .from("savedPost")
    .delete()
    .eq("postId", postId)
    .eq("userId", userId);

  if (error) {
    throw error;
  }
};

export const getSavedPostsService = async (userId) => {
  const { data, error } = await supabase
    .from("savedPost")
    .select(
      `
      post:postId (
        *,
        profiles (
          id,
          username,
          profileImage,
          isSuspended,
        )
      )
    `,
    )
    .eq("userId", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  const posts = data.map((item) => item.post).filter((post)=> post && !post.profiles?.isSuspended);

  const postsWithEngagement = await addPostEngagementData(posts, userId);

  return postsWithEngagement.map((post) => ({
    ...post,
    savedByMe: true,
  }));
};
