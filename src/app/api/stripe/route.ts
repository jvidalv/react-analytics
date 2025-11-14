import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { transactions, users } from "@/db/schema";
import { db } from "@/db";
import { eq } from "drizzle-orm";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature")!;
  let event: Stripe.Event;
  try {
    const rawBody = await req.text();
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET_KEY!,
    );
  } catch {
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 },
    );
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;

    // Retrieve the associated Checkout Session (to get product info)
    const checkoutSessions = await stripe.checkout.sessions.list({
      payment_intent: paymentIntent.id,
      expand: ["data.line_items"],
    });
    const lineItems = checkoutSessions.data[0]?.line_items?.data || [];
    // Extract product details
    const products = lineItems.map((item) => ({
      productId: item.price?.product,
      name: item.description,
      quantity: item.quantity,
      amount: item.amount_total,
      currency: item.currency,
    }));

    const product = products[0];
    if (!product || typeof product?.productId !== "string") {
      return NextResponse.json(
        { error: "Internal Server Error, no product" },
        { status: 500 },
      );
    }

    let customerEmail;
    if (typeof paymentIntent.customer === "string") {
      const customer = await stripe.customers.retrieve(paymentIntent.customer);
      customerEmail = (customer as Stripe.Customer).email;
    } else if (typeof paymentIntent.latest_charge === "string") {
      const charge = await stripe.charges.retrieve(
        paymentIntent.latest_charge as string,
      );
      customerEmail = charge.billing_details.email;
    }

    if (!customerEmail) {
      return NextResponse.json(
        { error: "Internal Server Error, no email" },
        { status: 500 },
      );
    }

    try {
      const isPlanWood = process.env.PRODUCT_WOOD_PLAN_ID === product.productId;
      const isPlanMetal =
        process.env.PRODUCT_METAL_PLAN_ID === product.productId;

      await db.insert(transactions).values({
        email: customerEmail,
        productId: product.productId,
        productName: isPlanWood ? "wood" : "metal",
      });

      const user = await db
        .select({ email: users.email, plan: users.plan })
        .from(users)
        .where(eq(users.email, customerEmail));

      if (user && (isPlanWood || isPlanMetal)) {
        await db
          .update(users)
          .set({ plan: isPlanMetal ? "metal" : "wood" })
          .where(eq(users.email, customerEmail));
      }

      return NextResponse.json({ received: true });
    } catch {
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ received: true });
}
