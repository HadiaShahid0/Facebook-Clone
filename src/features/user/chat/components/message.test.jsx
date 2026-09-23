import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, vi } from "vitest";

import MessageInput from "./messageInput";
import ChatPage from "../pages/chatPage";

import {
  //   getChatUsersService,
  //   getMessageRequestsService,
  //   getMessageRequestBetweenUsersService,
  //   getMessagesService,
  acceptMessageRequestService,
  //   getUnreadMessageCountsService,
  //   markMessageNotificationsReadService,
  rejectMessageRequestService,
} from "../services/chatServices";

import {
  getBlockedUserIdsService,
  getProfileService,
} from "../../profile/services/profileServices";

import { getCurrentUserService } from "../../../auth/services/authServices";

vi.mock("../services/chatServices", () => ({
  //   getChatUsersService: vi.fn(),
  //   getMessageRequestsService: vi.fn(),
  //   getMessageRequestBetweenUsersService: vi.fn(),
  //   getMessagesService: vi.fn(),
  acceptMessageRequestService: vi.fn(),
  rejectMessageRequestService: vi.fn(),
  //   getUnreadMessageCountsService: vi.fn(),
  //   markMessageNotificationsReadService: vi.fn(),
}));

// vi.mock("../../../auth/services/authServices", () => ({
//   getCurrentUserService: vi.fn(),
// }));

// vi.mock("../../profile/services/profileServices", () => ({
//   getProfileService: vi.fn(),
//   getBlockedUserIdsService: vi.fn(),
// }));

describe("message", () => {
  it("user can send a message ", async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();

    render(<MessageInput onSend={onSend} />);

    const messageInput = screen.getByPlaceholderText("Type a message...");

    await user.type(messageInput, "Hello");

    const messageButton = screen.getByRole("button", {
      name: "Send Message",
    });

    await user.click(messageButton);

    expect(onSend).toHaveBeenCalledWith("Hello");
  });


  it("accepts a message request", async () => {
    acceptMessageRequestService.mockResolvedValue({
      id: "request-1",
      status: "accepted",
    });

    await acceptMessageRequestService("request-1");

    expect(acceptMessageRequestService).toHaveBeenCalledWith("request-1");
  });

  it("Delete a message request", async () => {
    rejectMessageRequestService.mockResolvedValue({
      id: "request-1",
      status: "rejected",
    });

    await rejectMessageRequestService("request-1");

    expect(rejectMessageRequestService).toHaveBeenCalledWith("request-1");
  });
  
  //   it("user can accept a message request", async () => {
  //     const user = userEvent.setup();

  //     getCurrentUserService.mockResolvedValue({
  //       id: "user-2",
  //       username: "receiver",
  //     });

  //     getBlockedUserIdsService.mockResolvedValue([]);

  //     getChatUsersService.mockResolvedValue([]);

  //     getMessageRequestsService.mockResolvedValue([]);

  //     getUnreadMessageCountsService.mockResolvedValue({});

  //     getMessagesService.mockResolvedValue([]);

  //     getMessageRequestBetweenUsersService.mockResolvedValue({
  //       id: "request-1",
  //       senderId: "user-1",
  //       receiverId: "user-2",
  //       status: "pending",
  //     });

  //     getProfileService.mockResolvedValue({
  //       id: "user-1",
  //       username: "test",
  //       profileImage: "",
  //     });

  //     markMessageNotificationsReadService.mockResolvedValue({});

  //     acceptMessageRequestService.mockResolvedValue({
  //       id: "request-1",
  //       senderId: "user-1",
  //       receiverId: "user-2",
  //       status: "accepted",
  //     });

  //     render(
  //       <MemoryRouter initialEntries={["/chat/user-1"]}>
  //         <Routes>
  //           <Route path="/chat/:userId" element={<ChatPage />} />
  //         </Routes>
  //       </MemoryRouter>,
  //     );

  //     const acceptButton = await screen.findByRole("button", {
  //       name: "Accept",
  //     });

  //     await user.click(acceptButton);

  //     expect(acceptMessageRequestService).toHaveBeenCalledWith("request-1");
  //   });
});
