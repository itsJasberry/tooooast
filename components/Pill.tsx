import { cn } from "@/lib/utils";
import React from "react";

const Pill = ({
  title = "My favorite tools 🛠️",
  className,
}: {
  title?: string;
  className?: string;
}) => {
  return <div className={cn("pill text-xl font-bold", className)}>{title}</div>;
};

export default Pill;
