import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

// Get the Convex URL from environment variables
const convexUrl = import.meta.env.VITE_CONVEX_URL || "https://brilliant-starfish-555.convex.cloud";
const convex = new ConvexReactClient(convexUrl);

interface ConvexClientProviderProps {
  children: ReactNode;
}

export function ConvexClientProvider({ children }: ConvexClientProviderProps) {
  return (
    <ConvexProvider client={convex}>
      {children}
    </ConvexProvider>
  );
}
