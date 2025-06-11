// T-Shirt Store Mini App Sample
// ---------------------------------------------
// This sample demonstrates how to build a World App mini app
// that uses World ID for human verification and USDC.e (USDC on World Chain)
// as the payment method for purchasing a T-shirt. The code is heavily commented
// to help developers understand the integration points for both verification and payment.

"use client"

import { useState } from "react"
import {
  MiniKit,
  type VerifyCommandInput,
  type PayCommandInput,
  Tokens,
  tokenToDecimals,
  VerificationLevel,
} from "@worldcoin/minikit-js"
import { Button } from "@/components/ui/button"
import { CheckCircle, ArrowLeft, Star, ShoppingBag, Shield, CreditCard } from "lucide-react"

// Main T-Shirt Store Component
export default function TShirtStore() {
  // --- State Management ---
  // Track verification, purchase, loading, and user selections
  const [isVerified, setIsVerified] = useState(false)
  const [isPurchased, setIsPurchased] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedSize, setSelectedSize] = useState("M")
  const [selectedColor, setSelectedColor] = useState("Black")

  // Available sizes and colors
  const sizes = ["S", "M", "L", "XL", "XXL"]
  const colors = [
    { name: "Black", value: "#000000" },
    { name: "White", value: "#FFFFFF" },
    { name: "Purple", value: "#8B5CF6" },
    { name: "Gray", value: "#6B7280" },
  ]

  // --- World ID Human Verification ---
  // This function triggers the World ID verification flow in World App
  const handleVerify = async () => {
    if (!MiniKit.isInstalled()) {
      alert("Please open this app in World App")
      return
    }
    setIsLoading(true)
    try {
      // Prepare verification payload
      const verifyPayload: VerifyCommandInput = {
        action: "access_tshirt_store",
        verification_level: VerificationLevel.Orb, // Require Orb-level verification
      }
      // Trigger verification in World App
      const { finalPayload } = await MiniKit.commandsAsync.verify(verifyPayload)
      if (finalPayload.status === "success") {
        // Send proof to backend for validation
        const verifyResponse = await fetch("/api/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            payload: finalPayload,
            action: "access_tshirt_store",
          }),
        })
        const verifyResult = await verifyResponse.json()
        if (verifyResult.success) {
          setIsVerified(true)
        } else {
          alert("Verification failed. Please try again.")
        }
      }
    } catch (error) {
      console.error("Verification error:", error)
      alert("Verification failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // --- USDC Payment Integration ---
  // This function triggers the payment flow using USDC on World Chain
  const handlePurchase = async () => {
    if (!MiniKit.isInstalled()) {
      alert("Please open this app in World App")
      return
    }
    setIsLoading(true)
    try {
      // Initiate payment on backend to get a reference ID
      const res = await fetch("/api/initiate-payment", { method: "POST" })
      const { id } = await res.json()
      // Prepare payment payload for World App
      const paymentPayload: PayCommandInput = {
        reference: id, // Unique reference for this payment
        to: "0x17C07a3F1e95A3919d6Bf8B3244A6f0e2bB2568A", // Merchant wallet address
        tokens: [
          {
            symbol: Tokens.USDC, // Use USDC as the payment token
            token_amount: tokenToDecimals(25, Tokens.USDC).toString(), // $25 in USDC (with correct decimals)
          },
        ],
        description: `World Chain T-Shirt - ${selectedColor} ${selectedSize}`,
      }
      // Trigger payment in World App
      const { finalPayload } = await MiniKit.commandsAsync.pay(paymentPayload)
      if (finalPayload.status === "success") {
        // Confirm payment on backend
        const confirmResponse = await fetch("/api/confirm-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(finalPayload),
        })
        const payment = await confirmResponse.json()
        if (payment.success) {
          setIsPurchased(true)
        } else {
          alert("Payment confirmation failed. Please contact support.")
        }
      }
    } catch (error) {
      console.error("Payment error:", error)
      alert("Payment failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // --- UI: Show order confirmation if purchased ---
  if (isPurchased) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="flex flex-col items-center justify-center min-h-screen p-6">
          <div className="w-32 h-32 bg-purple-600 rounded-full flex items-center justify-center mb-8">
            <ShoppingBag className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Order Placed Successfully!</h1>
          <p className="text-gray-400 text-center mb-8 max-w-sm">
            You will receive an email confirmation. Your World Chain T-Shirt will be shipped soon!
          </p>
          <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm mb-8">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-400">Order Details</span>
              <span className="text-purple-400">#WC001</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>World Chain T-Shirt</span>
                <span>$25.00</span>
              </div>
              <div className="flex justify-between text-sm text-gray-400">
                <span>Size: {selectedSize}</span>
                <span>Color: {selectedColor}</span>
              </div>
            </div>
          </div>
          <Button
            className="w-full max-w-sm bg-purple-600 hover:bg-purple-700 text-white rounded-2xl h-14 text-lg font-semibold"
            onClick={() => window.location.reload()}
          >
            Shop More Items
          </Button>
        </div>
      </div>
    )
  }

  // --- UI: Main Storefront ---
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <ArrowLeft className="w-6 h-6" />
        <h1 className="text-lg font-semibold">World Chain Store</h1>
        <div className="w-6 h-6" />
      </div>
      {/* Product Image */}
      <div className="relative h-80 flex items-center justify-center bg-white rounded-2xl mb-6">
        <img
          src="/world-tshirt.png"
          alt="World Chain T-Shirt"
          className="object-contain w-full h-full p-6"
        />
        {isVerified && (
          <div className="absolute top-4 right-4 bg-green-600 rounded-full p-2">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
        )}
      </div>
      {/* Product Info */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold">World Chain T-Shirt</h2>
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-400 ml-1">4.8</span>
          </div>
        </div>
        <p className="text-gray-400 mb-4">Limited Edition • Premium Quality</p>
        <div className="text-3xl font-bold mb-6">$25.00 USDC</div>
        {/* Verification Status */}
        {!isVerified ? (
          <div className="bg-yellow-900/30 border border-yellow-600 rounded-2xl p-4 mb-6">
            <div className="flex items-center mb-2">
              <Shield className="w-5 h-5 text-yellow-400 mr-2" />
              <span className="font-semibold text-yellow-400">Verification Required</span>
            </div>
            <p className="text-sm text-yellow-200">
              Verify your World ID to access this exclusive item for verified humans only.
            </p>
          </div>
        ) : (
          <div className="bg-green-900/30 border border-green-600 rounded-2xl p-4 mb-6">
            <div className="flex items-center mb-2">
              <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
              <span className="font-semibold text-green-400">Verified Human</span>
            </div>
            <p className="text-sm text-green-200">You're verified! You can now purchase this exclusive item.</p>
          </div>
        )}
        {/* Size Selection (only after verification) */}
        {isVerified && (
          <>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Size</h3>
              <div className="flex gap-3">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 rounded-xl border-2 font-semibold ${
                      selectedSize === size
                        ? "border-purple-600 bg-purple-600 text-white"
                        : "border-gray-600 text-gray-400 hover:border-gray-500"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
            {/* Color Selection */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-3">Color</h3>
              <div className="flex gap-3">
                {colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center ${
                      selectedColor === color.name ? "border-purple-600" : "border-gray-600"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: color.value }} />
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
        {/* Product Features */}
        <div className="bg-gray-800 rounded-2xl p-4 mb-8">
          <h3 className="font-semibold mb-3">Features</h3>
          <div className="space-y-2 text-sm text-gray-400">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-purple-600 rounded-full mr-3" />
              100% Organic Cotton
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-purple-600 rounded-full mr-3" />
              World Chain Logo Design
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-purple-600 rounded-full mr-3" />
              Limited Edition
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-purple-600 rounded-full mr-3" />
              Unisex Sizing
            </div>
          </div>
        </div>
        {/* Action Button: Verify or Buy */}
        {!isVerified ? (
          <Button
            onClick={handleVerify}
            disabled={isLoading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-2xl h-14 text-lg font-semibold"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                Verifying...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <Shield className="w-5 h-5 mr-2" />
                Verify with World ID
              </div>
            )}
          </Button>
        ) : (
          <Button
            onClick={handlePurchase}
            disabled={isLoading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-2xl h-14 text-lg font-semibold"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                Processing Payment...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Buy with USDC
              </div>
            )}
          </Button>
        )}
        <p className="text-xs text-gray-500 text-center mt-4">Powered by World Chain Mini App SDK</p>
      </div>
    </div>
  )
}
