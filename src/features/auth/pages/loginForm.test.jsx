import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import Login from "./login";
import { loginService } from "../services/authServices";

vi.mock("../services/authServices.js", () => ({
  loginService: vi.fn(),
}));

describe("Login Form", () => {
  it("Logs in the user when login is clicked", async () => {
    const user = userEvent.setup();

    loginService.mockResolvedValue({
      isSuspended: false,
      isAdmin: false,
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    const email = screen.getByLabelText("Email");
    const password = screen.getByLabelText("Password");

    await user.type(email, "test@gmail.com");
    await user.type(password, "123456");

    screen
      .getByRole("button", {
        name: "Login",
      })
      .click();
      
    expect(loginService).toHaveBeenCalled("test@gmail.com", "123456");
  });
});
