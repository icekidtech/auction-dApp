import { formatDistanceToNow } from "date-fns"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

interface Bid {
  bidder: string
  amount: number
  time: Date
}

interface BidHistoryProps {
  bids: Bid[]
}

export function BidHistory({ bids }: BidHistoryProps) {
  return (
    <div className="overflow-auto max-h-[400px] -mx-2 px-2">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-purple-500/10">
            <TableHead className="text-muted-foreground">Bidder</TableHead>
            <TableHead className="text-muted-foreground">Amount</TableHead>
            <TableHead className="text-muted-foreground">Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bids.map((bid, index) => (
            <TableRow
              key={index}
              className={cn("border-b border-purple-500/10 transition-colors", index === 0 ? "bg-purple-500/5" : "")}
            >
              <TableCell className="font-mono">
                {bid.bidder.slice(0, 6)}...{bid.bidder.slice(-4)}
              </TableCell>
              <TableCell className={index === 0 ? "font-bold text-purple-400" : ""}>{bid.amount} LSK</TableCell>
              <TableCell className="text-muted-foreground">
                {formatDistanceToNow(bid.time, { addSuffix: true })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
