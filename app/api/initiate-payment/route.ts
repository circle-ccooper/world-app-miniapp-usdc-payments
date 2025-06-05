import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const uuid = crypto.randomUUID().replace(/-/g, "")

    // TODO: Store the ID field in your database so you can verify the payment later
    // For now, we'll just return the ID
    console.log("Payment initiated with ID:", uuid)

    return NextResponse.json({ id: uuid })
  } catch (error) {
    console.error("Payment initiation error:", error)
    return NextResponse.json({ error: "Failed to initiate payment" }, { status: 500 })
  }
}
