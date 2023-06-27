const { render, fireEvent, screen, cleanup } = require("@testing-library/react");
require('@testing-library/jest-dom');
const React = require("react");
const App = require('./App.js');

describe("Basic Testing", () => {
  test("1 + 1 = 2", () => {
    let result = 1 + 1;
    expect(result).toBe(2);
  });

  test('Initial Loading Message', async () => {
    render(<App/>);
    const initialState = screen.getByText('Loading News...');
    expect(initialState).toBeInTheDocument();
  });

  test('Next Page Button Exists', () => {
    render(<App />);
    const next = screen.getByText('Next');
    expect(next).toBeInTheDocument();
  });

  test('Anchors link to construction Page', () => {
    render(<App />);
    const link = screen.getByText('new');
    fireEvent.click(link);
    const backButton = screen.getByText('Back to Hacker News V3.0');
    expect(backButton).toBeInTheDocument();
  });
})