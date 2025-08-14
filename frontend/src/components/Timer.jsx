import React, { useEffect, useState } from "react";
import { Typography } from "@mui/material";

export default function Timer({ minutes, onTimeUp }) {
  const [secondsLeft, setSecondsLeft] = useState(minutes * 60);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onTimeUp();
      return;
    }
    const interval = setInterval(() => {
      setSecondsLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsLeft, onTimeUp]);

  const min = Math.floor(secondsLeft / 60);
  const sec = secondsLeft % 60;

  return (
    <Typography variant="h6">
      Time Remaining: {min}:{sec.toString().padStart(2, "0")}
    </Typography>
  );
}
