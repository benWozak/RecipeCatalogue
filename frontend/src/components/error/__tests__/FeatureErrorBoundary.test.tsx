import { render, screen, fireEvent } from "@/test/test-utils";
import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import FeatureErrorBoundary from "../FeatureErrorBoundary";
import { errorSimulation } from "@/test/test-utils";

describe("FeatureErrorBoundary", () => {
  // Suppress console.error for these tests since we're intentionally causing errors
  const originalError = console.error;
  beforeAll(() => {
    console.error = vi.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  it("renders children when there is no error", () => {
    render(
      <FeatureErrorBoundary featureName="Recipe Search">
        <div data-testid="child-component">Feature content</div>
      </FeatureErrorBoundary>
    );

    expect(screen.getByTestId("child-component")).toBeInTheDocument();
  });

  it("renders feature error UI when child throws", () => {
    render(
      <FeatureErrorBoundary featureName="Recipe Search">
        <errorSimulation.ThrowingComponent errorMessage="Feature test error" />
      </FeatureErrorBoundary>
    );

    expect(screen.getByText(/recipe search unavailable/i)).toBeInTheDocument();
    expect(
      screen.getByText(/recipe search feature encountered an error/i)
    ).toBeInTheDocument();
  });

  it("uses custom fallback message when provided", () => {
    render(
      <FeatureErrorBoundary
        featureName="Recipe Search"
        fallbackMessage="Search is currently being updated. Please try again in a few minutes."
      >
        <errorSimulation.ThrowingComponent />
      </FeatureErrorBoundary>
    );

    expect(
      screen.getByText(/search is currently being updated/i)
    ).toBeInTheDocument();
  });

  it("logs error details with feature context", () => {
    const consoleSpy = vi.spyOn(console, "error");

    render(
      <FeatureErrorBoundary featureName="Recipe Search">
        <errorSimulation.ThrowingComponent errorMessage="Feature test error" />
      </FeatureErrorBoundary>
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      "Recipe Search feature error:",
      expect.objectContaining({
        feature: "Recipe Search",
        error: "Feature test error",
        timestamp: expect.any(String),
      })
    );
  });

  it("provides refresh functionality", () => {
    const mockReload = vi.fn();
    Object.defineProperty(window, "location", {
      value: { reload: mockReload },
      writable: true,
    });

    render(
      <FeatureErrorBoundary featureName="Recipe Search">
        <errorSimulation.ThrowingComponent />
      </FeatureErrorBoundary>
    );

    const refreshButton = screen.getByText(/refresh/i);
    fireEvent.click(refreshButton);
    expect(mockReload).toHaveBeenCalled();
  });

  it("has appropriate styling for feature-level errors", () => {
    render(
      <FeatureErrorBoundary featureName="Recipe Search">
        <errorSimulation.ThrowingComponent />
      </FeatureErrorBoundary>
    );

    // Check for warning emoji
    expect(screen.getByText("⚠️")).toBeInTheDocument();

    // Check that refresh button exists and is styled appropriately
    const refreshButton = screen.getByText(/refresh/i);
    expect(refreshButton).toBeInTheDocument();
    expect(refreshButton).toHaveClass("text-sm");
  });

  it("handles different feature names correctly", () => {
    const consoleSpy = vi.spyOn(console, "error");

    const features = [
      "Meal Planning",
      "Recipe Collections",
      "Image Scanning",
      "Recipe Parsing",
    ];

    features.forEach((featureName) => {
      const { unmount } = render(
        <FeatureErrorBoundary featureName={featureName}>
          <errorSimulation.ThrowingComponent
            errorMessage={`${featureName} error`}
          />
        </FeatureErrorBoundary>
      );

      expect(
        screen.getByText((content, element) => {
          const hasText = content.toLowerCase().includes(`${featureName.toLowerCase()} unavailable`)
          return hasText && element?.tagName !== 'script'
        })
      ).toBeInTheDocument();
      expect(consoleSpy).toHaveBeenCalledWith(
        `${featureName} feature error:`,
        expect.objectContaining({
          feature: featureName,
          error: `${featureName} error`,
        })
      );

      unmount();
      consoleSpy.mockClear();
    });
  });

  it("resets error state when children change to working component", () => {
    let shouldThrow = true;

    const DynamicComponent = () => {
      if (shouldThrow) {
        throw new Error("Dynamic feature error");
      }
      return <div data-testid="working-feature">Feature working</div>;
    };

    const { rerender } = render(
      <FeatureErrorBoundary featureName="Dynamic Feature">
        <DynamicComponent />
      </FeatureErrorBoundary>
    );

    expect(
      screen.getByText(/dynamic feature unavailable/i)
    ).toBeInTheDocument();

    // Reset error by clicking try again and changing component
    const resetButton = screen.getByText(/refresh/i);
    fireEvent.click(resetButton);

    shouldThrow = false;
    rerender(
      <FeatureErrorBoundary featureName="Dynamic Feature">
        <DynamicComponent />
      </FeatureErrorBoundary>
    );

    // Should still show error since window.location.reload was called
    expect(
      screen.getByText(/dynamic feature unavailable/i)
    ).toBeInTheDocument();
  });

  it("handles nested feature error boundaries", () => {
    render(
      <FeatureErrorBoundary featureName="Parent Feature">
        <div>
          <FeatureErrorBoundary featureName="Child Feature">
            <errorSimulation.ThrowingComponent errorMessage="Nested error" />
          </FeatureErrorBoundary>
        </div>
      </FeatureErrorBoundary>
    );

    // Should catch the error at the child level
    expect(screen.getByText(/child feature unavailable/i)).toBeInTheDocument();
    expect(
      screen.queryByText(/parent feature unavailable/i)
    ).not.toBeInTheDocument();
  });

  it("provides compact error display suitable for component-level errors", () => {
    render(
      <FeatureErrorBoundary featureName="Small Widget">
        <errorSimulation.ThrowingComponent />
      </FeatureErrorBoundary>
    );

    // Should use min-h-[200px] for compact display
    const errorContainer = screen
      .getByText(/small widget unavailable/i)
      .closest("div");
    expect(errorContainer?.parentElement?.parentElement).toHaveClass(
      "min-h-[200px]"
    );

    // Should have border and background for visual separation
    expect(errorContainer?.parentElement?.parentElement).toHaveClass(
      "border",
      "rounded-lg",
      "bg-secondary/20"
    );
  });
});
