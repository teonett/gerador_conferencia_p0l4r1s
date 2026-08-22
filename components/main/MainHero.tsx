import type { ReactNode } from "react";
import { PageHero } from "../layout/PageHero";

interface MainHeroProps {
  title?: string;
  description?: string;
  children?: ReactNode;
}

const DEFAULT_TITLE = "Gerador de Checklists";
const DEFAULT_DESCRIPTION = "Crie, execute e gerencie seus checklists.";

export function MainHero({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  children,
}: MainHeroProps) {
  return (
    <PageHero title={title} description={description}>
      {children}
    </PageHero>
  );
}
