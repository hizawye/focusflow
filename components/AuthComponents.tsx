import { 
  SignInButton, 
  SignUpButton, 
  UserButton, 
  useUser,
  SignedIn, 
  SignedOut 
} from '@clerk/clerk-react';

export function AuthButton() {
  const { user } = useUser();

  return (
    <div className="flex items-center gap-2">
      <SignedOut>
        <div className="flex items-center gap-2">
          <SignInButton mode="modal">
            <button className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Sign In
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md transition-colors">
              Sign Up
            </button>
          </SignUpButton>
        </div>
      </SignedOut>
      <SignedIn>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {user?.firstName ? `Welcome, ${user.firstName}` : 'Welcome!'}
          </span>
          <UserButton 
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "w-8 h-8"
              }
            }}
          />
        </div>
      </SignedIn>
    </div>
  );
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  return (
    <SignedIn>
      {children}
    </SignedIn>
  );
}

export function UnauthenticatedState() {
  return (
    <SignedOut>
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Welcome to FocusFlow
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Sign in to access your personal schedule and track your productivity.
          </p>
          <div className="flex justify-center gap-4">
            <SignInButton mode="modal">
              <button className="px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="px-6 py-3 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors">
                Sign Up
              </button>
            </SignUpButton>
          </div>
        </div>
      </div>
    </SignedOut>
  );
}
