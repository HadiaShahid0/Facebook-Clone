import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import UserReportModal from "./userReportModal";

import {
  temporarySuspendUserService,
  permanentSuspendUserService,
  dismissReportsService,
} from "../services/adminServices";

vi.mock("../services/adminServices", () => ({
  temporarySuspendUserService: vi.fn(),
  permanentSuspendUserService: vi.fn(),
  dismissReportsService: vi.fn(),
}));

describe("User Report Modal", () => {
  it("admin can temporarily suspend the user", async () => {
    const userEvent = userEvent.setup();

    const user = {
      count: 1,

      reportedUser: {
        id: "user-1",
        username: "testuser",
      },

      reports: [
        {
          id: "report-1",
          status: "pending",
          category: "harassment",
          reason: "Harassment",
          description: "Test report",
          created_at: new Date().toISOString(),

          reporter: {
            username: "reporter",
            profileImage: "",
          },
        },
      ],
    };

    const onClose = vi.fn();
    const onAction = vi.fn();

    temporarySuspendUserService.mockResolvedValue({});

    render(
      <UserReportModal user={user} onClose={onClose} onAction={onAction} />,
    );

    // Select Temporary Suspend
    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: "Action" }),
      "temporary",
    );

    // Enter reason
    await userEvent.type(
      screen.getByPlaceholderText("Enter reason..."),
      "Repeated harassment",
    );

    // Click Temporary Suspend
    await userEvent.click(
      screen.getByRole("button", {
        name: "Temporary Suspend",
      }),
    );

    expect(temporarySuspendUserService).toHaveBeenCalledWith(
      "user-1",
      "Repeated harassment",
      expect.any(String),
    );

    expect(onAction).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });
});
