import { APP_NAME } from "@/constants/app";

import "./Wordmark.css";

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`wordmark ${className}`}>
      {APP_NAME}
      <span className="wordmark-dot">.</span>
    </span>
  );
}
