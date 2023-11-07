import os
import sys
import json
import random

from substrateinterface.contracts import ContractCode, ContractInstance
from substrateinterface import SubstrateInterface, Keypair
from substrateinterface.exceptions import SubstrateRequestException


# Config

members = ['alice', 'bob', 'charlie', 'dave', 'eve', 'ferdie']

titles = {  'project' : {
                'title' : 'Corolla 2025 UI Team',
            },
            'alice' : {
                'employee': 'Aiko', 
                'employee_function': 'Back-end developer',
                'employee_project': 'Back-end lead',
                'function_voting_power': 1100,
                'project_voting_power': 1050,

            },
            'bob' : { 
                'employee': 'Bob',
                'employee_function': 'Back-end developer',
                'employee_project': 'Back-end developer',
                'function_voting_power': 1100,
                'project_voting_power': 1050,
            },
            'charlie' : { 
                'employee': 'Carol',
                'employee_function': 'Front-end developer',
                'employee_project': 'Front-end lead',
                'function_voting_power': 1100,
                'project_voting_power': 1050,
            },
            'dave' : { 
                'employee': 'Dave',
                'employee_function': 'Project Manager',
                'employee_project': 'Project Manager',
                'function_voting_power': 1100,
                'project_voting_power': 1050,
            },
            'eve' : { 
                'employee': 'Eve',
                'employee_function': 'Graphical Designer',
                'employee_project': 'Graphical design lead',
                'function_voting_power': 1100,
                'project_voting_power': 1050,
            },
            'ferdie' : { 
                'employee': 'Ferdie',
                'employee_function': 'External Consultant',
                'employee_project': 'Graphical design consultant',
                'function_voting_power': 1100,
                'project_voting_power': 1050,
            },
        }


verbose = 0

########## Generic Functions

def contract_from_address(contract_address, contract_name):
    contract = ContractInstance.create_from_address(
        contract_address=contract_address,
        metadata_file=os.path.join(os.path.dirname(__file__), 'project', 'target', 'ink', contract_name + '.json'),
        substrate=substrate
    )

    print("✅ Loaded", contract_name, "from", contract_address, " CodeHash:", contract.metadata.source['hash']);

    return contract


def show_events(events):
    first = True
    
    
    result = ""
    for event in events:
        if first:
            first = False
        else:
            result += "\n"
        result = "{" + event['name'] + " : "

        for arg in event['args']:
            result += arg['label'] + ':' + str(arg['value']) + " "
            
        result += "}  "
        
    return result

def contract_call(msg, keypair, contract, fname,  args):
    gas_predict = contract.read(keypair, fname, args)
    
    gas_predict.gas_required['ref_time'] *= 100;
    gas_predict.gas_required['proof_size'] *= 100;
    
    contract_receipt = contract.exec(keypair, fname, args)
    
    if contract_receipt.is_success:
        print(f'  😎 Call {msg} {fname}', end='')
        if contract_receipt.contract_events:
            print(f': Events { show_events(contract_receipt.contract_events) }', end='')
        print()
    else:
        print(f'  🤕 Error {msg} {fname}: {contract_receipt.error_message}')
        print("      Args: ", args)

        
    
def contract_mint_to(msg, keypair, contract, dest: str) -> int:
    fname = 'Minting::mint'

    gas_predict = contract.read(keypair, fname, args={ 'to': dest })
    
    gas_predict.gas_required['ref_time'] *= 100;
    gas_predict.gas_required['proof_size'] *= 100;
    
    contract_receipt = contract.exec(keypair, fname, args={ 'to': dest })

    if contract_receipt.is_success:
        print(f'  😎 Call {msg} {fname} : Events { show_events(contract_receipt.contract_events)}')
    else:
        print(f'  🤕 Error {msg} {fname}: {contract_receipt.error_message}')
        quit()

    return contract_receipt.contract_events[0]['args'][2]['value']['U64']


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

            print('✅ Successful transfer from',kp_from, 'to', to, 'for', value)
            if verbose > 0:
                print("Transfer Events:", receipt.triggered_events)
        else:
            print('⚠️ Extrinsic Failed: ', receipt.error_message)


    except SubstrateRequestException as e:
        print("Failed to send: {}".format(e))    

########## Cmdline & setup


if len(sys.argv) != 3:
    print("Usage: ", sys.argv[0], " [project-address] [outfile.json]")
    sys.exit(1)
    
