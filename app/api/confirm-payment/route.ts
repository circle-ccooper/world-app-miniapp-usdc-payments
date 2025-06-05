import { type NextRequest, NextResponse } from "next/server"
import type { MiniAppPaymentSuccessPayload } from "@worldcoin/minikit-js"

interface IRequestPayload {
  payload: MiniAppPaymentSuccessPayload
}

export async function POST(req: NextRequest) {
  try {
    const { payload } = (await req.json()) as IRequestPayload

    // TODO: Fetch the reference from your database
    // const reference = getReferenceFromDB()

    // For now, we'll verify the transaction directly
    const response = await fetch(
      `https://developer.worldcoin.org/api/v2/minikit/transaction/${payload.transaction_id}?app_id=${process.env.NEXT_PUBLIC_APP_ID}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.DEV_PORTAL_API_KEY}`,
        },
      }
    )

    if (!response.ok) {
      return NextResponse.json({ success: false, error: "Failed to verify transaction" }, { status: 400 })
    }

    const transaction = await response.json()

    // Verify the transaction status
    if (transaction.status !== "failed") {
      // TODO: Update your database to mark the order as paid
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: false, error: "Transaction failed" }, { status: 400 })
  } catch (error) {
    console.error("Payment confirmation error:", error)
    return NextResponse.json({ success: false, error: "Failed to confirm payment" }, { status: 500 })
  }
}
