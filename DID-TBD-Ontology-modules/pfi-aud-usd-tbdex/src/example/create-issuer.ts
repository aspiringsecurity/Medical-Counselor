import { createOrLoadDid } from './utils.js'

//
// We need to create an issuer, which will issue VCs to the customer, and is trusted by the PFI.
//
const issuer = await createOrLoadDid('issuer.json')
console.log('\nIssuer did:', issuer.did)

// wtite issuer did to file
import fs from 'fs/promises'
await fs.writeFile('issuer-did.txt', issuer.did)

console.log(`
Place the following in the seed-offerings.ts file as part of the constraint fields list:

{
  path: ['$.issuer'],
  filter: {
    type: 'string',
    const: '${issuer.did}'
  }
}

Then run npm run seed-offerings to seed the PFI with the list of offerings along with this issuer DID.

This will ensure that the PFI will trust SanctionsCredentials issued by this issuer for RFQs against those offerings.
`)