project_address = sys.argv[1]
outfile_json = sys.argv[2]

substrate = SubstrateInterface(
    url="ws://127.0.0.1:9944",
    type_registry_preset='canvas'
)

kp = {}

kp['alice']   = Keypair.create_from_uri('//Alice')
kp['bob']     = Keypair.create_from_uri('//Bob')
kp['charlie'] = Keypair.create_from_uri('//Charlie')
kp['dave']    = Keypair.create_from_uri('//Dave')
kp['eve']     = Keypair.create_from_uri('//Eve')
kp['ferdie']  = Keypair.create_from_uri('//Ferdie')

print("Alice signs: ", kp['alice'])

transfer_balance(kp['alice'], project_address, 10**17)


## Project from cmd line arg

project = contract_from_address(project_address, 'project')

employee_address = project.read(kp['alice'], 'employee_address').contract_result_data[1]
if verbose > 0:
    print("Employee:", employee_address)

function_address =  project.read(kp['alice'], 'function_address').contract_result_data[1]
if verbose > 0:
    print("Function:", function_address)


## Employee from project call, and send it some funds from Alice

employee = contract_from_address(str(employee_address), "employee/employee")

total_supply = employee.read(kp['alice'], 'Minting::max_supply').contract_result_data[1]
assert(total_supply == 10000)

transfer_balance(kp['alice'], str(employee_address), 10**17)

## Function from project call, and send it some funds from Alice


employee_function = contract_from_address(str(function_address), 'assignment/assignment')
total_supply = employee_function.read(kp['alice'], 'Minting::max_supply').contract_result_data[1]
assert(total_supply == 10000)

transfer_balance(kp['alice'], str(function_address), 10**17)

## Employee_project from create project, and send it some funds from Alice
project_id = random.randint(0, 2**32 -1)
project_part_id = project_id


contract_call("Create Project", kp['alice'], project, 'create_project', args = {
    'project_title': "My New project!",
    'project_id': project_id,
    })

eproject_address = project.read(kp['alice'], 'project_collection', args = {'project_id': project_id,}).contract_result_data[1][1]
if verbose > 0:
    print("eproject address:", eproject_address)

employee_project = contract_from_address(str(eproject_address), 'assignment/assignment')
total_supply = employee_project.read(kp['alice'], 'Minting::max_supply').contract_result_data[1]
assert(total_supply == 10000)

transfer_balance(kp['alice'], str(eproject_address), 10**17)


## Setting up employees

ids = {}

for member in members:
    ids[member] = {}
    
    # Mint employee and set name
    ids[member]['employee'] = contract_mint_to('Mint Employee for ' + member, kp['alice'], employee, kp[member].ss58_address) 
    contract_call("Employee metadata " + member, kp['alice'], employee, "Minting::assign_metadata", args = { 'token_id': { 'U64' : ids[member]['employee']}, 'metadata': titles[member]['employee']})
    
    ids[member]['employee_function'] = contract_mint_to('Mint Employee-Function for ' + member, kp['alice'], employee_function, kp[member].ss58_address) 
    contract_call("Employee_function metadata " + member,     kp['alice'], employee_function, "Minting::assign_metadata", args = { 'token_id': { 'U64' : ids[member]['employee_function']}, 'metadata': titles[member]['employee_function']}) 
    contract_call("Employee_function voting_power " + member, kp['alice'], employee_function, "set_token_voting_power",   args = { 'token_id': { 'U64' : ids[member]['employee_function']}, 'voting_factor': titles[member]['function_voting_power'] }) 
    
    ids[member]['employee_project'] = contract_mint_to('Mint Employee-Project for ' + member, kp['alice'], employee_project, kp[member].ss58_address) 
    contract_call("Employee_project metadata " + member, kp['alice'], project, "set_caller_project_title", args = { 'project_id': project_id, 'project_token_id': { 'U64' : ids[member]['employee_project']}, 'title': titles[member]['employee_project']})
    contract_call("Employee_project voting_power " + member, kp['alice'], project, "set_caller_project_voting_power", args = { 'project_id': project_id, 'project_token_id': { 'U64' : ids[member]['employee_project']}, 'voting_factor': titles[member]['project_voting_power'] })


ids['contract'] = {}
ids['contract']['project'] = project_address
ids['contract']['employee'] = str(employee_address)
ids['contract']['employee_function'] = str(function_address)
ids['contract']['employee_project'] = str(eproject_address)

