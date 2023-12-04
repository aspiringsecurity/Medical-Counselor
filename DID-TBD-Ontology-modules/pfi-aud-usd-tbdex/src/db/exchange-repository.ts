import type { Close, MessageKind, MessageKindClass, Order, OrderStatus, Quote, ExchangesApi, Rfq, GetExchangesFilter, MessageModel } from '@tbdex/http-server'
import { Message } from '@tbdex/http-server'

import { Postgres } from './postgres.js'

await Postgres.connect()
// await Postgres.ping()
await Postgres.clear()


class _ExchangeRepository implements ExchangesApi {
  getExchanges(opts: { filter: GetExchangesFilter }): Promise<MessageKindClass[][]> {
    // TODO: try out GROUP BY! would do it now, just unsure what the return structure looks like
    const promises: Promise<MessageKindClass[]>[] = []
    const exchangeIds = []

    if (opts.filter && Array.isArray(opts.filter.id)) {
      exchangeIds.push(...opts.filter.id)
    }

    if (exchangeIds.length == 0) {
      return this.getAllExchanges()
    }

    for (let id of exchangeIds) {
      console.log('calling id', id)
      // TODO: handle error property
      const promise = this.getExchange({ id }).catch(_e => [])
      promises.push(promise)
    }

    return Promise.all(promises)
  }

  async getAllExchanges(): Promise<MessageKindClass[][]> {

    const results = await Postgres.client.selectFrom('exchange')
      .select(['message', 'exchangeid'])
      .orderBy('createdat', 'asc')
      .execute()

    const exchanges = this.groupMessagesByExchangeId(results)

    return Object.values(exchanges)
  }

  async getExchange(opts: { id: string }): Promise<MessageKindClass[]> {
    console.log('getting exchange for id', opts.id)
    const results = await Postgres.client.selectFrom('exchange')
      .select(['message', 'exchangeid'])
      .where(eb => eb.and({
        exchangeid: opts.id,
      }))
      .orderBy('createdat', 'asc')
      .execute()

    const messages = this.groupMessagesByExchangeId(results)

    return Object.values(messages)[0]
  }

  private groupMessagesByExchangeId(results: { message: MessageModel<MessageKind>, exchangeid: string }[]): Record<string, MessageKindClass[]> {
    const exchangeIdToMessages = {}

    for (let result of results) {
      const message = Message.fromJson(result.message)

      if (!exchangeIdToMessages[result.exchangeid]) {
        exchangeIdToMessages[result.exchangeid] = []
      }

      exchangeIdToMessages[result.exchangeid].push(message)
    }

    return exchangeIdToMessages
  }

  async getRfq(opts: { exchangeId: string }): Promise<Rfq> {
    return await this.getMessage({ exchangeId: opts.exchangeId, messageKind: 'rfq' }) as Rfq
  }

  async getQuote(opts: { exchangeId: string }): Promise<Quote> {
    return await this.getMessage({ exchangeId: opts.exchangeId, messageKind: 'quote' }) as Quote
  }

  async getOrder(opts: { exchangeId: string }): Promise<Order> {
    return await this.getMessage({ exchangeId: opts.exchangeId, messageKind: 'order' }) as Order
  }

  async getOrderStatuses(opts: { exchangeId: string }): Promise<OrderStatus[]> {
    const results = await Postgres.client.selectFrom('exchange')
      .select(['message'])
      .where(eb => eb.and({
        exchangeid: opts.exchangeId,
        messagekind: 'orderstatus'
      }))
      .execute()

    const orderStatuses: OrderStatus[] = []

    for (let result of results) {
      const orderStatus = Message.fromJson(result.message) as OrderStatus
      orderStatuses.push(orderStatus)
    }

    return orderStatuses
  }

  async getClose(opts: { exchangeId: string }): Promise<Close> {
    return await this.getMessage({ exchangeId: opts.exchangeId, messageKind: 'order' }) as Close
  }

  async getMessage(opts: { exchangeId: string, messageKind: MessageKind }) {
    const result = await Postgres.client.selectFrom('exchange')
      .select(['message'])
      .where(eb => eb.and({
        exchangeid: opts.exchangeId,
        messagekind: opts.messageKind
      }))
      .limit(1)
      .executeTakeFirst()

    if (result) {
      return Message.fromJson(result.message)
    }
  }

  async addMessage(opts: { message: MessageKindClass }) {
    const { message } = opts
    const subject = aliceMessageKinds.has(message.kind) ? message.from : message.to

    const result = await Postgres.client.insertInto('exchange')
      .values({
        exchangeid: message.exchangeId,
        messagekind: message.kind,
        messageid: message.id,
        subject,
        message: JSON.stringify(message)
      })
      .execute()

    console.log(`Add ${message.kind} Message Result: ${JSON.stringify(result, null, 2)}`)
  }
}

const aliceMessageKinds = new Set(['rfq', 'order'])

export const ExchangeRespository = new _ExchangeRepository()