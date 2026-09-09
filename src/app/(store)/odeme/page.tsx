import { CheckoutForm } from "@/components/checkout-form";
import { getCurrentUser } from "@/lib/auth";
import { isIyzicoConfigured } from "@/lib/iyzico";

export const dynamic = "force-dynamic";
export const metadata = { title: "Ödeme" };

export default async function CheckoutPage() {
  const user = await getCurrentUser();

  return (
    <CheckoutForm
      iyzicoEnabled={isIyzicoConfigured()}
      customer={user ? {
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        city: user.city,
        district: user.district,
      } : undefined}
    />
  );
}
