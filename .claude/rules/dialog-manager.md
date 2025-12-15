---
paths: "**/*.tsx"
---

# Dialog Manager Usage

Use `dialogManager` for global modals instead of managing dialog state manually.

## Import

```tsx
import { dialogManager } from "@/features/dialog-manager/dialog-manager";
```

## Confirm Dialog

For confirmation prompts with action/cancel buttons:

```tsx
dialogManager.confirm({
  title: "Delete Item",
  description: "Are you sure you want to delete this item? This action cannot be undone.",
  variant: "destructive", // "default" | "destructive" | "warning"
  action: {
    label: "Delete",
    variant: "destructive",
    onClick: async () => {
      await deleteItem(id);
    },
  },
  cancel: {
    label: "Cancel",
  },
});
```

## Input Dialog

For prompts that require user input:

```tsx
dialogManager.input({
  title: "Rename Item",
  description: "Enter a new name for this item.",
  input: {
    label: "Name",
    defaultValue: currentName,
    placeholder: "Enter name...",
  },
  action: {
    label: "Save",
    onClick: async (inputValue) => {
      await renameItem(id, inputValue);
    },
  },
});
```

## Custom Dialog

For complex dialogs with custom content:

```tsx
dialogManager.custom({
  title: "Custom Dialog",
  size: "lg", // "sm" | "md" | "lg"
  children: <MyCustomComponent onClose={() => dialogManager.closeAll()} />,
});
```

## Dialog Options

All dialogs support these base options:

```tsx
{
  title?: string;
  description?: ReactNode;
  icon?: LucideIcon;
  variant?: "default" | "destructive" | "warning";
  size?: "sm" | "md" | "lg";
  style?: "default" | "centered";
}
```

## Closing Dialogs

```tsx
// Close a specific dialog by id
dialogManager.close(dialogId);

// Close all dialogs
dialogManager.closeAll();
```

## Automatic Loading States

Action buttons automatically show loading state while `onClick` promise is pending. No manual loading state management needed.
