import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs"
import { ThemeToggle } from "@/components/shared/theme-toggle"

export const Header = () => {
  return (
    <header className="flex justify-end items-center p-4 gap-4 h-16">
      <ThemeToggle />
      <Show when="signed-out">
        <SignInButton />
        <SignUpButton>
          <button className="bg-brand-primary hover:bg-brand-primary-hover text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer transition-colors">
            Sign Up
          </button>
        </SignUpButton>
      </Show>
      <Show when="signed-in">
        <UserButton />
      </Show>
    </header>
  )
}