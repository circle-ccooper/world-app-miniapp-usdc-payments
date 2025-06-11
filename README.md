# World Chain T-Shirt Store Mini App

A sample mini app for World App that demonstrates how to build a bot-proof e-commerce experience using World ID for human verification and USDC (USDC.e) as the payment method, powered by the MiniKit-JS SDK.

## Features
- **World ID Human Verification**: Only verified humans can access and purchase items.
- **USDC Payments**: Accepts USDC (USDC.e) payments natively inside World App using the Pay Command.
- **Modern UI**: Clean, mobile-friendly interface.

## Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/) or [yarn](https://yarnpkg.com/)
- [World App Developer Account](https://developer.worldcoin.org/)

## Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/world-app-miniapp-usdc-payments.git
cd world-app-miniapp-usdc-payments
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory and add your World App credentials:

```env
NEXT_PUBLIC_APP_ID=your_world_app_id
DEV_PORTAL_API_KEY=your_dev_portal_api_key
```

- `NEXT_PUBLIC_APP_ID`: Your World App Mini App ID
- `DEV_PORTAL_API_KEY`: Your World App Developer Portal API Key

### 4. Run the Development Server
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the app.

## Code Structure
```
app/
  layout.tsx         # App layout, wraps with MiniKitProvider
  page.tsx           # Main T-shirt store UI and logic
components/
  minikit-provider.tsx # Initializes MiniKit SDK
  ui/                # UI components (Button, etc.)
public/
  world-tshirt.png   # T-shirt product image
```

## Key Integration Points

### World ID Verification
```tsx
const handleVerify = async () => {
  const verifyPayload = {
    action: "access_tshirt_store",
    verification_level: VerificationLevel.Orb,
  }
  const { finalPayload } = await MiniKit.commandsAsync.verify(verifyPayload)
  // Send proof to backend for validation
}
```

### USDC Payment with Pay Command
```tsx
const paymentPayload = {
  reference: id,
  to: "0xYourMerchantWalletAddress",
  tokens: [
    {
      symbol: Tokens.USDCE,
      token_amount: tokenToDecimals(25, Tokens.USDCE).toString(),
    },
  ],
  description: "World Chain T-Shirt",
}
const { finalPayload } = await MiniKit.commandsAsync.pay(paymentPayload)
```

## Deployment
This app is ready to deploy on [Vercel](https://vercel.com/) or any platform that supports Next.js.

## License
MIT

## Resources
- [MiniKit-JS SDK Documentation](https://developer.worldcoin.org/docs/minikit-js)
- [World App Developer Portal](https://developer.worldcoin.org/)

---

**Build secure, bot-proof, and monetizable mini apps for World App!** 