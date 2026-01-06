import { render, screen, fireEvent } from "@testing-library/react";
import App from "./App";

test("renders calculator display", () => {
  render(<App />);
  const display = screen.getByTestId("display");
  expect(display).toBeInTheDocument();
});

test("can compute 2 + 3 = 5", () => {
  render(<App />);
  fireEvent.click(screen.getByTestId("key-2"));
  fireEvent.click(screen.getByTestId("key-add"));
  fireEvent.click(screen.getByTestId("key-3"));
  fireEvent.click(screen.getByTestId("key-equals"));
  expect(screen.getByTestId("display")).toHaveTextContent("5");
});
