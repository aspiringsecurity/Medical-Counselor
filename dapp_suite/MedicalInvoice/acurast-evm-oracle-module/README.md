# Acurast EVM Oracle Sample

This sample project provides some blueprints on how to build an EVM Oracle with Acurast.

To setup an Acurast powered EVM oracle you have to take care of two components:

- the receiving Oracle SmartContract
- the observing Oracle Script

## Oracle SmartContract

In essence your contract will have a storage of data, a way to update said storage and an interface for another contract to consume that data.

Instead of defining a new interface, in this sample we're using ChainLink's `AggregatorV2V3Interface`, the beauty of using this interface is that
every project currently compatible with ChainLink will be easy to upgrade to your new more secure and versatile Acurast solution, you just have to 
swap out your old smart contract address with the new one.

In our sample the `setPrice` interface is what is called by the oracle script. The implementation of this entrypoint in this sample is _INSECURE_ because
we don't perform checks on the the sender, nor have we implemented some threshold or aggregation logic considering multiple answers. For simplicity's sake
it's as dummy as it gets, simply writes the new data directly to storage.

Furthermore ChainLink's interface would also support historic data lookups, which is out of scope for this sample.

The solidity project is a REMIX project, it should be easy to import it and the deploy it using this link: 

## Oracle Script

The Acurast oracle script is what feeds your onchain oracle with new data. Deploying this on acurast can be done through console.acurast.com -> "Create Jobs", just copy/paste
the contents of `acurast_scripts/oracle_job.js` into the editor you see and deploy the job. Once you have processors assigned make sure to check their EVM address and fund 
said address, such that they are able to fulfill the job on-chain. Also adapt the code to point to your own contract and RPC. To code/test your script deploying a live coder
on console.acurast.com can come in handy.

For questions, feedback, remarks, improvements, feature requests don't hesitate to reach out via our social channels (Twitter, Discord or Telegram). Happy Coding!