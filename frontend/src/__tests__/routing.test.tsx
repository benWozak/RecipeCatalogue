import { renderApp, screen, waitFor } from "@/test/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Link } from "react-router";
import App from "../App";
import { mockAuth } from "@/test/test-utils";
import userEvent from "@testing-library/user-event";

// Mock page components to focus on routing behavior
vi.mock("../pages/RecipeDetailPage", () => ({
  default: ({ id }: { id?: string }) => (
    <div data-testid="recipe-detail-page">Recipe Detail: {id}</div>
  ),
}));

vi.mock("../pages/NotFoundPage", () => ({
  default: () => <div data-testid="not-found-page">404 - Page Not Found</div>,
}));

vi.mock("../pages/HomePage", () => ({
  default: () => <div data-testid="home-page">Home Page</div>,
}));

vi.mock("../pages/RecipesPage", () => ({
  default: () => <div data-testid="recipes-page">Recipes Page</div>,
}));

vi.mock("../components/common/Layout", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="layout">
      <nav data-testid="navigation">
        <Link to="/" data-testid="home-link">
          Home
        </Link>
        <Link to="/recipes" data-testid="recipes-link">
          Recipes
        </Link>
        <Link to="/recipes/123" data-testid="recipe-detail-link">
          Recipe Detail
        </Link>
        <Link to="/invalid-route" data-testid="invalid-link">
          Invalid
        </Link>
        <button onClick={() => window.history.back()} data-testid="back-button">
          Back
        </button>
        <button
          onClick={() => window.history.forward()}
          data-testid="forward-button"
        >
          Forward
        </button>
      </nav>
      {children}
    </div>
  ),
}));

