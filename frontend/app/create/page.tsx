"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Calendar, Upload } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

export default function CreateAuctionPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [date, setDate] = useState<Date>()
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Auction created!",
        description: "Your auction has been created successfully.",
      })
      setIsSubmitting(false)
      router.push("/dashboard")
    }, 1500)
  }

  return (
    <main className="min-h-screen py-12">
      <div className="container max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="font-display text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
            Create New Auction
          </h1>
          <p className="text-muted-foreground">
            Fill in the details below to list your item for auction on the Lisk blockchain.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-2xl border border-purple-500/20 bg-background/50 backdrop-blur-sm overflow-hidden"
        >
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
            <div className="space-y-6 md:col-span-1">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Item Name
                </Label>
                <Input
                  id="name"
                  placeholder="Enter item name"
                  required
                  className="bg-background/50 border-purple-500/20 focus-visible:ring-purple-500/30"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe your auction item in detail"
                  className="min-h-[180px] bg-background/50 border-purple-500/20 focus-visible:ring-purple-500/30"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="starting-bid" className="text-sm font-medium">
                    Starting Bid (LSK)
                  </Label>
                  <Input
                    id="starting-bid"
                    type="number"
                    placeholder="Enter amount"
                    min="1"
                    step="1"
                    required
                    className="bg-background/50 border-purple-500/20 focus-visible:ring-purple-500/30"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end-date" className="text-sm font-medium">
                    Auction End Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="end-date"
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-background/50 border-purple-500/20 hover:bg-purple-500/10 hover:text-purple-400",
                          !date && "text-muted-foreground",
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 border border-purple-500/20">
                      <CalendarComponent
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            <div className="space-y-6 md:col-span-1">
              <div className="space-y-2">
                <Label htmlFor="image" className="text-sm font-medium">
                  Upload Image
                </Label>
                <div
                  className={cn(
                    "border border-dashed border-purple-500/20 rounded-xl overflow-hidden transition-all",
                    "hover:border-purple-500/40 hover:bg-purple-500/5",
                    previewImage ? "aspect-square" : "p-8",
                  )}
                >
                  {previewImage ? (
                    <div className="relative aspect-square">
                      <img
                        src={previewImage || "/placeholder.svg"}
                        alt="Preview"
                        className="object-cover w-full h-full"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="absolute bottom-3 right-3 bg-background/80 backdrop-blur-sm"
                        onClick={() => setPreviewImage(null)}
                      >
                        Change Image
                      </Button>
                    </div>
                  ) : (
                    <label
                      htmlFor="image-upload"
                      className="flex flex-col items-center justify-center gap-2 cursor-pointer h-full"
                    >
                      <Upload className="h-8 w-8 text-purple-400" />
                      <p className="text-sm text-center text-muted-foreground">Click to upload or drag and drop</p>
                      <p className="text-xs text-center text-muted-foreground">PNG, JPG or GIF (max. 5MB)</p>
                      <Input
                        id="image-upload"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        required
                        onChange={handleImageChange}
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <h3 className="font-medium">Auction Settings</h3>

                <div className="flex items-center justify-between p-3 rounded-lg border border-purple-500/20 bg-purple-500/5">
                  <div>
                    <p className="font-medium">Reserve Price</p>
                    <p className="text-sm text-muted-foreground">Set a minimum price for your item</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="Optional"
                      min="0"
                      step="1"
                      className="w-24 bg-background/50 border-purple-500/20 focus-visible:ring-purple-500/30"
                    />
                    <span className="text-sm">LSK</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-purple-500/20">
                  <div>
                    <p className="font-medium">Royalty</p>
                    <p className="text-sm text-muted-foreground">Earn on future sales</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="5%"
                      min="0"
                      max="15"
                      step="0.5"
                      className="w-20 bg-background/50 border-purple-500/20 focus-visible:ring-purple-500/30"
                    />
                    <span className="text-sm">%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 md:col-span-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/")}
                className="border-purple-500/20 hover:bg-purple-500/10 hover:text-purple-400"
              >
                Cancel
              </Button>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
                  disabled={isSubmitting || !date}
                >
                  {isSubmitting ? "Creating..." : "Create Auction"}
                </Button>
              </motion.div>
            </div>
          </form>
        </motion.div>
      </div>
    </main>
  )
}
