// server.js (Node.js, ethers)
const express = require('express');
const bodyParser = require('body-parser');
const { ethers } = require('ethers');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

// server signing key (HOST PRIVATE KEY) - store securely
const signer = new ethers.Wallet(process.env.SERVER_PRIVATE_KEY);

// contract's domain data -- must match contract DOMAIN_SEPARATOR fields
const DOMAIN = {
  name: "AntiBotMint",
  version: "1",
  chainId: parseInt(process.env.CHAIN_ID || "1"),
  verifyingContract: process.env.CONTRACT_ADDRESS
};

const VOUCHER_TYPES = {
  Voucher: [
    { name: 'buyer', type: 'address' },
    { name: 'quantity', type: 'uint256' },
    { name: 'nonce', type: 'uint256' }
  ]
};

// Example: client calls this endpoint after solving CAPTCHA successfully
app.post('/request-voucher', async (req, res) => {
  try {
    const { buyer, quantity, captchaToken } = req.body;
    // 1) verify captchaToken with your captcha provider (reCAPTCHA, hCaptcha, Turnstile)
    //    call the provider server API here and check result. (Omitted: use their API).
    const captchaOk = true; // <-- replace with real verification
    if (!captchaOk) return res.status(400).json({ error: 'captcha failed' });

    // 2) rate-limit / enforce server-side per-IP or per-address checks (optional)
    // 3) create a nonce for this buyer (you can store in DB to validate later)
    const nonce = Math.floor(Date.now() / 1000); // simple nonce; prefer DB-backed increment

    // 4) sign the voucher
    const signature = await signer._signTypedData(
      DOMAIN,
      VOUCHER_TYPES,
      { buyer, quantity: quantity, nonce }
    );

    return res.json({ signature, nonce });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'server error' });
  }
});

app.listen(3000, () => console.log('voucher server listening on 3000'));
