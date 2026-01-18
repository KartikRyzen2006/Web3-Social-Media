# Liberty Social - Decentralized Social Media Dapp

Build & Deploy Decentralized (Web3) Social Media DApp | Solidity, Next.js, Hardhat, Wagmi Tutorial (Full Stack Web3 Project)

A beautiful, feature-rich decentralized social media platform built with Next.js, Tailwind CSS, and integrated with your Solidity smart contract. Users can create profiles, share posts with media, follow each other, join groups, and send messages - all stored on the blockchain.


- **User Profiles**: Create and manage blockchain-based user profiles
- **Posts & Media**: Share text, images, and videos via IPFS
- **Social Interactions**: Like, comment, follow/unfollow users
- **Groups**: Create and join community groups (admin only)
- **Direct Messaging**: Send private messages between users
- **Admin Panel**: Complete contract management for administrators
- **Responsive Design**: Beautiful Facebook-like UI that works on all devices
- **IPFS Integration**: Decentralized media storage via Pinata

## 🛠 Technology Stack

- **Frontend**: Next.js 13, React 18, Tailwind CSS
- **Blockchain**: Ethereum/Holesky Testnet, Ethers.js
- **Wallet Integration**: RainbowKit, Wagmi
- **Storage**: Pinata IPFS
- **Styling**: Tailwind CSS with custom components
- **Icons**: React Icons
- **Notifications**: React Hot Toast

## 📋 Prerequisites

Before you begin, ensure you have:

- A wallet (MetaMask recommended)
- Pinata account for IPFS storage
- WalletConnect Project ID
- Your deployed smart contract address


# Wallet Connect & Blockchain Configuration
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_wallet_connect_project_id
NEXT_PUBLIC_RPC_URL=https://ethereum-holesky-rpc.publicnode.com
NEXT_PUBLIC_CHAIN_ID=17000
NEXT_PUBLIC_CHAIN_NAME=Holesky Testnet
NEXT_PUBLIC_CHAIN_SYMBOL=ETH
NEXT_PUBLIC_BLOCK_EXPLORER=https://holesky.etherscan.io
NEXT_PUBLIC_PLATFORM_NAME=Liberty Social

# Smart Contract Configuration
NEXT_PUBLIC_CONTRACT_ADDRESS=your_deployed_contract_address

# Pinata IPFS Configuration
NEXT_PUBLIC_PINATA_API_KEY=your_pinata_api_key
NEXT_PUBLIC_PINATA_SECRET_API_KEY=your_pinata_secret_api_key
NEXT_PUBLIC_PINATA_JWT=your_pinata_jwt_token
NEXT_PUBLIC_PINATA_GATEWAY=https://gateway.pinata.cloud

## 📁 Project Structure

```
├── components/
│   ├── Layout/
│   │   ├── Layout.js          # Main layout wrapper
│   │   ├── Header.js          # Navigation header
│   │   └── Sidebar.js         # Sidebar navigation
│   ├── Posts/
│   │   ├── CreatePost.js      # Post creation component
│   │   └── PostCard.js        # Individual post display
│   ├── Groups/
│   │   └── CreateGroupModal.js # Group creation modal
│   └── UI/
│       └── LoadingSpinner.js  # Reusable loading component
├── contexts/
│   └── UserProfileContext.js  # User profile context
├── lib/
│   ├── config.js              # Wagmi configuration
│   ├── constants.js           # App constants
│   ├── contractABI.js         # Smart contract ABI
│   ├── contract.js            # Contract service layer
│   └── pinata.js              # IPFS service layer
├── pages/
│   ├── _app.js                # Next.js app wrapper
│   ├── index.js               # Home page
│   ├── users.js               # Users discovery page
│   ├── groups.js              # Groups page
│   ├── admin.js               # Admin panel
│   └── profile/
│       └── setup.js           # Profile setup page
└── styles/
    └── globals.css            # Global styles
```

## 🔑 Key Features Walkthrough

### For Users:

1. **Connect Wallet** - Use the connect button in the header
2. **Setup Profile** - Create your username (one-time setup)
3. **Create Posts** - Share text, images, or videos
4. **Social Features** - Like, comment, follow other users
5. **Join Groups** - Participate in community groups
6. **Direct Messages** - Send private messages

### For Admins:

1. **Access Admin Panel** - Available at `/admin` for contract owner
2. **Monitor Stats** - View total users, posts, groups
3. **Contract Controls** - Pause/unpause contract functionality
4. **Emergency Functions** - Withdraw funds, deactivate groups

## 🎨 Customization

### Styling

- Modify `tailwind.config.js` for theme customization
- Update `styles/globals.css` for global style changes
- Component-specific styles are in individual component files

### Features

- Add new pages in the `pages/` directory
- Extend contract service in `lib/contract.js`
- Add new UI components in `components/`

## 🔒 Security Considerations

- All sensitive data is stored on-chain or IPFS
- Private keys never leave the user's wallet
- Admin functions are restricted to contract owner
- Input validation on all user interactions

## 🐛 Troubleshooting

### Common Issues:

1. **Wallet Connection Issues**

   - Ensure correct network is selected
   - Check RPC URL in environment variables

2. **IPFS Upload Failures**

   - Verify Pinata API keys
   - Check file size limits (10MB default)

3. **Transaction Failures**

   - Ensure sufficient gas fees
   - Check if contract is paused

4. **Profile Not Loading**
   - Confirm contract address is correct
   - Verify user has created a profile

## 📝 Smart Contract Functions Used

The frontend integrates with all major contract functions:

- **Profile Management**: `createProfile`, `getProfile`
- **Posts**: `createPost`, `likePost`, `addComment`, `editPost`, `deletePost`
- **Social**: `followUser`, `unfollowUser`, `checkIsFollowing`
- **Groups**: `createGroup`, `joinGroup`, `sendGroupMessage`
- **Messaging**: `sendDirectMessage`, `getDirectMessages`
- **Admin**: `pause`, `unpause`, `emergencyWithdraw`



## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.


## 🎉 Deployment

### Vercel (Recommended)

1. Upload your project to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy.

### Other Platforms

The app can be deployed on any platform that supports Next.js:

- Netlify
- AWS Amplify
- Heroku
- DigitalOcean App Platform

---

**Happy Building!** 🚀

Your decentralized social media platform is ready to launch. Users can now create profiles, share content, and build communities entirely on the blockchain!
