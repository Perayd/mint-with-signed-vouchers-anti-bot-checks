// assume provider & signer already setup (Metamask)
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

async function claim(quantity, nonce, signature) {
  const priceTotal = ethers.utils.parseEther("0.05").mul(quantity);
  const tx = await contract.mintWithVoucher(quantity, nonce, signature, { value: priceTotal });
  await tx.wait();
}
