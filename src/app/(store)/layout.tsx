import { CartDrawer } from "@/components/cart-drawer";
import { CartProvider } from "@/components/cart-context";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { VisitTracker } from "@/components/visit-tracker";
import { WhatsappButton } from "@/components/whatsapp-button";
import { getSession } from "@/lib/auth";
import { getCategoryTree, getMenuLinks, getSettings, getSlides } from "@/lib/queries";
import { themeStyle } from "@/lib/theme";

export const dynamic = "force-dynamic";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [categories, settings, links, slides, session] = await Promise.all([
    getCategoryTree(),
    getSettings(),
    getMenuLinks(),
    getSlides("footer"),
    getSession(),
  ]);

  const announcements = (settings.announcements ?? "")
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);

  return (
    <CartProvider>
      <style dangerouslySetInnerHTML={{ __html: themeStyle(settings) }} />

      <div className="flex min-h-dvh flex-col">
        <SiteHeader
          categories={categories}
          announcements={announcements}
          announcementSpeed={settings.announcement_speed ?? "32"}
          announcementsEnabled={settings.announcements_enabled !== "0"}
          session={session ? { name: session.name, role: session.role } : null}
          logoText={settings.logo_text || settings.site_name || "Tek Teknoloji"}
          logoUrl={settings.logo_url ?? ""}
          supportPhone={settings.support_phone ?? ""}
        />

        <main className="flex-1">{children}</main>

        <SiteFooter categories={categories} settings={settings} links={links} slides={slides} />
      </div>

      <CartDrawer />
      {settings.whatsapp_enabled !== "0" && (
        <WhatsappButton
          number={settings.whatsapp_number}
          phoneLabel={settings.support_phone ?? ""}
          message={settings.whatsapp_message ?? ""}
        />
      )}
      <VisitTracker />
    </CartProvider>
  );
}
