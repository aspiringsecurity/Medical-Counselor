# Decentralized NFT-based voting system for Decentralized Medical Counseling on Metis network

We are extending the Tribunals dapp to develop a decentralized NFT-based voting system for contract work for Medical Counselors and public hospital doctors governed by Ministry of Healthcare. DAOs can issue NFTs to wallets based on what matters to their community and the holders of these NFTs can create proposals and vote on these proposals whilst they have the NFTs of that contract work.
Users don't have to pay gas to participate in DAO governance.

IPFS:  - Votes are uploaded to IPFS with the most recent vote linking to one before. This is done by storing the previous vote's CID in the file of the newest one. Therefore a chain of verifiable data is created.


## Tech Stack

The app has been built with Metis, IPFS, Coinbase SDK, WorldCoin SDK, Moralis, Polygon Mainnet, Vercel, React, Web3.storage e.t.c


## How Contract DAOs work

 - DAOs or Organisations create a **Request for Medical Counseling** on the app. 
 - Users can join a counselor by minting an NFT of that counseling request
 - Users that have a certain counseliing request's NFT are eligible to create counseling requests and vote on them. 
 - Voting is gasless and the vote is stored on IPFS
