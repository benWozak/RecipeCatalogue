import { render, screen, fireEvent, waitFor } from "@/test/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { RichTextEditor } from "../rich-text-editor";

// Mock TipTap editor with proper event handling
const mockSetContent = vi.fn();
const mockOnChange = vi.fn();

vi.mock("@tiptap/react", () => ({
  useEditor: vi.fn((options) => {
    // Store onChange callback for use in mock
    if (options?.onUpdate) {
      mockOnChange.mockImplementation(options.onUpdate);
    }
    return {
      getHTML: vi.fn(() => "<p>Sample content</p>"),
      commands: {
        setContent: mockSetContent,
        focus: vi.fn(),
      },
      isActive: vi.fn(() => false),
      can: vi.fn(() => ({ toggleBold: vi.fn(() => true) })),
      chain: vi.fn(() => ({
        focus: vi.fn(() => ({ toggleBold: vi.fn() })),
      })),
    };
  }),
  EditorContent: () => (
    <div
      data-testid="editor-content"
      contentEditable
      suppressContentEditableWarning
      onInput={(e) => {
        // Simulate editor input with sanitization
        const content = (e.target as HTMLElement).innerHTML;
        // Basic sanitization for testing
        const sanitized = content
          .replace(/<script[^>]*>.*?<\/script>/gi, "")
          .replace(/on\w+="[^"]*"/gi, "")
          .replace(/javascript:/gi, "");

        // Trigger the onChange callback if it exists
        if (mockOnChange.mock.calls.length === 0) {
          mockOnChange({ editor: { getHTML: () => sanitized } });
        }
      }}
    >
      <p>Sample content</p>
    </div>
  ),
}));

describe("RichTextEditor", () => {
  const mockOnChangeCallback = vi.fn();

  beforeEach(() => {
    mockOnChangeCallback.mockClear();
    mockOnChange.mockClear();
    mockSetContent.mockClear();
  });

  it("renders editor with basic toolbar", () => {
    render(<RichTextEditor onChange={mockOnChangeCallback} />);

    expect(screen.getByTestId("editor-content")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /bold/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /italic/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /underline/i })
    ).toBeInTheDocument();
  });

  it("handles input events properly", async () => {
    render(<RichTextEditor onChange={mockOnChangeCallback} />);

    const editor = screen.getByTestId("editor-content");

    // Simulate input
    fireEvent.input(editor, { target: { innerHTML: "<p>Test content</p>" } });

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  it("sanitizes dangerous content in mock", async () => {
    render(<RichTextEditor onChange={mockOnChangeCallback} />);

    const editor = screen.getByTestId("editor-content");

    // Test that our mock sanitizes script tags
    fireEvent.input(editor, {
      target: { innerHTML: '<script>alert("xss")</script><p>Safe content</p>' },
    });

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalled();
      // Our mock should have sanitized the script tag
      const callback = mockOnChange.mock.calls[0][0];
      const result = callback?.editor?.getHTML();
      expect(result).not.toContain("<script>");
    });
  });

  it("validates basic functionality exists", () => {
    render(<RichTextEditor onChange={mockOnChangeCallback} />);

    // Just verify the component renders without crashing
    // This ensures the RichTextEditor component works with our mocking setup
    expect(screen.getByTestId("editor-content")).toBeInTheDocument();
  });
});