print("♐ IDs:", ids)

with open(outfile_json, "w") as outfile:
    json.dump(ids, outfile)


# Alice adds the part slots to employee

contract_call(
    "Employee",
    kp['alice'], 
    employee, 
    'Base::add_part_list', 
    args={
        'parts' : [  {
            'part_type': 'Slot',
            'z': 0,
            'equippable': [employee_function.contract_address],
            'part_uri': "",
            'is_equippable_by_all': False,
            },
        {
            'part_type': 'Slot',
            'z': 1,
            'equippable': [employee_project.contract_address],
            'part_uri': "",
            'is_equippable_by_all': False,
            },
        ]
        },
)

function_asset_id =  random.randint(0, 2**32 -1)
project_asset_id =  project_id
group_id = 1


# Alice creates assets and equippable_address on project_function

contract_call(
    "Employee add_asset_entry on employee",
    kp['alice'],
    employee,
    'MultiAsset::add_asset_entry',
    args={
        'id': function_asset_id,
        'equippable_group_id': group_id,
        'asset_uri': 'asset_uri/',
        'part_ids': [0]
    },
)


contract_call(
    'add_equippable address on employee for employee_funcion',
    kp['alice'],
    employee,
    'Base::add_equippable_addresses',
    args={ 
        'part_id': 0,
        'equippable_address' : [ employee_function.contract_address ],
    
    }
)

# Alice creates assets and equippable_address on project_employee

contract_call(
     "Employee add_asset_entry on employee",
     kp['alice'],
     employee,
     'MultiAsset::add_asset_entry',
     args={
         'id': project_asset_id,
         'equippable_group_id': group_id,
         'asset_uri': 'asset_uri/',
         'part_ids': [project_part_id]
     },
)


# contract_call(
#     'add_equippable address on employee for employee_project', 
#     kp['alice'],
#     employee,
#     'Base::add_equippable_addresses',
#     args={ 
#         'part_id': project_part_id,
#         'equippable_address' : [ employee_project.contract_address ],
    
#     }
# )

for member in members:
    # Member tries to equip with function
    contract_call(
        "Employee " + member + " add_asset_to_token",
        kp['alice'],
        employee,
        'MultiAsset::add_asset_to_token',
        args={
            'token_id': { 'U64' : ids[member]['employee'] }, 
            'asset_id': function_asset_id,
            'replaces_asset_with_id': None
        },
    )

    contract_call(
        "Equip function for "+member,
        kp[member],
        employee,
        'Equippable::equip',
        args={
        'token_id':  { 'U64' : ids[member]['employee'] },
        'asset_id': function_asset_id,
        'slot_part_id': 0,
        'child_nft' : ( employee_function.contract_address, { 'U64': ids[member]['employee_function'] } ),
        'child_asset_id': 0,        
        }
    )

    # Member tries to equip with project
    contract_call(
        "Employee " + member + " add_asset_to_token",
        kp[member],
        employee,
        'MultiAsset::add_asset_to_token',
        args={
            'token_id': { 'U64' : ids[member]['employee'] }, 
            'asset_id': project_asset_id,
            'replaces_asset_with_id': None
        },
    )

    contract_call(
        "Equip project for "+member,
        kp[member],
        employee,
        'Equippable::equip',
        args={
        'token_id':  { 'U64' : ids[member]['employee'] },
        'asset_id': project_asset_id,
        'slot_part_id': project_part_id,
        'child_nft' : ( employee_project.contract_address, { 'U64': ids[member]['employee_project'] } ),
        'child_asset_id': 0,        
        }
    )


# Alice creates proposal

contract_call(
    "Alice creates proposal",
    kp['alice'],
    project,
    'create_proposal',
    args = {
        'project_id' : project_id,
        'proposal_id': 1,
        'project_token_id': { 'U64' : ids['alice']['employee_project']},
        'internal': False,
    }
)

state = project.read(kp['alice'], 'proposal_details', args = { 'project_id': project_id, 'proposal_id': 1}).contract_result_data[1]


# Alice votes

contract_call(
    "Alice votes FOR",
    kp['alice'],
    project,
    'vote',
    args = {
        'vote_type': "For" ,
        'project_id': project_id,
        'proposal_id': 1,
        'project_token_id': { 'U64': ids['alice']['employee_project'] },
        'function_token_id': { 'U64': ids['alice']['employee_function'] },
    }
)






