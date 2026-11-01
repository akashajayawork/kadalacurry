import {
  EASTER_EGG_SLOTS,
  EASTER_EGGS,
  SHOW_EMPTY_SLOTS,
  type EasterEggSlot,
} from "@/config/easterEggs";

import "./EasterEgg.css";

type EasterEggProps = {
  slot: EasterEggSlot;
  className?: string;
};

/** A reserved spot for a street-art image or GIF. Configure in config/easterEggs.ts. */
export function EasterEgg({ slot, className = "" }: EasterEggProps) {
  const asset = EASTER_EGGS[slot];
  const size = asset?.size ?? EASTER_EGG_SLOTS[slot];
  const style = { width: size, height: size };

  if (asset) {
    return (
      <img
        className={`easter-egg ${className}`}
        src={asset.src}
        alt={asset.alt ?? ""}
        style={
          asset.radius
            ? // A rounded image is a framed tile: fill the square so the corners
              // clip the picture, don't blend (white in the photo stays white),
              // and add a hairline ring so the edge shows even where it's white.
              {
                ...style,
                borderRadius: asset.radius,
                objectFit: "cover",
                mixBlendMode: "normal",
                boxShadow: "0 0 0 1px var(--color-border)",
              }
            : style
        }
        loading="lazy"
        draggable={false}
      />
    );
  }

  if (!SHOW_EMPTY_SLOTS) return null;

  return (
    <span
      className={`easter-egg easter-egg-placeholder ${className}`}
      style={style}
      title={`Easter egg slot: ${slot}`}
      aria-hidden="true"
    />
  );
}
