import * as React from 'react';

interface TabsProps {
  defaultValue: string;
  className?: string;
  children: React.ReactNode;
}

export const Tabs: React.FC<TabsProps> = ({ defaultValue, className = '', children }) => {
  return (
    <div className={className} data-default-value={defaultValue}>
      {children}
    </div>
  );
};

interface TabsListProps {
  className?: string;
  children: React.ReactNode;
}

export const TabsList: React.FC<TabsListProps> = ({ className = '', children }) => {
  return <div className={className}>{children}</div>;
};

interface TabsTriggerProps {
  value: string;
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({
  value,
  className = '',
  onClick,
  children,
}) => {
  return (
    <button className={className} onClick={onClick} data-value={value}>
      {children}
    </button>
  );
};

interface TabsContentProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

export const TabsContent: React.FC<TabsContentProps> = ({ value, className = '', children }) => {
  return (
    <div className={className} data-value={value}>
      {children}
    </div>
  );
};