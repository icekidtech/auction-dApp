"use client";

import { useEffect, useState } from "react";

export function TimeRemaining({ endTime }: { endTime: Date }) {
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  
  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      const difference = endTime.getTime() - now.getTime();
      
      if (difference <= 0) {
        setTimeRemaining("Ended");
        return;
      }
      
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      
      if (days > 0) {
        setTimeRemaining(`${days}d ${hours}h`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m`);
      } else {
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeRemaining(`${minutes}m ${seconds}s`);
      }
    };
    
    calculateTimeRemaining();
    const timer = setInterval(calculateTimeRemaining, 1000);
    
    return () => clearInterval(timer);
  }, [endTime]);
  
  return <>{timeRemaining}</>;
}