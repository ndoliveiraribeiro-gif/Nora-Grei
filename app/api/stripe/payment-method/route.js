import { NextResponse } from "next/server";

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  const Stripe = require("stripe");
  return Stripe(process.env.STRIPE_SECRET_KEY);
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id em falta" }, { status: 400 });

    const stripe = getStripe();
    if (!stripe) return NextResponse.json({ data: null });

    const pm = await stripe.paymentMethods.retrieve(id);
    return NextResponse.json({ data: pm });
  } catch (error) {
    console.error("stripe/payment-method error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
