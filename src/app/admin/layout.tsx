export const dynamic = "force-dynamic";

export const metadata = {
  title: "Yönetim Paneli",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-ink-50">{children}</div>;
}
