import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

interface TabItem {
  value: string
  label: string
  content: React.ReactNode
}

interface VerticalTabsProps {
  tabs: TabItem[]
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  className?: string
}

const VerticalTabs: React.FC<VerticalTabsProps> = ({
  tabs,
  defaultValue,
  value,
  onValueChange,
  className,
}) => {
  return (
    <Tabs
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      orientation="vertical"
      className={cn('flex flex-col md:flex-row', className)}
    >
      <TabsList className="flex flex-col h-auto justify-start p-2 md:w-48 md:mr-4">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="w-full justify-start px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      <div className="flex-1">
        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-0">
            {tab.content}
          </TabsContent>
        ))}
      </div>
    </Tabs>
  )
}

export default VerticalTabs
