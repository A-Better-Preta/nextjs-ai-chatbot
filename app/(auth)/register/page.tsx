import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <SignUp 
        // This ensures that after they sign up, they go to the main app
        forceRedirectUrl="/" 
        signInUrl="/login"
      />
    </div>
  );
}