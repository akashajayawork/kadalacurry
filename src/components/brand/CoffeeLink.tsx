import { Coffee } from "lucide-react";

import { BUY_ME_A_COFFEE_URL } from "@/config/support";

import "./brand.css";

type CoffeeLinkProps = {
  /** "button": full width. "chip": small, for banners. */
  variant?: "button" | "chip";
};

/** Buy me a coffee. Shows as a dashed placeholder in development until the link is set in config/support.ts. */
export function CoffeeLink({ variant = "button" }: CoffeeLinkProps) {
  const className = `coffee-link coffee-link-${variant}`;
  const content = (
    <>
      <Coffee size={variant === "chip" ? 14 : 18} strokeWidth={2.2} />
      Buy me a coffee
    </>
  );

  if (!BUY_ME_A_COFFEE_URL) {
    return import.meta.env.DEV ? (
      <span
        className={`${className} is-placeholder`}
        title="Add your link to BUY_ME_A_COFFEE_URL in src/config/support.ts"
      >
        {content}
      </span>
    ) : null;
  }

  return (
    <a className={className} href={BUY_ME_A_COFFEE_URL} target="_blank" rel="noopener noreferrer">
      {content}
    </a>
  );
}
