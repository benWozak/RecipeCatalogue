import React, { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { BrowserRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ClerkProvider } from "@clerk/clerk-react";
import { ThemeProvider } from "@/components/theme-provider";
import { vi } from "vitest";

// Mock Clerk Provider for testing
const MockClerkProvider = ({ children }: { children: React.ReactNode }) => {
  return <div data-testid="mock-clerk-provider">{children}</div>;
};

// Test providers wrapper
interface AllTheProvidersProps {
  children: React.ReactNode;
  queryClient?: QueryClient;
  useRealClerk?: boolean;
}

const AllTheProviders = ({
  children,
  queryClient: customQueryClient,
  useRealClerk = false,
}: AllTheProvidersProps) => {
  // Create a fresh query client for each test to avoid state leakage
  const defaultQueryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

  const queryClient = customQueryClient || defaultQueryClient;

  return (
    <>
      {useRealClerk ? (
        <ClerkProvider 
          publishableKey="test-key"
          routerPush={(to: string) => window.history.pushState(null, "", to)}
          routerReplace={(to: string) => window.history.replaceState(null, "", to)}
        >
          <QueryClientProvider client={queryClient}>
            <ThemeProvider defaultTheme="light" storageKey="test-theme">
              <BrowserRouter>{children}</BrowserRouter>
            </ThemeProvider>
          </QueryClientProvider>
        </ClerkProvider>
      ) : (
        <MockClerkProvider>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider defaultTheme="light" storageKey="test-theme">
              <BrowserRouter>{children}</BrowserRouter>
            </ThemeProvider>
          </QueryClientProvider>
        </MockClerkProvider>
      )}
    </>
  );
};

// Custom render function that includes all providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper"> & {
    queryClient?: QueryClient;
    useRealClerk?: boolean;
  }
) => {
  const { queryClient, useRealClerk, ...renderOptions } =
    options || {};

  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders
        queryClient={queryClient}
        useRealClerk={useRealClerk}
      >
        {children}
      </AllTheProviders>
    ),
    ...renderOptions,
  });
};

// Mock authentication utilities
export const mockAuth = {
  // Mock authenticated user
  signedIn: () => {
    vi.mock("@clerk/clerk-react", () => ({
      useUser: () => ({
        user: {
          id: "test-user-id",
          emailAddresses: [{ emailAddress: "test@example.com" }],
          firstName: "Test",
          lastName: "User",
          createdAt: new Date("2024-01-01"),
        },
        isLoaded: true,
        isSignedIn: true,
      }),
      useAuth: () => ({
        getToken: vi.fn().mockResolvedValue("mock-token"),
        signOut: vi.fn(),
      }),
      SignedIn: ({ children }: { children: React.ReactNode }) => (
        <>{children}</>
      ),
      SignedOut: () => null,
      ClerkProvider: ({ children }: { children: React.ReactNode }) => (
        <>{children}</>
      ),
    }));
  },

  // Mock signed out user
  signedOut: () => {
    vi.mock("@clerk/clerk-react", () => ({
      useUser: () => ({
        user: null,
        isLoaded: true,
        isSignedIn: false,
      }),
      useAuth: () => ({
        getToken: vi.fn().mockResolvedValue(null),
        signOut: vi.fn(),
      }),
      SignedIn: () => null,
      SignedOut: ({ children }: { children: React.ReactNode }) => (
        <>{children}</>
      ),
      ClerkProvider: ({ children }: { children: React.ReactNode }) => (
        <>{children}</>
      ),
    }));
  },

  // Reset mocks
  reset: () => {
    vi.resetAllMocks();
    vi.clearAllMocks();
  },
};

// Error simulation utilities
export const errorSimulation = {
  // Component that throws an error
  ThrowingComponent: ({
    shouldThrow = true,
    errorMessage = "Test error",
  }: {
    shouldThrow?: boolean;
    errorMessage?: string;
  }) => {
    if (shouldThrow) {
      throw new Error(errorMessage);
    }
    return <div data-testid="no-error">No error</div>;
  },

  // Async component that throws an error
  AsyncThrowingComponent: ({
    shouldThrow = true,
    errorMessage = "Async test error",
  }: {
    shouldThrow?: boolean;
    errorMessage?: string;
  }) => {
    if (shouldThrow) {
      throw new Promise((_, reject) => reject(new Error(errorMessage)));
    }
    return <div data-testid="no-async-error">No async error</div>;
  },

  // Mock API error responses
  mockApiError: (statusCode: number = 500, message: string = "API Error") => {
    return {
      status: statusCode,
      data: null,
      error: {
        message,
        code: statusCode,
      },
    };
  },
};

// Form testing utilities
export const formUtils = {
  // Test XSS inputs
  xssInputs: [
    '<script>alert("xss")</script>',
    '"><script>alert("xss")</script>',
    '<img src="x" onerror="alert(\'xss\')">',
    'javascript:alert("xss")',
    "<svg onload=\"alert('xss')\">",
    "<iframe src=\"javascript:alert('xss')\"></iframe>",
  ],

  // Test SQL injection inputs (for input validation)
  sqlInjectionInputs: [
    "'; DROP TABLE users; --",
    "1' OR '1'='1",
    "admin'--",
    "'; EXEC xp_cmdshell('dir'); --",
  ],
};

// Router testing utilities
export const routerUtils = {
  // Navigate to a route and wait for it to load
  navigateToRoute: (path: string) => {
    window.history.pushState({}, "", path);
  },

  // Mock router params
  mockParams: (params: Record<string, string>) => {
    vi.mock("react-router", async () => {
      const actual = await vi.importActual("react-router");
      return {
        ...actual,
        useParams: () => params,
      };
    });
  },
};

// API mocking utilities
export const apiMocks = {
  // Mock successful API responses
  success: (data: any) => ({
    status: 200,
    data,
    error: null,
  }),

  // Mock error API responses
  error: (statusCode: number = 500, message: string = "API Error") => ({
    status: statusCode,
    data: null,
    error: {
      message,
      code: statusCode,
    },
  }),

  // Mock loading state
  loading: () => ({
    status: null,
    data: null,
    error: null,
    isLoading: true,
  }),
};

// Re-export everything from React Testing Library
export * from "@testing-library/react";

// Override render method
export { customRender as render };
