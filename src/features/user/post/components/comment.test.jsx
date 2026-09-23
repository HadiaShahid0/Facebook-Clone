import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, vi } from "vitest";

import Comment from "./comment";
import {
  addCommentService,
  getCommentsService,
  likeCommentService,
} from "../services/postServices";

import CommentSection from "./commentSection";

vi.mock("../services/postServices", () => ({
  addCommentService: vi.fn(),
  getCommentsService: vi.fn(),
  likeCommentService: vi.fn(),
}));

describe("Comment", () => {
  it("user can add a comment", async () => {
    const user = userEvent.setup();

    const currentUser = {
      id: "user-1",
      username: "test",
    };

    const post = {
      id: "user-1",
      content: "This is testing post for comment",
    };

    const onComment = vi.fn();

    getCommentsService.mockResolvedValue([]);

    render(
      <CommentSection
        post={post}
        currentUser={currentUser}
        onComment={onComment}
      />,
    );

    const commentInput = screen.getByPlaceholderText("Write a comment...");

    await user.type(commentInput, "Hello");

    const commentButton = screen.getByRole("button", {
      name: "Post comment",
    });

    await user.click(commentButton);

    expect(addCommentService).toHaveBeenCalled({
      postId: "post-1",
      userId: "user-1",
      content: "Hello",
      parentId: null,
    });

    expect(onComment).toHaveBeenCalled();
  });

  it("user can add a reply", async () => {
    const user = userEvent.setup();

    const currentUser = {
      id: "user-1",
    };

    const comment = {
      id: "comment-1",
      postId: "post-1",
      content: "This is a comment",
      likedByMe: false,
      profiles: {
        username: "test",
      },
    };

    const comments = [];
    const onComment = vi.fn();

    render(
      <Comment
        comment={comment}
        comments={comments}
        currentUser={currentUser}
        onComment={onComment}
      />,
    );

    const replyButton = screen.getByRole("button", {
      name: "Reply",
    });

    await user.click(replyButton);

    const replyInbox = screen.getByLabelText("Reply to test");

    replyInbox.innerText = "@test hello";

    fireEvent.input(replyInbox);

    const replyButtons = screen.getAllByRole("button", {
      name: "Reply",
    });

    const replySubmitButton = replyButtons[1];

    await user.click(replySubmitButton);

    expect(addCommentService).toHaveBeenCalledWith({
      postId: "post-1",
      userId: "user-1",
      content: "@test hello",
      parentId: "comment-1",
    });

    expect(onComment).toHaveBeenCalled();
  });

  it("user can like a comment", async () => {
    const user = userEvent.setup();

    const currentUser = {
      id: "user-1",
      username: "test",
    };

    const comment = {
      id: "comment-1",
      postId: "post-1",
      content: "This is testing post for comment",
      likedByMe: false,
      profiles: {
        username: "test",
      },
    };

    const comments = [];

    const onComment = vi.fn();

    render(
      <Comment
        comment={comment}
        comments={comments}
        currentUser={currentUser}
        onComment={onComment}
      />,
    );

    const commentLikeButton = screen.getByRole("button", {
      name: "Like",
    });

    await user.click(commentLikeButton);
    expect(likeCommentService).toHaveBeenCalled();
  });
});
