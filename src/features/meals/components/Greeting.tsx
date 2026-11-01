import { EasterEgg } from "@/components/ui";
import { getFirstName } from "@/utils/name";

type GreetingProps = {
  name: string | null;
};

export function Greeting({ name }: GreetingProps) {
  return (
    <section className="greeting">
      <div>
        <h1 className="page-title">Yo, {getFirstName(name)}!</h1>
        <p className="page-subtitle">What we eating today?</p>
      </div>
      <EasterEgg slot="home-greeting" />
    </section>
  );
}
