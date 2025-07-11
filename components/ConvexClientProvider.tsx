import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ReactNode } from "react";
import { useAuth } from "@clerk/clerk-react";

// Get the Convex URL from environment variables
const convexUrl = import.meta.env.VITE_CONVEX_URL || "https://brilliant-starfish-555.convex.cloud";

interface ConvexClientProviderProps {
  children: ReactNode;
}

export function ConvexClientProvider({ children }: ConvexClientProviderProps) {
  return (
    <ConvexProviderWithClerk client={new ConvexReactClient(convexUrl)} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  );
}