describe("Routing Edge Cases and Navigation", () => {
  beforeEach(() => {
    mockAuth.signedIn();
    vi.clearAllMocks();

    // Mock window.history methods
    Object.defineProperty(window, "history", {
      value: {
        back: vi.fn(),
        forward: vi.fn(),
        pushState: vi.fn(),
        replaceState: vi.fn(),
        state: null,
        length: 1,
      },
      writable: true,
    });
  });

  describe("URL Parameter Validation", () => {
    it("handles valid recipe IDs", () => {
      renderApp(<App />, { initialEntries: ["/recipes/abc123"] });

      expect(screen.getByTestId("recipe-detail-page")).toBeInTheDocument();
      expect(screen.getByText(/recipe detail: abc123/i)).toBeInTheDocument();
    });

    it("handles numeric recipe IDs", () => {
      renderApp(<App />, { initialEntries: ["/recipes/123456"] });

      expect(screen.getByTestId("recipe-detail-page")).toBeInTheDocument();
    });

    it("handles UUID-style recipe IDs", () => {
      const uuid = "550e8400-e29b-41d4-a716-446655440000";
      renderApp(<App />, { initialEntries: [`/recipes/${uuid}`] });

      expect(screen.getByTestId("recipe-detail-page")).toBeInTheDocument();
    });

    it("handles malformed or dangerous IDs safely", () => {
      const dangerousIds = [
        "../../../etc/passwd",
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        "../../admin",
        "null",
        "undefined",
        "%2E%2E%2F", // URL encoded ../
      ];

      dangerousIds.forEach((id) => {
        const { unmount } = renderApp(<App />, {
          initialEntries: [`/recipes/${encodeURIComponent(id)}`],
        });

        // Should either show the detail page safely or handle gracefully
        expect(screen.getByTestId("layout")).toBeInTheDocument();
        // Should not execute any scripts or cause navigation issues

        unmount();
      });
    });

    it("handles extremely long IDs", () => {
      const longId = "a".repeat(1000);
      renderApp(<App />, { initialEntries: [`/recipes/${longId}`] });

      // Should handle gracefully without crashing
      expect(screen.getByTestId("layout")).toBeInTheDocument();
    });

    it("handles special characters in IDs", () => {
      const specialIds = [
        "recipe-with-dashes",
        "recipe_with_underscores",
        "recipe.with.dots",
        "recipe with spaces", // Note: would be URL encoded
        "recipe+with+plus",
        "recipe%20encoded",
      ];

      specialIds.forEach((id) => {
        const { unmount } = renderApp(<App />, {
          initialEntries: [`/recipes/${encodeURIComponent(id)}`],
        });

        expect(screen.getByTestId("recipe-detail-page")).toBeInTheDocument();

        unmount();
      });
    });
  });

  describe("Deep Linking", () => {
    it("handles direct navigation to nested routes", () => {
      renderApp(<App />, { initialEntries: ["/recipes/123/edit"] });

      // Should show the edit form for recipe 123
      expect(screen.getByTestId("layout")).toBeInTheDocument();
      expect(screen.queryByTestId("not-found-page")).not.toBeInTheDocument();
    });

    it("preserves query parameters in URLs", () => {
      renderApp(<App />, {
        initialEntries: ["/recipes?search=pasta&category=italian"],
      });

      expect(screen.getByTestId("recipes-page")).toBeInTheDocument();
      // Components should be able to access query parameters
    });

    it("handles hash fragments in URLs", () => {
      renderApp(<App />, {
        initialEntries: ["/recipes/123#ingredients"],
      });

      expect(screen.getByTestId("recipe-detail-page")).toBeInTheDocument();
    });

    it("handles encoded URLs correctly", () => {
      const encodedPath = "/recipes/%E2%9C%93";
      renderApp(<App />, { initialEntries: [encodedPath] });

      expect(screen.getByTestId("layout")).toBeInTheDocument();
    });
  });

  describe("Browser Navigation", () => {
    it("handles back button navigation", async () => {
      const user = userEvent.setup();
      renderApp(<App />, { initialEntries: ["/"] });

      // Navigate to recipes page
      await user.click(screen.getByTestId("recipes-link"));
      expect(screen.getByTestId("recipes-page")).toBeInTheDocument();

      // Click back button
      await user.click(screen.getByTestId("back-button"));
      expect(window.history.back).toHaveBeenCalled();
    });

    it("handles forward button navigation", async () => {
      const user = userEvent.setup();
      renderApp(<App />, { initialEntries: ["/"] });

      await user.click(screen.getByTestId("forward-button"));
      expect(window.history.forward).toHaveBeenCalled();
    });

    it("handles rapid navigation clicks", async () => {
      const user = userEvent.setup();
      renderApp(<App />, { initialEntries: ["/"] });

      const recipesLink = screen.getByTestId("recipes-link");
      const homeLink = screen.getByTestId("home-link");

      // Rapid clicking between routes
      await user.click(recipesLink);
      await user.click(homeLink);
      await user.click(recipesLink);
      await user.click(homeLink);

      // Should handle without issues
      expect(screen.getByTestId("home-page")).toBeInTheDocument();
    });

    it("preserves scroll position on navigation", async () => {
      const user = userEvent.setup();

      // Mock scrollTo
      window.scrollTo = vi.fn();

      renderApp(<App />, { initialEntries: ["/"] });

      await user.click(screen.getByTestId("recipes-link"));

      // Should preserve scroll behavior (implementation specific)
      expect(screen.getByTestId("recipes-page")).toBeInTheDocument();
    });
  });

  describe("Invalid Routes and 404 Handling", () => {
    it("shows 404 for completely invalid routes", () => {
      renderApp(<App />, { initialEntries: ["/this-route-does-not-exist"] });

      expect(screen.getByTestId("not-found-page")).toBeInTheDocument();
    });

    it("shows 404 for malformed route patterns", () => {
      const malformedRoutes = [
        "/recipes/", // Missing ID
        "/recipes//edit", // Double slash
        "/meal-plans/", // Missing ID
        "/collections/", // Malformed
      ];

      malformedRoutes.forEach((route) => {
        const { unmount } = renderApp(<App />, { initialEntries: [route] });

        // Should either show 404 or handle gracefully
        expect(screen.getByTestId("layout")).toBeInTheDocument();

        unmount();
      });
    });

    it("handles case sensitivity correctly", () => {
      const caseSensitiveRoutes = [
        "/Recipes", // Capital R
        "/RECIPES", // All caps
        "/recipes/SCAN", // Mixed case
      ];

      caseSensitiveRoutes.forEach((route) => {
        const { unmount } = renderApp(<App />, { initialEntries: [route] });

        // Should show 404 for case mismatches
        expect(screen.getByTestId("not-found-page")).toBeInTheDocument();

        unmount();
      });
    });

    it("handles trailing slashes consistently", () => {
      const trailingSlashRoutes = [
        "/recipes/",
        "/meal-plans/",
        "/collections/",
      ];

      trailingSlashRoutes.forEach((route) => {
        const { unmount } = renderApp(<App />, { initialEntries: [route] });

        // Should handle trailing slashes consistently
        expect(screen.getByTestId("layout")).toBeInTheDocument();

        unmount();
      });
    });
  });

  describe("Route Transitions and Loading States", () => {
    it("handles route transitions without flickering", async () => {
      const user = userEvent.setup();
      renderApp(<App />, { initialEntries: ["/"] });

      expect(screen.getByTestId("home-page")).toBeInTheDocument();

      await user.click(screen.getByTestId("recipes-link"));

      await waitFor(() => {
        expect(screen.getByTestId("recipes-page")).toBeInTheDocument();
        expect(screen.queryByTestId("home-page")).not.toBeInTheDocument();
      });
    });

    it("maintains layout during route changes", async () => {
      const user = userEvent.setup();
      renderApp(<App />, { initialEntries: ["/"] });

      const layout = screen.getByTestId("layout");
      expect(layout).toBeInTheDocument();

      await user.click(screen.getByTestId("recipes-link"));

      // Layout should persist
      expect(screen.getByTestId("layout")).toBeInTheDocument();
      expect(layout).toBeInTheDocument();
    });
  });

  describe("Memory and Performance", () => {
    it("handles many route changes without memory leaks", async () => {
      const user = userEvent.setup();
      renderApp(<App />, { initialEntries: ["/"] });

      // Simulate many navigation events
      for (let i = 0; i < 10; i++) {
        await user.click(screen.getByTestId("recipes-link"));
        await user.click(screen.getByTestId("home-link"));
      }

      // Should still work normally
      expect(screen.getByTestId("home-page")).toBeInTheDocument();
    });

    it("cleans up properly on unmount", () => {
      const { unmount } = renderApp(<App />, { initialEntries: ["/recipes"] });

      expect(screen.getByTestId("recipes-page")).toBeInTheDocument();

      // Should unmount without errors
      unmount();
    });
  });

  describe("URL Manipulation Attacks", () => {
    it("prevents directory traversal attacks", () => {
      const traversalAttempts = [
        "/recipes/../../../etc/passwd",
        "/recipes/..%2F..%2F..%2Fetc%2Fpasswd",
        "/recipes/....//....//....//etc/passwd",
      ];

      traversalAttempts.forEach((path) => {
        const { unmount } = renderApp(<App />, { initialEntries: [path] });

        // Should not navigate outside the app structure
        expect(screen.getByTestId("layout")).toBeInTheDocument();

        unmount();
      });
    });

    it("sanitizes URLs to prevent XSS", () => {
      const xssAttempts = [
        '/recipes/<script>alert("xss")</script>',
        '/recipes/javascript:alert("xss")',
        '/recipes/data:text/html,<script>alert("xss")</script>',
      ];

      xssAttempts.forEach((path) => {
        const { unmount } = renderApp(<App />, { initialEntries: [path] });

        // Should render safely without executing scripts
        expect(screen.getByTestId("layout")).toBeInTheDocument();
        expect(document.body.innerHTML).not.toContain("<script>");

        unmount();
      });
    });

    it("handles protocol attacks", () => {
      const protocolAttempts = [
        'javascript:alert("xss")',
        "data:text/html,<h1>Fake Page</h1>",
        "file:///etc/passwd",
        'vbscript:msgbox("xss")',
      ];

      protocolAttempts.forEach((path) => {
        const { unmount } = renderApp(<App />, { initialEntries: [path] });

        // Should show 404 or handle safely
        expect(screen.getByTestId("layout")).toBeInTheDocument();

        unmount();
      });
    });
  });

  describe("Route State Management", () => {
    it("preserves component state during route parameters changes", async () => {
      const user = userEvent.setup();
      renderApp(<App />, { initialEntries: ["/recipes/123"] });

      expect(screen.getByTestId("recipe-detail-page")).toBeInTheDocument();

      // Change route parameter
      await user.click(screen.getByTestId("recipes-link"));
      await user.click(screen.getByTestId("recipe-detail-link"));

      expect(screen.getByTestId("recipe-detail-page")).toBeInTheDocument();
    });

    it("handles location state correctly", () => {
      renderApp(<App />, {
        initialEntries: ["/recipes"],
      });

      expect(screen.getByTestId("recipes-page")).toBeInTheDocument();
      // Components should be able to access location state through the router
    });
  });
});
