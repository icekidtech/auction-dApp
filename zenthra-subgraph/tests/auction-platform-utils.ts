import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address } from "@graphprotocol/graph-ts"
import {
  AuctionCompleted,
  AuctionCreated,
  BidPlaced,
  OwnershipTransferred
} from "../generated/AuctionPlatform/AuctionPlatform"

export function createAuctionCompletedEvent(
  auctionId: BigInt,
  winner: string,
  finalPrice: BigInt
): AuctionCompleted {
  let auctionCompletedEvent = changetype<AuctionCompleted>(newMockEvent())

  auctionCompletedEvent.parameters = new Array()

  auctionCompletedEvent.parameters.push(
    new ethereum.EventParam(
      "auctionId",
      ethereum.Value.fromUnsignedBigInt(auctionId)
    )
  )
  auctionCompletedEvent.parameters.push(
    new ethereum.EventParam("winner", ethereum.Value.fromString(winner))
  )
  auctionCompletedEvent.parameters.push(
    new ethereum.EventParam(
      "finalPrice",
      ethereum.Value.fromUnsignedBigInt(finalPrice)
    )
  )

  return auctionCompletedEvent
}

export function createAuctionCreatedEvent(
  auctionId: BigInt,
  creatorAddress: string,
  itemName: string,
  startingBid: BigInt,
  endTimestamp: BigInt
): AuctionCreated {
  let auctionCreatedEvent = changetype<AuctionCreated>(newMockEvent())

  auctionCreatedEvent.parameters = new Array()

  auctionCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "auctionId",
      ethereum.Value.fromUnsignedBigInt(auctionId)
    )
  )
  auctionCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "creatorAddress",
      ethereum.Value.fromString(creatorAddress)
    )
  )
  auctionCreatedEvent.parameters.push(
    new ethereum.EventParam("itemName", ethereum.Value.fromString(itemName))
  )
  auctionCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "startingBid",
      ethereum.Value.fromUnsignedBigInt(startingBid)
    )
  )
  auctionCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "endTimestamp",
      ethereum.Value.fromUnsignedBigInt(endTimestamp)
    )
  )

  return auctionCreatedEvent
}

export function createBidPlacedEvent(
  auctionId: BigInt,
  bidderAddress: string,
  amount: BigInt,
  timestamp: BigInt
): BidPlaced {
  let bidPlacedEvent = changetype<BidPlaced>(newMockEvent())

  bidPlacedEvent.parameters = new Array()

  bidPlacedEvent.parameters.push(
    new ethereum.EventParam(
      "auctionId",
      ethereum.Value.fromUnsignedBigInt(auctionId)
    )
  )
  bidPlacedEvent.parameters.push(
    new ethereum.EventParam(
      "bidderAddress",
      ethereum.Value.fromString(bidderAddress)
    )
  )
  bidPlacedEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )
  bidPlacedEvent.parameters.push(
    new ethereum.EventParam(
      "timestamp",
      ethereum.Value.fromUnsignedBigInt(timestamp)
    )
  )

  return bidPlacedEvent
}

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent =
    changetype<OwnershipTransferred>(newMockEvent())

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferredEvent
}
