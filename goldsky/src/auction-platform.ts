import {
  AuctionCompleted as AuctionCompletedEvent,
  AuctionCreated as AuctionCreatedEvent,
  BidPlaced as BidPlacedEvent,
  OwnershipTransferred as OwnershipTransferredEvent
} from "../generated/AuctionPlatform/AuctionPlatform"
import {
  AuctionCompleted,
  AuctionCreated,
  BidPlaced,
  OwnershipTransferred
} from "../generated/schema"

export function handleAuctionCompleted(event: AuctionCompletedEvent): void {
  let entity = new AuctionCompleted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.auctionId = event.params.auctionId
  entity.winner = event.params.winner
  entity.finalPrice = event.params.finalPrice

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleAuctionCreated(event: AuctionCreatedEvent): void {
  let entity = new AuctionCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.auctionId = event.params.auctionId
  entity.creatorAddress = event.params.creatorAddress
  entity.itemName = event.params.itemName
  entity.startingBid = event.params.startingBid
  entity.endTimestamp = event.params.endTimestamp

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleBidPlaced(event: BidPlacedEvent): void {
  let entity = new BidPlaced(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.auctionId = event.params.auctionId
  entity.bidderAddress = event.params.bidderAddress
  entity.amount = event.params.amount
  entity.timestamp = event.params.timestamp

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  let entity = new OwnershipTransferred(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.previousOwner = event.params.previousOwner
  entity.newOwner = event.params.newOwner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
