import type { MessageModel, MessageKind, ResourceModel } from '@tbdex/http-server'
import type { Generated, JSONColumnType } from 'kysely'

export interface DbOffering {
  id: Generated<number>;
  offeringid: string;
  payoutcurrency: string;
  payincurrency: string;
  offering: JSONColumnType<ResourceModel<'offering'>, string, string> | null;
}

export interface DbExchange {
  id: Generated<number>;
  exchangeid: string;
  messageid: string;
  subject: string;
  createdat: Generated<Date>;
  messagekind: 'close' | 'order' | 'orderstatus' | 'quote' | 'rfq';
  message: JSONColumnType<MessageModel<MessageKind>, string, string>;
}

export interface Database {
  exchange: DbExchange;
  offering: DbOffering;
}
