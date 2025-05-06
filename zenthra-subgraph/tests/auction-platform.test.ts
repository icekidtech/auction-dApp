import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { BigInt, Address } from "@graphprotocol/graph-ts"
import { AuctionCompleted } from "../generated/schema"
import { AuctionCompleted as AuctionCompletedEvent } from "../generated/AuctionPlatform/AuctionPlatform"
import { handleAuctionCompleted } from "../src/auction-platform"
import { createAuctionCompletedEvent } from "./auction-platform-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let auctionId = BigInt.fromI32(234)
    let winner = "Example string value"
    let finalPrice = BigInt.fromI32(234)
    let newAuctionCompletedEvent = createAuctionCompletedEvent(
      auctionId,
      winner,
      finalPrice
    )
    handleAuctionCompleted(newAuctionCompletedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("AuctionCompleted created and stored", () => {
    assert.entityCount("AuctionCompleted", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "AuctionCompleted",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "auctionId",
      "234"
    )
    assert.fieldEquals(
      "AuctionCompleted",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "winner",
      "Example string value"
    )
    assert.fieldEquals(
      "AuctionCompleted",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "finalPrice",
      "234"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
