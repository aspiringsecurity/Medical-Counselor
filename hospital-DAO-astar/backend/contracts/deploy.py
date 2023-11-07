import os
import secrets

from substrateinterface.contracts import ContractCode, ContractInstance
from substrateinterface import SubstrateInterface, Keypair
from substrateinterface.exceptions import SubstrateRequestException

from scalecodec.types import *

# # Enable for debugging purposes
import logging
logging.basicConfig(level=logging.INFO)


substrate = SubstrateInterface(
    url="ws://127.0.0.1:9944",
    type_registry_preset='canvas'
)

kp_alice = Keypair.create_from_uri('//Alice')
kp_bob = Keypair.create_from_uri('//Bob')
kp_charlie = Keypair.create_from_uri('//Charlie')

#### Deploy Assignments for Projects & Functions

def deploy_contract(msg, contractname, kp, args, endowment = 0):
    #print("Args:", args)
    code = ContractCode.create_from_contract_files(
        metadata_file=os.path.join(os.path.dirname(__file__), 'project', 'target', 'ink',  contractname + '.json'),
        wasm_file=os.path.join(os.path.dirname(__file__), 'project', 'target', 'ink',  contractname + '.wasm'),
        substrate=substrate
    )

    contract = code.deploy(
        keypair=kp,
        endowment=endowment,
        gas_limit= 621923532800,
        storage_deposit_limit=1310720000000,
        constructor="new",
        args=args,
        upload_code=True,
        deployment_salt= '0x{}'.format(secrets.token_hex(8))  #for random string
    )

    print("✅ Deployed", contractname, "as", msg, ":", contract.contract_address, "CodeHash:", contract.metadata.source['hash']);

    return contract

def transfer_balance(kp_from, to, value):    
    call = substrate.compose_call(
        call_module='Balances',
        call_function='transfer',
        call_params={
            'dest': to,
            'value': value,
        }
    )

    extrinsic = substrate.create_signed_extrinsic(
        call=call,
        keypair=kp_from,
        era={'period': 64}
    )

    try:
        receipt = substrate.submit_extrinsic(extrinsic, wait_for_inclusion=True)

        if receipt.is_success:

            print('✅ Success, triggered events:')
            for event in receipt.triggered_events:
                print(f'* {event.value}')

        else:
            print('⚠️ Extrinsic Failed: ', receipt.error_message)


    except SubstrateRequestException as e:
        print("Failed to send: {}".format(e))    




# Alice deploys Assignments to obtain Hash

assignment = deploy_contract(msg='Assigment for Hash', 
                          contractname='assignment/assignment', 
                          kp=kp_alice, 
                          args={
                            'name': "NA",
                            'symbol': "NA",
                            'base_uri': "",
                            'max_supply': 0,
                            'collection_metadata': "" ,
                            'admin': kp_alice.ss58_address,
                            })

assignment_hash = assignment.metadata.source['hash']

# Alice deploys Employee to obtain Hash

employee = deploy_contract(msg='Employee for Hash', 
                           contractname='employee/employee', 
                           kp=kp_alice,     
                           args={
                            'name': "NA",
                            'symbol': "NA",
                            'base_uri': "",
                            'max_supply': 0,
                            'collection_metadata': "",
                            'admin': kp_alice.ss58_address,
                            },)

employee_hash = employee.metadata.source['hash']

# Alice deploys Project

project = deploy_contract(msg='Project',
                          contractname='project',
                          kp=kp_alice,
                          args={
                            'name': "Project",
                            'assignment_hash': str(assignment_hash),
                            'employee_hash': str(employee_hash),
                            },
                        endowment=0
                        )

transfer_balance(kp_alice, project.contract_address, 1 * 10**15)

employee_address = project.read(kp_alice, 'employee_address').contract_result_data[1]
print("Employee:", employee_address)

quit()

# assert(project.read(kp_alice, 'voting_delay').contract_result_data[1] == 0)

result = employee.read(kp_alice, 'PSP34::collection_id')
print('  🤩 Employee CollectionId:', result.contract_result_data[1][1])

def contract_call(msg, contract, keypair, fname, args):
    gas_predict = contract.read(keypair, fname, args)
    
    gas_predict.gas_required['ref_time'] *= 100;
    gas_predict.gas_required['proof_size'] *= 100;
    
    contract_receipt = contract.exec(keypair, fname, args)
    
    if contract_receipt.is_success:
        print(f'  😎 Call {msg} {fname} : Events {contract_receipt.contract_events}')
    else:
        print(f'🤕 Error {msg} {fname}: {contract_receipt.error_message}')
        print(f'  ** Events {contract_receipt.contract_events}')
        quit()
        
    return contract_receipt
    

### Call addPartList

contract_call(
    "Employee",
    employee, 
    kp_alice, 
    'Base::add_part_list', 
    args={
        'parts' : [  {
            'part_type': 'Slot',
            'z': 0,
            'equippable': [employee_project.contract_address],
            'part_uri': "",
            'is_equippable_by_all': False,
            },
        {
            'part_type': 'Slot',
            'z': 1,
            'equippable': [employee_function.contract_address],
            'part_uri': "",
            'is_equippable_by_all': False,
            },
        ]
        },
)

asset_id = 1
group_id = 1
token_id = { 'U64': 1 }

contract_call(
    "Employee add_asset_entry",
    employee,
    kp_alice,
    'MultiAsset::add_asset_entry',
    args={
        'id': asset_id,
        'equippable_group_id': group_id,
        'asset_uri': 'asset_uri/',
        'part_ids': [0]
    },
)

### Call Employee MintTo

contract_call(
    "Mint Employee for Alice",
    employee,
    kp_alice,
    'Minting::mint',
    args={
        'to': kp_alice.ss58_address,
    }
)

contract_call(
    "Employee add_asset_to_token",
    employee,
    kp_alice,
    'MultiAsset::add_asset_to_token',
    args={
        'token_id': token_id,
        'asset_id': asset_id,
        'replaces_asset_with_id': None
    },
)

### Call Employee MintTo

contract_call(
    "Employee for Bob",
    employee,
    kp_alice,
    'Minting::mint',
    args={
        'to': kp_bob.ss58_address,
    }
)

contract_call(
    "Employee for Charlie",
    employee,
    kp_alice,
    'Minting::mint',
    args={
        'to': kp_charlie.ss58_address,
    }
)

### Call Project Minto

contract_call(
    "Project for Bob",
    employee_project,
    kp_alice,
    'Minting::mint',
    args={
        'to': kp_bob.ss58_address,
    }
)

contract_call(
    "Project for Charlie",
    employee_project,
    kp_alice,
    'Minting::mint',
    args={
        'to': kp_charlie.ss58_address,
    }
)


## Approve parent


### Bob tries to equip project

contract_call(
    "Employee by Alice",
    employee,
    kp_alice,
    'Equippable::equip',
    args={
       'token_id': token_id,
       'asset_id': asset_id,
       'slot_part_id': 0,
       'child_nft' : ( employee_project.contract_address, { 'U64': 2 } ),
       'child_asset_id': 0,        
    }
)
