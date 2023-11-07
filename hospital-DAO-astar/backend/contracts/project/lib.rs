#![cfg_attr(not(feature = "std"), no_std)]
#![feature(min_specialization)]


#[openbrush::contract]
pub mod project {
    use ink::storage::Mapping;
    use ink::EnvAccess;
    use ink::env::DefaultEnvironment;
    use ink::codegen::EmitEvent;

    use ink::prelude::vec::Vec;

    use ink::env::hash::{Sha2x256, HashOutput};

    use employee::rmrk_employee::RmrkEmployeeRef;
    use assignment::rmrk_assignment::RmrkAssignmentRef;

    use openbrush::contracts::psp34::Id;
    use openbrush::{
        traits::{
            Storage,
            String,
        },
    };



    #[derive(Debug, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum ProjectError {
        Custom(String),
    }

    #[derive(scale::Encode, scale::Decode, Debug, PartialEq, Eq, Copy, Clone)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum VoteType {
        Against,
        For,
        Abstain
    }

    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum ProposalState {
        Pending,
        Active,
        Canceled,
        Defeated,
        Succeeded,
    }

    type ProposalId = u32;
    type ProjectId = u32;


    /// Event emmited at project creation
    #[ink(event)]
    pub struct ProjectCreated {
        #[ink(topic)]
        creator: AccountId,
        #[ink(topic)]
        project_id: ProjectId,
        #[ink(topic)]
        employee_project: AccountId,
    }

    /// Event emmited at proposal creation
    #[ink(event)]
    pub struct ProposalCreated {
        #[ink(topic)]
        creator: AccountId,
        #[ink(topic)]
        project_id: ProjectId,
        #[ink(topic)]
        proposal_id: ProposalId,
        vote_start: BlockNumber,
        vote_end: BlockNumber,
    }

    #[ink(event)]
    pub struct VoteCast {
        #[ink(topic)]
        user: AccountId,
        #[ink(topic)]
        project_id: ProjectId,
        #[ink(topic)]
        proposal_id: ProposalId,
        vote: VoteType,
    }


    #[derive(scale::Decode, scale::Encode)]
    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    pub struct ProposalCore {
        pub vote_start: BlockNumber,
        pub vote_end:   BlockNumber,
        pub canceled: bool,
        pub internal: bool,
    }

    #[derive(scale::Decode, scale::Encode)]
    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    pub struct ProposalVote {
        pub votes_against: u32,
        pub votes_for:     u32,
        pub votes_abstain: u32,
        pub has_voted: Vec<AccountId>,
    }

    #[ink(storage)]
    #[derive(Default, Storage)]
    pub struct Project {
        name: String,
        voting_delay: BlockNumber,
        voting_period: BlockNumber,
        employee: Option<RmrkEmployeeRef>,
        employee_function: Option<RmrkAssignmentRef>,
        employee_project: Mapping<ProjectId, RmrkAssignmentRef>,
        projects: Vec<ProjectId>,
        proposals: Mapping<(ProjectId, ProposalId), ProposalCore>,
        proposal_ids: Mapping<ProjectId, Vec<ProposalId>>,
        votes: Mapping<(ProjectId, ProposalId), ProposalVote>,
        assignment_hash: Hash,
    }

    impl Project {

        #[ink(constructor)]
        pub fn new(
            name: String,
            assignment_hash: Hash,
            employee_hash: Hash,
        ) -> Self {
            let proposals = Mapping::default();
            let proposal_ids = Mapping::default();
            let employee_project = Mapping::default();
            let votes = Mapping::default();
            let projects = Vec::default();

            let salt = Self::env().block_number().to_le_bytes();
            let employee = RmrkEmployeeRef::new(
                String::from("Employee"),
                String::from("EMP"),
                String::from("http://hello.world/"),
                10000,
                String::from("ipfs://over.there/"),
                Self::env().caller(),
            )
            .endowment(0)
            .code_hash(employee_hash)
            .salt_bytes(salt)
            .instantiate();

            let function = RmrkAssignmentRef::new(
                String::from("Function"),
                String::from("FNC"),
                String::from("http://hello.world"),
                10000,
                String::from("ipfs://over.there"),
                Self::env().caller(),
            )
            .endowment(0)
            .code_hash(assignment_hash)
            .salt_bytes(salt)
            .instantiate();


            Self { 
                name, 
                voting_delay: 0, 
                voting_period: 10,
                employee: Some(employee),
                employee_function: Some(function),
                employee_project,
                projects,
                proposals, 
                proposal_ids, 
                votes,
                assignment_hash,
             }
        }


        /// Return the AccountId of the instantiated Employee contract
        #[ink(message)]
        pub fn employee_address(&self) -> AccountId {
            self.employee.clone().unwrap().account_id()
        }

        /// Return the AccountId of the instantiated Function (from assignment) contract
        #[ink(message)]
        pub fn function_address(&self) -> AccountId {
            self.employee_function.clone().unwrap().account_id()
        }

        #[ink(message)]
        pub fn create_project(&mut self, project_title: String, project_id: ProjectId) -> Result<(), ProjectError> {
            // todo: check role

            match self.employee_project.get(project_id) {
                Some(_) => return Err(ProjectError::Custom(String::from("Project already exists"))),
                None => (),
            };

            self.projects.push(project_id);

            let proposal_ids : Vec<ProposalId> = Vec::new();
            self.proposal_ids.insert(project_id, &proposal_ids);

            let project_code = String::from("P");
            //todo: concat project_id

            let salt = Self::env().block_number().to_le_bytes();
            let employee_project = RmrkAssignmentRef::new(
                project_title,
                project_code,
                String::from("http://hello.world"),
                10000,
                String::from("ipfs://over.there"),
                Self::env().caller(),
            )
            .endowment(0)
            .code_hash(self.assignment_hash)
            .salt_bytes(salt)
            .instantiate();
            
            self.employee_project.insert(project_id, &employee_project);

            <EnvAccess<'_, DefaultEnvironment> as EmitEvent<Project>>::emit_event::<ProjectCreated>(self.env(), 
                ProjectCreated {
                    creator: Self::env().caller(),
                    project_id,
                    employee_project: employee_project.account_id(),
                });

            Ok(())
        }


        #[ink(message)]
        pub fn project_collection(&self, project_id: ProjectId) -> Result<AccountId, ProjectError> {
            let employee_project = match self.employee_project.get(project_id) {
                Some(ep) => ep,
                None => return Err(ProjectError::Custom(String::from("Project does not exist"))),
            };
            
            Ok(employee_project.account_id())
        }
    

        #[ink(message)]
        pub fn gen_title_id(&self, title: String) -> Result<u32, ProjectError> {
            let mut output = <Sha2x256 as HashOutput>::Type::default(); // 256-bit buffer
            ink::env::hash_bytes::<Sha2x256>(&title, &mut output);
            Ok(u32::from_ne_bytes([output[0], output[1], output[2], output[3]]))
        }

        /// Create new proposal for give ProjectID (can only be called by 
        /// project token holder)
        #[ink(message)]
        pub fn create_proposal(&mut self, project_id: ProjectId, proposal_id: ProposalId, project_token_id: Id, internal: bool) -> Result<(), ProjectError> {
            let assignment_ref = self.employee_project.get(project_id).unwrap();

            if !assignment_ref.ensure_exists_and_owner_of(self.env().caller(), project_token_id).is_ok() {
                ink::env::debug_println!("Caller not part of project");
                return Err(ProjectError::Custom(String::from("Caller not part of project")));
            }

            if self.proposals.get(&(project_id, proposal_id)).is_some() {
                return Err(ProjectError::Custom(String::from("Proposal already exists")));
            }

            let proposal = ProposalCore {
                vote_start: self.env().block_number() + self.voting_delay,
                vote_end:   self.env().block_number() + self.voting_delay + self.voting_period,
                canceled: false,
                internal,
            };

            self.proposals.insert((project_id, proposal_id), &proposal);

            // update self.proposal_ids
            let mut proposals = self.proposal_ids.get(project_id).unwrap();
            proposals.push(proposal_id);
            self.proposal_ids.insert(project_id, &proposals);

            // // insert self.vote
            let vote_status = ProposalVote { votes_against: 0, votes_for: 0, votes_abstain: 0, has_voted: Vec::new(), };
            self.votes.insert((project_id, proposal_id), &vote_status);

            <EnvAccess<'_, DefaultEnvironment> as EmitEvent<Project>>::emit_event::<ProposalCreated>(self.env(), 
            ProposalCreated {
                creator: self.env().caller(),
                project_id: project_id,
                proposal_id: proposal_id,
                vote_start: proposal.vote_start,
                vote_end: proposal.vote_end,
            });

            Ok(())
        }

        #[ink(message)]
        pub fn set_caller_project_voting_power(&mut self, project_id: ProjectId, project_token_id: Id, voting_factor: u128) -> Result<(), ProjectError> {
            let mut assignment_ref = self.employee_project.get(project_id).unwrap();

            assignment_ref.set_token_voting_power(project_token_id, voting_factor).or_else(|_|
                Err(ProjectError::Custom("Failed to set voting power".into()))
            )?;

            self.employee_project.insert(project_id, &assignment_ref);
            Ok(())
        }

        #[ink(message)]
        pub fn set_caller_project_title(&mut self, project_id: ProjectId, project_token_id: Id, title: String) -> Result<(), ProjectError> {
            let mut assignment_ref = self.employee_project.get(project_id).unwrap();

            assignment_ref.set_token_title(project_token_id, title).or_else(|_|
                Err(ProjectError::Custom("Failed to set title".into()))
            )?;

            self.employee_project.insert(project_id, &assignment_ref);
            Ok(())
        }

        /// List all active projects
        #[ink(message)]
        pub fn list_project_ids(&self) -> Result<Vec<ProjectId>,ProjectError> {
            Ok(self.projects.clone())
        }

        /// List all open proposals for given project 
        #[ink(message)]
        pub fn list_proposal_ids(&self, project_id: ProjectId, ) -> Result<Vec<ProposalId>, ProjectError> {
            match self.proposal_ids.get(&project_id) {
                Some(pis) => Ok(pis),
                None => Err(ProjectError::Custom(String::from("Project does not exist")))
            }
        
        }

        #[ink(message)]
        pub fn proposal_details(&self, project_id: ProjectId, proposal_id: ProposalId) -> Result<ProposalCore, ProjectError> {
            match self.proposals.get((project_id, proposal_id)) {
                Some(pc) => Ok(pc),
                None => Err(ProjectError::Custom(String::from("Project / Proposal does not exist")))
            }
        }

        /// vote for given proposal Id
        #[ink(message)]
        pub fn vote(&mut self, vote_type: VoteType, project_id: ProjectId, proposal_id: ProposalId, project_token_id: Id, function_token_id: Id) -> Result<(), ProjectError> {
            let caller = self.env().caller();

            if !self.proposals.contains((project_id, proposal_id)) {
                ink::env::debug_println!("Project / Proposal does not exist");
                return Err(ProjectError::Custom(String::from("Project / Proposal does not exist")));
            }

            let proposal = self.proposals.get((project_id, proposal_id)).unwrap();
            let assignment_ref = self.employee_project.get(project_id).unwrap();

            if proposal.internal {
                if !assignment_ref.ensure_exists_and_owner_of(caller, project_token_id.clone()).is_ok() {
                    ink::env::debug_println!("Invalid project_token_id");
                    return Err(ProjectError::Custom(String::from("Invalid project_token_id")));
                }
            }

            if !self.employee_function.clone().unwrap().ensure_exists_and_owner_of(caller, function_token_id.clone()).is_ok() {
                ink::env::debug_println!("Invalid function_token_id");
                return Err(ProjectError::Custom(String::from("Invalid function_token_id")));
            }

            if self.proposal_state(project_id, proposal_id)? != ProposalState::Active {
                ink::env::debug_println!("Project / Proposal not open for voting");
                return Err(ProjectError::Custom(String::from("Project / Proposal not open for voting")));
            }

            let mut vote_status = self.votes.get((project_id, proposal_id)).unwrap_or(
                ProposalVote {
                    votes_against: 0,
                    votes_for:     0,
                    votes_abstain: 0,
                    has_voted: Vec::new()
                }
            );

            if vote_status.has_voted.contains(&caller) {
                ink::env::debug_println!("Caller has already voted");
                return Err(ProjectError::Custom(String::from("Caller has already voted")));
            }

            let function_voting_power: u32 = self.employee_function.clone().unwrap().token_voting_power(function_token_id).unwrap().try_into().unwrap_or(0);
            let project_voting_power: u32 = assignment_ref.token_voting_power(project_token_id).unwrap_or(0).try_into().unwrap_or(0);
            let voting_power: u32 = function_voting_power.saturating_add(project_voting_power);

            ink::env::debug_println!("retrieved voting power");
            match vote_type {
                VoteType::Against => vote_status.votes_against += voting_power,
                VoteType::For     => vote_status.votes_for     += voting_power,
                VoteType::Abstain => vote_status.votes_abstain += voting_power,
            };

            vote_status.has_voted.push(caller);
            self.votes.insert((project_id, proposal_id), &vote_status);

            <EnvAccess<'_, DefaultEnvironment> as EmitEvent<Project>>::emit_event::<VoteCast>(self.env(), 
                VoteCast {
                    user: caller,
                    project_id: project_id,
                    proposal_id: proposal_id,
                    vote: vote_type,
                });

            Ok(())
        }

        /// Has the user voted
        #[ink(message)]
        pub fn has_voted(&self, project_id: ProjectId, proposal_id: ProposalId, user: AccountId) -> Result<bool, ProjectError> {
            if !self.proposals.contains((project_id, proposal_id)) {
                return Err(ProjectError::Custom(String::from("Project / Proposal does not exist")));
            }

            let vote_status = self.votes.get((project_id, proposal_id)).unwrap();

            if vote_status.has_voted.contains(&user) {
                return Ok(true);
            } else {
                return Ok(false);
            }
        }

        /// Cancel the current proposal
        #[ink(message)]
        pub fn cancel_proposal(&mut self, project_id: ProjectId, proposal_id: ProposalId) -> Result<(), ProjectError> {
            if !self.proposals.contains((project_id, proposal_id)) {
                return Err(ProjectError::Custom(String::from("Project / Proposal does not exist")));
            }

            let mut proposal = self.proposals.get((project_id, proposal_id)).unwrap();
            proposal.canceled = true;

            self.proposals.insert((project_id, proposal_id),&proposal);

            Ok(())
        }


        /// Current state of proposal
        #[ink(message)]
        pub fn proposal_state(&self, project_id: ProjectId, proposal_id: ProposalId) -> Result<ProposalState, ProjectError> {
            assert!(self.proposals.contains((project_id, proposal_id)), "Project / Proposal does noet exist");
            let proposal = self.proposals.get((project_id, proposal_id)).unwrap();

            if proposal.canceled {
                return Ok(ProposalState::Canceled);
            }

            if proposal.vote_start > self.env().block_number() {
                return Ok(ProposalState::Pending);
            }

            if proposal.vote_end > self.env().block_number() {
                return Ok(ProposalState::Active);
            }

            if self.votes.contains((project_id, proposal_id)) {
                let vote = self.votes.get((project_id, proposal_id)).unwrap_or(
                    ProposalVote {
                        votes_against: 0,
                        votes_for:     0,
                        votes_abstain: 0,
                        has_voted: Vec::new()
                    }
                );
                if vote.votes_for > vote.votes_against {
                    return Ok(ProposalState::Succeeded);
                }
            }

            return Ok(ProposalState::Defeated);
        }

        /// Current votes for proposal
        #[ink(message)]
        pub fn proposal_votes(&self, project_id: ProjectId, proposal_id: ProposalId) -> Result<ProposalVote, ProjectError> {
            assert!(self.votes.contains((project_id, proposal_id)), "Project / Proposal does noet exist");
        
            Ok(self.votes.get((project_id, proposal_id)).unwrap())
        }


        #[ink(message)]
        pub fn voting_delay(&self) -> BlockNumber {
            self.voting_delay
        }

        #[ink(message)]
        pub fn voting_period(&self) -> BlockNumber {
            self.voting_period
        }

        #[ink(message)]
        pub fn set_voting_delay(&mut self, voting_delay: BlockNumber) -> Result<(),ProjectError> {
            self.voting_delay = voting_delay;
            Ok(())
        }

        #[ink(message)]
        pub fn set_voting_period(&mut self, voting_period: BlockNumber) -> Result<(),ProjectError> {
            self.voting_period = voting_period;
            Ok(())
        }
    }
}
