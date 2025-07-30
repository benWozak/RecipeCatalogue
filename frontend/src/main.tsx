import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { GlobalErrorBoundary } from "@/components/error";
import "./index.css";
import App from "./App.tsx";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      gcTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GlobalErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
          <App />
          {/* {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />} */}
        </ClerkProvider>
      </QueryClientProvider>
    </GlobalErrorBoundary>
  </StrictMode>
);
