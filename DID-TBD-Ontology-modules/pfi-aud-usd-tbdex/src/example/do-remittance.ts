import { TbdexHttpClient, Rfq, Quote, Order, OrderStatus, Close } from '@tbdex/http-client'
import { createOrLoadDid } from './utils.js'
import fs from 'fs/promises'

//
// get the PFI did and credential from earlier.
//
const pfiDid = await fs.readFile('server-did.txt', 'utf-8')
const signedCredential = await fs.readFile('signed-credential.txt', 'utf-8')





//
//  Connect to the PFI and get the list of offerings (offerings are resources - anyone can ask for them)
//
const { data } = await TbdexHttpClient.getOfferings({ pfiDid: pfiDid })
const [ offering ] = data
//console.log('offering:', JSON.stringify(offering, null, 2))


//
// Load alice's private key to sign RFQ
//
const alice = await createOrLoadDid('alice.json')
const { privateKeyJwk } = alice.keySet.verificationMethodKeys[0]
const kid = alice.document.verificationMethod[0].id



//
// And here we go with tbdex-protocol!
//

//
// to satisfy the offering we will need a credit card token:
// Create a payment token so we don't have to pass the credit card to tbdex or store it.
//
const response = await fetch('https://test-api.pinpayments.com/1/cards', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: new URLSearchParams({
    'publishable_api_key': 'pk_G2SL5A0Ihy4f4STYxYLrcQ',
    'number': '5520000000000000',
    'expiry_month': '05',
    'expiry_year': '2024',
    'cvc': '123',
    'name': 'Roland Robot',
    'address_line1': '42 Sevenoaks St',
    'address_line2': '',
    'address_city': 'Lathlain',
    'address_postcode': '6454',
    'address_state': 'WA',
    'address_country': 'Australia'
  })
})

const token = (await response.json()).response.token
console.log('payment token:', token)



// First, Create an RFQ
const rfq = Rfq.create({
  metadata: { from: alice.did, to: pfiDid },
  data: {
    offeringId: offering.id,
    payinSubunits: '100',
    payinMethod: {
      kind: 'CREDIT_CARD_TOKEN',
      paymentDetails: {
        pinPaymentsToken: token
      }
    },
    payoutMethod: {
      kind: 'AUSTRALIAN_BANK_ACCOUNT',
      paymentDetails: {
        accountNumber: '987654321', // replace with actual account number
        bsbNumber: '123456', // replace with actual BSB number
        accountName: 'Mr Roland Robot' // replace with actual account name
      }
    },
    claims: [signedCredential]
  }
})


await rfq.sign(privateKeyJwk, kid)

console.log('rfq id:', rfq.id)

const resp = await TbdexHttpClient.sendMessage({ message: rfq })
// asser that the response is a success
console.log('send rfq response', JSON.stringify(resp, null, 2))

//
//
// All interaction with the PFI happens in the context of an exchange.
// This is where for example a quote would show up in result to an RFQ:
const exchanges = await TbdexHttpClient.getExchanges({
  pfiDid: pfiDid,
  filter: { id: rfq.exchangeId },
  privateKeyJwk,
  kid
})


//
// Now lets get the quote out of the returned exchange
//
const [ exchange ] = exchanges.data
for (const message of exchange) {
  if (message instanceof Quote) {

    const quote = message as Quote
    console.log('we have a quote returned')
    // we are very trusting so lets just go and place an order against that quote:
    const order = Order.create({
      metadata: { from: alice.did, to: pfiDid, exchangeId: quote.exchangeId },
    })

    await order.sign(privateKeyJwk, kid)
    const orderResponse = await TbdexHttpClient.sendMessage({ message: order })
    console.log('we have an order response')
    console.log('orderResponse',  JSON.stringify(orderResponse, null, 2))


    // finally we poll for response.
    await pollForStatus(order, pfiDid, privateKeyJwk, kid)
  }
}

/*
 * This is a very simple polling function that will poll for the status of an order.
 */
async function pollForStatus(order, pfiDid, privateKeyJwk, kid) {
  const always = true
  while (always) {
    const exchanges = await TbdexHttpClient.getExchanges({
      pfiDid: pfiDid,
      filter: { id: order.exchangeId },
      privateKeyJwk,
      kid
    })

    const [ exchange ] = exchanges.data

    for (const message of exchange) {
      if (message instanceof OrderStatus) {
        const orderStatus = message as OrderStatus
        console.log('orderStatus', orderStatus.data.orderStatus)
      }
      if (message instanceof Close) {
        const close = message as Close
        console.log('close', close.data.reason)
        return
      }
    }
  }
}



