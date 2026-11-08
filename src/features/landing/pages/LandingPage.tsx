import { HousePlus, Sparkles } from "lucide-react";

import { BrandButton, CoffeeLink } from "@/components/brand";
import { EASTER_EGGS } from "@/config/easterEggs";
import { PATHS } from "@/constants/routes";

import { ChoiceTile } from "../components/ChoiceTile";
import { YourRooms } from "../components/YourRooms";
import "../landing.css";

/** The home page: try the demo or make a room, and get back into your own rooms. */
export function LandingPage() {
  return (
    <div className="landing">
      <header className="landing-top">
        <BrandButton />
        <CoffeeLink variant="chip" />
      </header>

      <main className="landing-main">
        <h1 className="landing-title">Shared meal planner</h1>
        <p className="landing-text">Order meals, split the bill and stay square</p>

        <div className="landing-choices">
          <ChoiceTile
            href={PATHS.demo}
            icon={Sparkles}
            art={EASTER_EGGS["demo-tile"]?.src}
            title="Try the demo"
            caption="No sign-in needed"
            tone="warm"
          />
          <ChoiceTile
            href={PATHS.create}
            icon={HousePlus}
            title="Make a room"
            caption="For your house"
            tone="dark"
          />
        </div>

        <YourRooms />
      </main>
    </div>
  );
}
