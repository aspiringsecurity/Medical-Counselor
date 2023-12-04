import { createOrLoadDid } from './utils.js'


//
// Create a did for Alice, who is the customer of the PFI in this case.
//
const alice = await createOrLoadDid('alice.json')
console.log('DID for alice:', alice.did)

// write alices did to a file using fs
import fs from 'fs/promises'
await fs.writeFile('alice-did.txt', alice.did)
