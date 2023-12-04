import type { PoolConfig } from 'pg'

import type { LogLevelDesc } from 'loglevel'
import fs from 'node:fs'

import 'dotenv/config'

import { DidIonMethod } from '@web5/dids'
import { PrivateKeyJwk } from '@web5/crypto'

export type Environment = 'local' | 'staging' | 'production'

export type Config = {
  env: Environment
  logLevel: LogLevelDesc
  host: string;
  port: number;
  db: PoolConfig
  did: {
    id: string
    privateKey: PrivateKeyJwk
    kid: string
  }
  allowlist: string[],
  pinPaymentsKey: string,
}

export const config: Config = {
  env      : (process.env['ENV'] as Environment) || 'local',
  logLevel : (process.env['LOG_LEVEL'] as LogLevelDesc) || 'info',
  host     : process.env['HOST'] || 'http://localhost:9000',
  port     : parseInt(process.env['PORT'] || '9000'),
  db: {
    host     : process.env['SEC_DB_HOST'] || 'localhost',
    port     : parseInt(process.env['SEC_DB_PORT'] || '5432'),
    user     : process.env['SEC_DB_USER'] || 'postgres',
    password : process.env['SEC_DB_PASSWORD'] || 'tbd',
    database : process.env['SEC_DB_NAME'] || 'mockpfi'
  },
  did: {
    id   : process.env['SEC_DID'],
    privateKey : JSON.parse(process.env['SEC_DID_PRIVATE_KEY'] || null),
    kid   : process.env['SEC_DID_KID']
  },
  pinPaymentsKey: process.env['SEC_PIN_PAYMENTS_SECRET_KEY'],
  allowlist: JSON.parse(process.env['SEC_ALLOWLISTED_DIDS'] || '[]')
}

// create ephemeral PFI did if one wasn't provided. Note: this DID and associated keys aren't persisted!
// a new one will be generated every time the process starts.
if (!config.did.id) {
  console.log('Creating an ephemeral DID.....')
  const DidIon = await DidIonMethod.create({
    services: [{ id: 'pfi', type: 'PFI', serviceEndpoint: config.host }]
  })


  config.did.id = DidIon.did
  fs.writeFileSync('server-did.txt', config.did.id)
  config.did.privateKey = DidIon.keySet.verificationMethodKeys[0].privateKeyJwk
  config.did.kid = `${config.did.id}#${config.did.privateKey.kid}`
}