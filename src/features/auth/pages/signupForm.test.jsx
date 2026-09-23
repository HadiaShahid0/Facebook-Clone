import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import Signup from "./signup";
import { signupService } from "../services/authServices";
import { describe, expect } from "vitest";

vi.mock("../services/authServices.js", () => ({
  signupService: vi.fn(),
}));

describe("Signup form", () => {
  it("Signs up the user when signup button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>,
    );
    const username = screen.getByLabelText("Username");
    const email = screen.getByLabelText("Email");
    const password = screen.getByLabelText("Password");

    await user.type(username, "test");
    await user.type(email, "test@gmail.com");
    await user.type(password, "123456");

    screen
      .getByRole("button", {
        name: "Sign Up",
      })
      .click();

    expect(signupService).toHaveBeenCalledWith(
      "test",
      "test@gmail.com",
      "123456",
    );
  });
});
