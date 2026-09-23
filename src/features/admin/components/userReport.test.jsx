import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import UserReportModal from "./userReportModal";
import {
  temporarySuspendUserService,
  permanentSuspendUserService,
  dismissReportsService,
} from "../services/adminServices";
import { describe } from "vitest";

vi.mock("../services/adminServices.js", () => ({
  temporarySuspendUserService: vi.fn(),
  permanentSuspendUserService: vi.fn(),
  dismissReportsService: vi.fn(),
}));
describe("User Report", () => {
  it("admin can temporary suspend the user", async () => {
    const userevent = userEvent.setup();

    const user = {
      count: 1,
      reportedUser: {
        id: "user-1",
        username: "test",
      },
      reports: [
        {
          id: "report-1",
          status: "pending",
          category: "fakeAccount",
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

    render(
      <UserReportModal user={user} onClose={onClose} onAction={onAction} />,
    );
    
    await userevent.selectOptions(
      screen.getByRole("combobox", { name: "Action" }),
      "temporary",
    );

    await userevent.type(
      screen.getByPlaceholderText("Enter reason..."),
      "Fake Account",
    );

    await userevent.click(
      screen.getByRole("button", {
        name: "Temporary Suspend",
      }),
    );

    expect(temporarySuspendUserService).toHaveBeenCalledWith(
      "user-1",
      "Fake Account",
      expect.any(String),
    );

    expect(onAction).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it("admin can permanent suspend the user", async () => {
    const userevent = userEvent.setup();

    const user = {
      count: 1,
      reportedUser: {
        id: "user-1",
        username: "test",
      },
      reports: [
        {
          id: "report-1",
          status: "pending",
          category: "fakeAccount",
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

    render(
      <UserReportModal user={user} onClose={onClose} onAction={onAction} />,
    );
    await userevent.selectOptions(
      screen.getByRole("combobox", { name: "Action" }),
      "permanent",
    );

    await userevent.type(
      screen.getByPlaceholderText("Enter reason..."),
      "Fake Account",
    );

    await userevent.click(
      screen.getByRole("button", {
        name: "Permanent Suspend",
      }),
    );

    expect(permanentSuspendUserService).toHaveBeenCalledWith(
      "user-1",
      "Fake Account",
    );

    expect(onAction).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it("admin can dismiss the user report", async () => {
    const userevent = userEvent.setup();

    const user = {
      count: 1,
      reportedUser: {
        id: "user-1",
        username: "test",
      },
      reports: [
        {
          id: "report-1",
          status: "pending",
          category: "fakeAccount",
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

    render(
      <UserReportModal user={user} onClose={onClose} onAction={onAction} />,
    );
    await userevent.selectOptions(
      screen.getByRole("combobox", { name: "Action" }),
      "dismiss",
    );

    await userevent.type(
      screen.getByPlaceholderText("Enter reason..."),
      "Fake Account",
    );

    await userevent.click(
      screen.getByRole("button", {
        name: "Dismiss Reports",
      }),
    );

    expect(dismissReportsService).toHaveBeenCalledWith(
      "user-1",
      "Fake Account",
    );

    expect(onAction).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });
});