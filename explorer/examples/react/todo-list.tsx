import { useState } from 'react';
import { TodoList } from '@mosaic-home/design-system/react';
import type { TodoItem } from '@mosaic-home/design-system/web';

export function TodoListExample() {
  const [items, setItems] = useState<TodoItem[]>([
    { id: 'milk', text: 'Oat milk', done: false, note: '2 cartons' },
    { id: 'bread', text: 'Sourdough loaf', done: false },
    { id: 'apples', text: 'Apples', done: false },
    { id: 'eggs', text: 'Eggs', done: true },
  ]);
  return (
    <TodoList
      label="Shopping"
      items={items}
      onAdd={(text) => setItems((list) => [...list, { id: crypto.randomUUID(), text, done: false }])}
      onToggle={(id, done) => setItems((list) => list.map((i) => (i.id === id ? { ...i, done } : i)))}
      // The ids are the open items in their new order.
      onReorder={(ids) =>
        setItems((list) => [...ids.map((id) => list.find((i) => i.id === id)!), ...list.filter((i) => i.done)])
      }
      onRemove={(id) => setItems((list) => list.filter((i) => i.id !== id))}
      onClearCompleted={(ids) => setItems((list) => list.filter((i) => !ids.includes(i.id)))}
    />
  );
}
