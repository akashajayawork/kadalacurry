import type { LucideIcon } from "lucide-react";

import "./BottomNav.css";

export type NavItem<T extends string> = {
  id: T;
  label: string;
  icon: LucideIcon;
};

type BottomNavProps<T extends string> = {
  items: readonly NavItem<T>[];
  activeId: NoInfer<T>;
  onChange: (id: NoInfer<T>) => void;
};

/** Fixed tab bar, always visible at the bottom of the screen. */
export function BottomNav<T extends string>({ items, activeId, onChange }: BottomNavProps<T>) {
  return (
    <nav className="bottom-nav" aria-label="Main">
      <div className="bottom-nav-items">
        {items.map(({ id, label, icon: Icon }) => {
          const isActive = id === activeId;

          return (
            <button
              key={id}
              type="button"
              className={`bottom-nav-item ${isActive ? "is-active" : ""}`}
              aria-current={isActive ? "page" : undefined}
              onClick={() => onChange(id)}
            >
              <Icon size={23} strokeWidth={isActive ? 2.2 : 1.7} />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
