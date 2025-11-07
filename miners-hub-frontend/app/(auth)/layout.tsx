/**
 * Authentication layout - Minimal layout without header/footer
 * Used for login and register pages
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}

