import { useContext, useEffect, useState } from 'react'
import { SubsocialContext } from './subsocial/provider'
import polkadotjs from './subsocial/wallets/polkadotjs'
import { IpfsContent } from '@subsocial/api/substrate/wrappers'
import { SpaceData } from '@subsocial/api/types'
import { CustomNetwork, Mainnet, Testnet } from './subsocial/config'
import Button from './components/Button'
import './App.css'
import Chip from './components/Chip'
import Space from './components/Space'

// This is the start of the React app built using Subsocial Starter.
export default function App() {
  // SubsocialContext can be used using useContext hook and it provides
  // access to the [api] module i.e. SubsocialApi and other methods like
  // changeNetwork (changing from testnet(default) to mainnet/localnet).
  // It also gives you access to getters like [isReady] that helps you know [api]
  // initlaization status.
  const { isReady, api, network, changeNetwork } = useContext(SubsocialContext)
  const [space, setSpace] = useState<SpaceData>()

  useEffect(() => {
    console.log(`Is API ready: ${isReady}`)
  }, [isReady, api])

  // Maps the network to the network name string.
  const getNetworkName = (network: CustomNetwork) => {
    if (network === Testnet) return 'Testnet'
    if (network === Mainnet) return 'Mainnet'
    return 'Custom Network'
  }

  // Once [api] is initialized, all the API methods from Subsocial SDK are in
  // ready-to-use condition. For example: Fetching data about a Space.
  //
  // To know more about Subsocial SDK methods, Checkout:
  // Quick Reference Guide: https://docs.subsocial.network/docs/develop/quick-reference
  // Subsocial Playground:  https://play.subsocial.network
  const getSpace = async () => {
    if (space) {
      setSpace(undefined)
      return
    }
    if (!isReady || !api) {
      console.log({ message: 'Unable to connect to the API.' })
      return
    }
    const spaceId = '1005'
    const res = await api.findSpace({ id: spaceId })
    setSpace(res)
    console.log(res)
  }

  // Creating a space on Subsocial network.
  const createSpace = async () => {
    setSpace(undefined)

    // Always assure, the [api] is not null using [isReady] property.
    if (!isReady || !api) {
      console.log({ message: 'Unable to connect to the API.' })
      return
    }

    if (getNetworkName(network) === 'Mainnet') {
      console.log({
        message: 'You need to use your own IPFS endpoint to store data.',
      })
      return
    }

    // Saves this data on IPFS.
    // On testnet, the data is stored on CRUST IPFS test mnemonic automatically.
    //
    // To change the IPFS either pass [CustomNetwork] or call [setupCrustIPFS] with
    // your mnemonic (MAKE SURE TO HIDE MNEOMIC BEFORE UPLOADING TO PUBLIC NETWORK).
    const cid = await api.ipfs.saveContent({
      about:
        'Subsocial is an open protocol for decentralized social networks and marketplaces. It`s built with Substrate and IPFS',
      image: null,
      name: 'Subsocial',
      tags: ['subsocial'],
    })
    const substrateApi = await api.blockchain.api

    const spaceTransaction = substrateApi.tx.spaces.createSpace(
      IpfsContent(cid),
      null // Permissions config (optional)
    )

    // Using the [polkadotjs] property, imported from context hook.
    // This gives you with a set of methods like [getAllAccounts], [logTransaction],
    // [signAndSendTx], etc. These are using Polkadotjs extension library internally.
    const accounts = await polkadotjs.getAllAccounts()
    if (accounts.length > 0) {
      await polkadotjs.signAndSendTx(spaceTransaction, accounts[0].address)
      alert('API response added in browser console logs.')
    }
  }

  const toggleNetwork = async () => {
    if (network === Testnet) {
      changeNetwork(Mainnet)
    } else {
      changeNetwork(Testnet)
    }
  }

  return (
    <main>
      <div className='header'>
        <h1 className='title'>Welcome to Subsocial Starter</h1>
        <div className='connection-container'>
          <div className='connection'>
            You are{' '}
            {isReady ? (
              <Chip className='connection-chip' size='small' color='green'>
                connected
              </Chip>
            ) : (
              <Chip className='connection-chip' size='small' color='blue'>
                connecting
              </Chip>
            )}{' '}
            to Subsocial's {getNetworkName(network)}
          </div>
          <div className='connection'>
            and the configuration can be seen in{' '}
            <Chip className='connection-chip' size='small' color='blue'>
              subsocial/config.ts
            </Chip>
            .
          </div>
        </div>
        <p>
          Check out our{' '}
          <a
            target='_blank'
            rel='noreferrer'
            href='https://docs.subsocial.network/docs/develop/'>
            Docs
          </a>{' '}
          and try the{' '}
          <a
            target='_blank'
            rel='noreferrer'
            href='https://play.subsocial.network/'>
            Playground
          </a>
        </p>
      </div>
      <div className='button-container'>
        <Button
          isActive={!!space}
          onClick={getSpace}
          title='Fetch Space'
          loadingText='Loading...'>
          Fetch Space
        </Button>
        <Button
          onClick={createSpace}
          title='Create Space'
          loadingText='Sending...'
        />
        <Button
          onClick={toggleNetwork}
          title='Toggle Network'
          loadingText='Loading...'
        />
      </div>
      {space ? (
        <div>
          <Space spaceData={space} />
          <p className='space-full-response'>
            Open the web developer console to see the full response.
          </p>
        </div>
      ) : (
        <div className='dev-console-notice'>
          <img src='/rocket.png' alt='rocket' />
          <p>Open the web developer console to see the response.</p>
        </div>
      )}
    </main>
  )
}
