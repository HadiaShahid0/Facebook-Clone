import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import ProfileHeader from "./profileHeader";
import { blockUserService } from "../services/profileServices";
import { expect, vi } from "vitest";

vi.mock("../services/profileServices.js", () => ({
  blockUserService: vi.fn(),
}));

describe("ProfileAction", () => {
  it("user can block or report the user",  () => {
    const user = userEvent.setup();

    const currentUser = {
      id: "user-1",
    };

    const profileUser = {
      id: "user-2",
      username: "test",
    };

    const isOwnProfile = false;
    const friendStatus = "none";
    const friendLoading = false;
    const onAddFriend = vi.fn();
    const onAcceptFriend = vi.fn();
    const onDeleteFriendRequest = vi.fn();
    const onUpdateProfile = vi.fn();
    const onReportUser = vi.fn();

    vi.spyOn(window, "confirm").mockReturnValue(true);

    render(
      <MemoryRouter>
        <ProfileHeader
          user={profileUser}
          currentUser={currentUser}
          isOwnProfile={isOwnProfile}
          friendStatus={friendStatus}
          friendLoading={friendLoading}
          onAddFriend={onAddFriend}
          onAcceptFriend={onAcceptFriend}
          onDeleteFriendRequest={onDeleteFriendRequest}
          onUpdateProfile={onUpdateProfile}
          onReportUser={onReportUser}
        />
      </MemoryRouter>,
    );

    screen
      .getByRole("button", {
        name: "More Options",
      })
      .click();

    screen
      .getByRole("button", {
        name: "Block",
      })
      .click();

    screen
      .getByRole("button", {
        name: "Report profile",
      })
      .click();

    expect(blockUserService).toHaveBeenCalledWith("user-1", "user-2");
    expect(onReportUser).toHaveBeenCalled();
  });
});
