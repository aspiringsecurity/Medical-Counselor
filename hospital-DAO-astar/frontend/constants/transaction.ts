import type { QueueTxStatus } from 'types';

export const LENGTH_BOUND = 100000;

export const PROPOSAL_WEIGHT_BOUND = [100000000000, 0];
export const PROPOSAL_WEIGHT_BOUND_OLD = 1000000000;
export const PROPOSAL_WEIGHT_KEY = 'proposalWeightBound';
export const PROPOSAL_WEIGHT_TYPE = 'SpWeightsWeightV2Weight';

export const STATUS_COMPLETE: QueueTxStatus[] = [
  // status from subscription
  'finalitytimeout',
  'finalized',
  'inblock',
  'usurped',
  'dropped',
  'invalid',
  // normal completion
  'cancelled',
  'error',
  'sent'
];
