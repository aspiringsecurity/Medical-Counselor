# Example tbdex remittance for USD to AUD

This is an example USD to AUD remittance PFI implementation using the tbdex protocol.
It offers up exchange from USD to AUD and remitts the funds via an Australian Bank Account transfer.

USD can be provided via credit card, and USDC (TODO: FUTURE) 

In the [do-remittance.ts](src/example/do-remittance.ts) example client it creates a token for the card, uses a verifiable credential and tbdex never sees the card information. 

NOTE: this is not using market rates, or anything sensible, and is for illustrative purposes only, not production use.  

<img width="984" alt="Screenshot 2023-11-25 at 8 48 29 am" src="https://github.com/TBD54566975/example-aud-usd-pfi/assets/14976/2f86b963-b63e-4f68-a277-a0b5882d7385">


# Development Prerequisites
## `node` and `npm`
This project is using `node v20.3.1` and `npm >=v7.0.0`. You can verify your `node` and `npm` installation via the terminal:

```
$ node --version
v20.3.1
$ npm --version
9.6.7
```

If you don't have `node` installed, feel free to choose whichever installation approach you feel the most comfortable with. If you don't have a preferred installation method, we recommend using `nvm` (aka node version manager). `nvm` allows you to install and use different versions of node. It can be installed by running `brew install nvm` (assuming that you have homebrew)

Once you have installed `nvm`, install the desired node version with `nvm install vX.Y.Z`.

## Docker
Docker is used to spin up a local mysql container. Docker for Mac can be installed from [here](https://docs.docker.com/desktop/install/mac-install/)

## `dbmate`
dbmate is used to run database migrations. Run `brew install dbmate` from your command line

# Preparing setup (one time)

> 💡 Make sure you have all the [prerequisites](#development-prerequisites)

1) run `cp .env.example .env`. This is where you can set any necessary environment variables. `.env.example` contains all environment variables that you _can_ set.
2) Go to https://pinpayments.com/ and sign up to an account, then get a test api secret key and publicly sharable key.
3) Put the secret key in .env, and the publicly sharable key in example

`npm run server` to check it runs. 

# Running end to end remittance flow


## Step 1 
Ensure you have prequesites installed and the server database is running (see above)

## Step 2: Create a VC issuer
Run `npm run example-create-issuer` to create a new VC issuer, which will be needed by the PFI. 
(`issuer.json` stores the private info for the issuer).

## Step 3: Create the identity for customer "Alice"

Run `npm run example-create-customer` to create a new "customer" DID (customer is called Alice, think of it as her wallet).

Alice's private wallet info is stored in `alice.json`. Her public DID is stored in `alice-did.txt`.

## Step 4: Issue a sanctions check VC to "Alice"

Issue the credential to alice, which ensures Alice is a non-sanctioned individual.

Run `npm run example-issue-credential`. This will save a `signed-credential.txt` file which contains the signed VC for convenience.

## Step 5: Run the PFI server

Run the server (or restart it) in another terminal window: 

`npm run server`

## Step 6: Run the remittance flow

`npm run example-remittance`


Each interaction happens in the context of an "Exchange" which is a record of the interaction between the customer and the PFI.


# Implementing a PFI

The business logic for the PFI is mainly in [main.ts](src/main.ts) and the offerings as specified in [offerings.ts](src/offerings.ts). Poke around!

You also should use a non ephemeral DID (using the env vars config as described above), and store the keys in secure locations via a secrets manager.



# DB stuff
## Convenience Scripts

| Script                       | Description                                                                               |
| ---------------------------- | ----------------------------------------------------------------------------------------- |
| `./db/scripts/start-pg`   | Starts dockerized psql if it isn't already running.                                      |
| `./db/scripts/stop-pg`    | Stops dockerized psql if it is running. Passing `-rm` will delete the container as well. |
| `./db/scripts/use-pg`     | Drops you into a psql shell.                                                             |
| `./db/scripts/new-migration` | Creates a new migration file.                                                             |
| `./db/scripts/migrate`       | Runs DB migrations.                                                                       |

## Migration files
Migration files live in the `db/migrations` directory. This is where all of our database schemas live.

### Adding a migration file
to create a new migration file, run the following command from the command line

```bash
./db/scripts/new-migration replace_with_file_name
```

This will generate a barebones migration template file for you

>💡 The above example assumes you're in the root directory of the project. adjust the path to the script if you're not in the root.

>💡 for `replace_with_file_name`, the general convention i think is `<action>_<tblname>_table`. e.g. if you're wanting to create a migration file to create a `quotes` table, you could use `create_quotes_table` as the filename.
### Running migrations
Migrations can be applied by running `./db/scripts/migrate` from the command line

## Running Manual Queries & Debugging

From the command line, run: 
```bash
./db/scripts/use-pg
```

This will drop you into an interactive db session

# Configuration
Configuration can be set using environment variables. Defaults are set in `src/config.ts`

# Project Resources

| Resource                                   | Description                                                                    |
| ------------------------------------------ | ------------------------------------------------------------------------------ |
| [CODEOWNERS](./CODEOWNERS)                 | Outlines the project lead(s)                                                   |
| [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) | Expected behavior for project contributors, promoting a welcoming environment |
| [CONTRIBUTING.md](./CONTRIBUTING.md)       | Developer guide to build, test, run, access CI, chat, discuss, file issues     |
| [GOVERNANCE.md](./GOVERNANCE.md)           | Project governance                                                             |
| [LICENSE](./LICENSE)                       | Apache License, Version 2.0                                                    |
