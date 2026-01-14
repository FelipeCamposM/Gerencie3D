import * as React from "react";

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function Tabs({ value, onValueChange, children, className }: TabsProps) {
  const [tab, setTab] = React.useState<string>(value);
  React.useEffect(() => { setTab(value); }, [value]);
  return (
    <div className={className}>{
      React.Children.map(children, child => {
        if (!React.isValidElement(child)) return child;
        if (child.type === TabsTrigger) {
          return React.cloneElement(
            child as React.ReactElement<TabsTriggerProps>,
            { tab, setTab, onValueChange }
          );
        }
        if (child.type === TabsContent) {
          return React.cloneElement(
            child as React.ReactElement<TabsContentProps>,
            { tab }
          );
        }
        return child;
      })
    }</div>
  );
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}
export function TabsList({ children, className }: TabsListProps) {
  return <div className={(className || "") + " flex gap-2"}>{children}</div>;
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  tab?: string;
  setTab?: (value: string) => void;
  onValueChange?: (value: string) => void;
}
export function TabsTrigger({ value, children, tab, setTab, onValueChange }: TabsTriggerProps) {
  const active = tab === value;
  const handleClick = () => {
    if (setTab) setTab(value);
    if (onValueChange) onValueChange(value);
  };
  return (
    <button
      className={`px-4 py-2 rounded ${active ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
      onClick={handleClick}
      type="button"
    >
      {children}
    </button>
  );
}

interface TabsContentProps {
  value: string;
  tab?: string;
  children: React.ReactNode;
}
export function TabsContent({ value, tab, children }: TabsContentProps) {
  return tab === value ? <div>{children}</div> : null;
}
