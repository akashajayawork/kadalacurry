import { ChevronDown } from "lucide-react";
import { useId, useState, type PropsWithChildren, type ReactNode } from "react";

type CollapsibleSectionProps = PropsWithChildren<{
  title: string;
  /** Next to the title, e.g. a count. */
  badge?: ReactNode;
  /** One line under the title while closed, so it's useful without opening. */
  summary?: ReactNode;
  defaultOpen?: boolean;
}>;

/**
 * A room setup section that opens and closes from its header. The content
 * stays mounted while closed, so unsaved edits survive closing it.
 */
export function CollapsibleSection({
  title,
  badge,
  summary,
  defaultOpen = false,
  children,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const bodyId = useId();

  return (
    <section className={`setup-section setup-collapsible ${open ? "is-open" : ""}`}>
      <h3 className="setup-toggle-heading">
        <button
          type="button"
          className="setup-toggle"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          aria-controls={bodyId}
        >
          <span className="setup-toggle-text">
            <span className="setup-toggle-title">
              {title}
              {badge}
            </span>
            {summary && !open && <span className="setup-toggle-summary">{summary}</span>}
          </span>
          <ChevronDown size={20} className="setup-toggle-chevron" aria-hidden="true" />
        </button>
      </h3>

      <div id={bodyId} className="setup-collapsible-body" inert={!open}>
        <div className="setup-collapsible-inner">
          <div className="setup-collapsible-content">{children}</div>
        </div>
      </div>
    </section>
  );
}
