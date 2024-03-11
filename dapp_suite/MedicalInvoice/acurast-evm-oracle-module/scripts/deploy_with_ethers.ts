import { deploy } from './ethers-lib'

(async () => {
  try {
    const result = await deploy('DummyChainlinkCompatibleOracle', [])
    console.log(`address: ${result.address}`)
  } catch (e) {
    console.log(e.message)
  }
})()