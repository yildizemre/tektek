import { CheckoutForm } from "@/components/checkout-form";
import { isIyzicoConfigured } from "@/lib/iyzico";

export const dynamic = "force-dynamic";
export const metadata = { title: "Ödeme" };

export default function CheckoutPage() {
  return <CheckoutForm iyzicoEnabled={isIyzicoConfigured()} />;
}
