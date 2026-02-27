# Abstraxn Signer React Quickstart

A minimal Vite + React + TypeScript quickstart demonstrating basic usage of the `@abstraxn/signer-react` SDK.

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone or download this repository

2. Install dependencies:
```bash
npm install
```

### Configure API Key

Create a `.env` file in the project root (see `env.example`) and set:

```bash
VITE_ABSTRAXN_API_KEY=your_api_key_here
```

### Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or the port shown in the terminal).

### Build

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Usage

This quickstart provides a basic example of:

- SDK onboarding UI via `ConnectButton` - Opens the Abstraxn wallet onboarding modal
- Wallet connection state management via `useAbstraxnWallet()` hook
- Wallet management UI via `WalletModal` - Shows active chains, send/transfer options
- Display connection status and wallet address

### Features

1. **Connect Wallet** - Click to open the Abstraxn onboarding UI (supports email OTP, Google, and external wallets)
2. **Open Wallet** - Opens the SDK's wallet modal with:
   - Active chain/network selector
   - Send/transfer functionality
   - Receive options
   - Wallet management features
3. **Disconnect** - Disconnects the connected wallet

### Next Steps

1. Review `src/main.tsx` for `AbstraxnProvider` setup with API key configuration
2. Review `src/App.tsx` for `ConnectButton`, `useAbstraxnWallet()`, and `WalletModal` usage
3. Refer to the [Abstraxn documentation](https://docs.abstraxn.com) for detailed SDK usage

## Project Structure

```
├── src/
│   ├── App.tsx          # Main app component with signer integration
│   ├── App.css          # Styling
│   ├── main.tsx          # React entry point
│   └── vite-env.d.ts    # Vite type definitions
├── index.html            # HTML entry point
├── package.json          # Dependencies
├── vite.config.ts        # Vite configuration
└── tsconfig.json         # TypeScript configuration
```

## Resources

- [Abstraxn Documentation](https://docs.abstraxn.com)
- [@abstraxn/signer-react on npm](https://www.npmjs.com/package/@abstraxn/signer-react)
- [Vite Documentation](https://vite.dev)

## License

MIT
