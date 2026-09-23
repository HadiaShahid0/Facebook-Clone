import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ChatSidebar from "./chatSidebar";
import { describe } from "vitest";

describe("Chat Sidebar Users", () => {
  it("should display the user in the inbox after the message request is accepted", async () => {
    const user = userEvent.setup();

    const friends = [
      {
        id: "selectedUser-1",
        username: "test",
        profileImage: "",
      },
    ];

    const requests = [];

    const onSelectUser = vi.fn();

    render(
      <ChatSidebar
        friends={friends}
        requests={requests}
        selectedUser={null}
        onSelectUser={onSelectUser}
        onSelectRequest={vi.fn()}
        unreadMessages={{}}
      />,
    );

    expect(screen.getByText("test")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /test/ }));

    expect(onSelectUser).toHaveBeenCalled();
  });
});
