import { permanentRedirect } from "next/navigation";

/** Legacy `/myAccount/myOrders/:id` and `/account/orders/:id` both live at `/order/:id`. */
export default async function AccountOrderRedirect({ params }: PageProps<"/account/orders/[id]">) {
  const { id } = await params;
  permanentRedirect(`/order/${encodeURIComponent(id)}`);
}
