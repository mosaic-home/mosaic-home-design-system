import { createTodoList, type TodoItem } from '@mosaic-home/design-system/web';

let items: TodoItem[] = [
  { id: 'milk', text: 'Oat milk', done: false, note: '2 cartons' },
  { id: 'bread', text: 'Sourdough loaf', done: false },
  { id: 'apples', text: 'Apples', done: false },
  { id: 'eggs', text: 'Eggs', done: true },
];

const set = (next: TodoItem[]): void => {
  items = next;
  list.update({ items });
};

const list = createTodoList({
  label: 'Shopping',
  items,
  onAdd: (text) => set([...items, { id: crypto.randomUUID(), text, done: false }]),
  onToggle: (id, done) => set(items.map((i) => (i.id === id ? { ...i, done } : i))),
  // The ids are the open items in their new order.
  onReorder: (ids) => set([...ids.map((id) => items.find((i) => i.id === id)!), ...items.filter((i) => i.done)]),
  onRemove: (id) => set(items.filter((i) => i.id !== id)),
  onClearCompleted: (ids) => set(items.filter((i) => !ids.includes(i.id))),
});

document.body.append(list.el);
