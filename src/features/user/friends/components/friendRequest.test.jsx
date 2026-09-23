import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { MemoryRouter } from "react-router-dom";
import AllUsers from "./users";
import FriendRequest from "./friendRequest";
import {
  sendFriendRequestService,
  //   deleteFriendRequestService,
} from "../services/friendServices";
import { expect } from "vitest";

vi.mock("../services/friendServices.js", () => ({
  sendFriendRequestService: vi.fn(),
  //   deleteFriendRequestService: vi.fn(),
}));

describe("Friend Request", () => {
  it("user can send a friend request", async () => {
    const user = userEvent.setup();

    const currentUser = {
      id: "user-1",
    };
    const users = [
      {
        id: "user-2",
        username: "test",
      },
    ];

    const sentRequest = [];
    const friends = [];

    sendFriendRequestService.mockResolvedValue([]);

    render(
      <MemoryRouter>
        <AllUsers
          users={users}
          currentUser={currentUser}
          sentRequest={sentRequest}
          friends={friends}
        />
      </MemoryRouter>,
    );

    const addFriendButton = screen.getByRole("button", {
      name: "Add Friend",
    });
    await user.click(addFriendButton);

    expect(sendFriendRequestService).toHaveBeenCalledWith({
      senderId: "user-1",
      receiverId: "user-2",
    });
  });

  it("user can accept & delete the friend request", async () => {
    const user = userEvent.setup();
    const request = {
      id: "request-1",
      sender: {
        id: "user-1",
        username: "test",
        profileImage: "",
      },
    };

    const onAccept = vi.fn();
    const onDelete = vi.fn();

    render(
      <FriendRequest
        request={request}
        onAccept={onAccept}
        onDelete={onDelete}
      />,
    );

    const acceptFriendButton = screen.getByRole("button", {
      name: "Accept",
    });

    await user.click(acceptFriendButton);

    const deleteFriendButton = screen.getByRole("button", {
      name: "Delete",
    });
    await user.click(deleteFriendButton);
    expect(onAccept).toHaveBeenCalledWith("request-1");
    expect(onDelete).toHaveBeenCalledWith("request-1");
  });
});
