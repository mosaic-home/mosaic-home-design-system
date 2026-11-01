/**
 * Makes `parent`'s element children exactly `children`, in order, moving as little as possible: nodes that stay keep
 * their place, so a focused control inside one doesn't lose focus when a sibling appears or goes.
 */
export function syncChildren(parent: Element, children: readonly Element[]): void {
  const wanted = new Set(children);
  for (const child of Array.from(parent.children)) if (!wanted.has(child)) child.remove();
  children.forEach((child, i) => {
    const at = parent.children[i] ?? null;
    if (at !== child) parent.insertBefore(child, at);
  });
}
