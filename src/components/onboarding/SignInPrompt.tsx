import Link from "next/link";

// Top-right prompt on the auth screens.
//  - "signup" (account-setup flow): "Already have an account? Log in"  → /login
//  - "login"  (existing-user flow):  "Don't have an account yet? Sign up" → /
// Figma nodes I1867:16948 (signup) / I1914:30905 (login).

const CONFIG = {
  signup: { text: "Already have an account?", linkText: "Log in", href: "/login" },
  login: { text: "Don't have an account yet?", linkText: "Sign up", href: "/join" },
} as const;

type SignInPromptProps = {
  variant?: keyof typeof CONFIG;
  className?: string;
};

export function SignInPrompt({ variant = "signup", className = "" }: SignInPromptProps) {
  const { text, linkText, href } = CONFIG[variant];
  return (
    <p className={`text-[16px] leading-[22px] text-text-secondary ${className}`}>
      {text}{" "}
      <Link href={href} className="font-bold text-primary hover:underline">
        {linkText}
      </Link>
    </p>
  );
}

export default SignInPrompt;
