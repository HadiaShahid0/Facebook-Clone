import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import PostActions from "./postAction";
import { likePostService, savedPostService } from "../services/postServices";

vi.mock("../services/postServices", () => ({
  savedPostService: vi.fn(),
  likePostService: vi.fn(),
}));

describe("PostActions", () => {
  it("saves the post when Save is clicked", async () => {
    const user = userEvent.setup();

    const post = {
      id: "post-1",
      savedByMe: false,
    };

    const currentUser = {
      id: "user-1",
    };

    const onSaveUnsave = vi.fn();

    render(
      <PostActions
        post={post}
        currentUser={currentUser}
        onSaveUnsave={onSaveUnsave}
        onLikeUnlike={vi.fn()}
        onCommentClick={vi.fn()}
      />,
    );

    const saveButton = screen.getByRole("button", {
      name: "Save",
    });

    await user.click(saveButton);

    expect(savedPostService).toHaveBeenCalled();
    expect(onSaveUnsave).toHaveBeenCalledWith("post-1", true);
    expect(screen.getByText("Post saved successfully.")).toBeInTheDocument();
  });
  it("user can like a post", async () => {
    const user = userEvent.setup();

    const post = {
      id: "post-1",
      likedByMe: false,
    };

    const currentUser = {
      id: "user-1",
    };

    const onLikeUnlike = vi.fn();

    render(
      <PostActions
        post={post}
        currentUser={currentUser}
        onSaveUnsave={vi.fn()}
        onLikeUnlike={onLikeUnlike}
        onCommentClick={vi.fn()}
      />,
    );

    const likeButton = screen.getByRole("button", {
      name: "Like",
    });

    await user.click(likeButton);

    expect(likePostService).toHaveBeenCalled();
    expect(onLikeUnlike).toHaveBeenCalledWith("post-1", true);
  });
});
