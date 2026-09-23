import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import CreatePost from "./createPost";
import { createPostService } from "../services/postServices";

vi.mock("../services/postServices.js", () => ({
  createPostService: vi.fn(),
}));

describe("Create Post", () => {
  it("create a post when post button is clicked", async () => {
    const user = userEvent.setup(); 

    const currentUser = {
      id: "user-1",
      username: "test",
    };

    const onCreatePost = vi.fn();

    createPostService.mockResolvedValue({
      id: "post-1",
      content: "This is the test post content",
    });

    render(
      <CreatePost currentUser={currentUser} onCreatePost={onCreatePost} />,
    );

    const openPostModal = screen.getByRole("button", {
      name: "Post",
    });

    await user.click(openPostModal);

    const textarea = screen.getByPlaceholderText("What's on your mind, test?");

    await user.type(textarea, "This is the post content");

    const postButtons = screen.getAllByRole("button", {
      name: "Post",
    });

    const postButton = postButtons[1];
    await user.click(postButton);

    expect(createPostService).toHaveBeenCalled();
  });
});
