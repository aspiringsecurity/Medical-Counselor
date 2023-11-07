#![cfg_attr(not(feature = "std"), no_std)]
#![feature(min_specialization)]

pub use self::rmrk_assignment::{
        RmrkAssignment,
        RmrkAssignmentRef,
};


#[openbrush::contract]
pub mod rmrk_assignment { // from rmrk_example_mintable
    use ink::codegen::{
        EmitEvent,
        Env,
    };
    use ink::storage::Mapping;
    use openbrush::{
        contracts::{
            access_control::*,
            psp34::extensions::{
                enumerable::*,
                metadata::*,
            },
            reentrancy_guard::*,
        },
        traits::{
            Storage,
            String,
        },
    };

    use rmrk::{
        config,
        query::*,
        storage::*,
        traits::*,
        utils::*,
    };

    #[derive(Debug, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum AssignmentError {
        Custom(String),
    }

    /// Event emitted when a token transfer occurs.
    #[ink(event)]
    pub struct Transfer {
        #[ink(topic)]
        from: Option<AccountId>,
        #[ink(topic)]
        to: Option<AccountId>,
        #[ink(topic)]
        id: Id,
    }

    /// Event emitted when a token approve occurs.
    #[ink(event)]
    pub struct Approval {
        #[ink(topic)]
        from: AccountId,
        #[ink(topic)]
        to: AccountId,
        #[ink(topic)]
        id: Option<Id>,
        approved: bool,
    }

    // RmrkAssignment contract storage
    #[ink(storage)]
    #[derive(Default, Storage)]
    pub struct RmrkAssignment {
        #[storage_field]
        psp34: psp34::Data<enumerable::Balances>,
        #[storage_field]
        guard: reentrancy_guard::Data,
        #[storage_field]
        access: access_control::Data,
        #[storage_field]
        metadata: metadata::Data,
        #[storage_field]
        minting: MintingData,
        voting_power: Mapping<Id, u128>,
    }

    impl PSP34 for RmrkAssignment {}

    impl AccessControl for RmrkAssignment {}

    impl PSP34Metadata for RmrkAssignment {}

    impl PSP34Enumerable for RmrkAssignment {}

    impl Minting for RmrkAssignment {}

    impl Query for RmrkAssignment {}

    impl RmrkAssignment {
        /// Instantiate new RMRK contract
        #[allow(clippy::too_many_arguments)]
        #[ink(constructor)]
        pub fn new(
            name: String,
            symbol: String,
            base_uri: String,
            max_supply: u64,
            collection_metadata: String,
            admin: AccountId,
        ) -> Self {
            let mut instance = RmrkAssignment::default();
            config::with_admin(&mut instance, admin);
            config::with_contributor(&mut instance, Self::env().caller());
            config::with_collection(
                &mut instance,
                name,
                symbol,
                base_uri,
                collection_metadata,
                max_supply,
            );
            instance.voting_power = Mapping::default();
            instance
        }

        #[ink(message)]
        pub fn set_token_voting_power(&mut self, token_id: Id, voting_factor: u128) -> Result<(), AssignmentError> {
            if !self.ensure_exists_and_get_owner(&token_id).is_ok() {
                return Err(AssignmentError::Custom("Invalid token id".into()));
            }
            self.voting_power.insert(&token_id, &voting_factor);
            Ok(())
        }

        #[ink(message)]
        pub fn set_token_title(&mut self, token_id: Id, title: String) -> Result<(), AssignmentError> {
            if !self.ensure_exists_and_get_owner(&token_id.clone()).is_ok() {
                return Err(AssignmentError::Custom("Invalid token id".into()));
            }

            self.assign_metadata(token_id.clone(), title).or_else(|_|
                Err(AssignmentError::Custom("Failed to assign metadata".into()))
            )?;

            Ok(())
        }

        #[ink(message)]
        pub fn account_id(&self) -> AccountId {
            self.env().account_id()
        }

        #[ink(message)]
        pub fn token_voting_power(&self, token_id: Id) -> Result<u128, AssignmentError> {
            if !self.ensure_exists_and_get_owner(&token_id).is_ok() {
                return Err(AssignmentError::Custom("Invalid token id".into()));
            }
            let token_voting_power = self.voting_power.get(token_id).unwrap();
            Ok(token_voting_power)
        }

        #[ink(message)]
        pub fn add_project_function(&mut self, account_id: AccountId, title: String, voting_factor: u128) -> Result<Id, AssignmentError> {
            let token_id = Minting::mint(self, account_id).or_else(|_|
                Err(AssignmentError::Custom("Failed to mint".into()))
            )?;
            self.assign_metadata(token_id.clone(), title).or_else(|_|
                Err(AssignmentError::Custom("Failed to assign metadata".into()))
            )?;
            self.set_token_voting_power(token_id.clone(), voting_factor).or_else(|_|
                Err(AssignmentError::Custom("Failed to assign voting factor".into()))
            )?;
            Ok(token_id)
        }

        #[ink(message)]
        pub fn ensure_exists_and_owner_of(&self, account_id: AccountId, token_id: Id) -> Result<(), AssignmentError> {
            let owner = self.ensure_exists_and_get_owner(&token_id).or_else(|_|
                Err(AssignmentError::Custom("Token does not exist".into()))
            )?;
            if owner != account_id {
                return Err(AssignmentError::Custom("Specified account is not the owner of token".into()));
            }
            Ok(())
        }
    }

    impl psp34::Internal for RmrkAssignment {
        /// Emit Transfer event
        fn _emit_transfer_event(&self, from: Option<AccountId>, to: Option<AccountId>, id: Id) {
            self.env().emit_event(Transfer { from, to, id });
        }

        /// Emit Approval event
        fn _emit_approval_event(
            &self,
            from: AccountId,
            to: AccountId,
            id: Option<Id>,
            approved: bool,
        ) {
            self.env().emit_event(Approval {
                from,
                to,
                id,
                approved,
            });
        }
    }
}
