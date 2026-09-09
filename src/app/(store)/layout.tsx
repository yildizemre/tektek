import { CartDrawer } from "@/components/cart-drawer";
import { CartProvider } from "@/components/cart-context";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WhatsappButton } from "@/components/whatsapp-button";
import { getCategoryTree, getSettings } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [categories, settings] = await Promise.all([getCategoryTree(), getSettings()]);
  const announcements = (settings.announcements ?? "").split("|").filter(Boolean);

  return (
    <CartProvider>
      <div className="flex min-h-dvh flex-col">
        <SiteHeader
          categories={categories}
          siteName={settings.site_name ?? "Enteknoloji"}
          announcements={announcements}
        />
        <main className="flex-1">{children}</main>
        <SiteFooter categories={categories} settings={settings} />
      </div>

      <CartDrawer />
      <WhatsappButton number={settings.whatsapp_number} />
    </CartProvider>
  );
}
