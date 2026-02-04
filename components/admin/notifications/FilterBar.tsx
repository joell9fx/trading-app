'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Filter, RefreshCcw, Search } from 'lucide-react'

type StatusFilter = 'all' | 'unread' | 'resolved'
type TypeFilter = 'all' | 'funding_update' | 'community' | 'mentorship' | 'signal' | 'system' | 'general'
type DateFilter = 'all' | '7d' | '30d'

interface FilterBarProps {
  search: string
  onSearchChange: (value: string) => void
  statusFilter: StatusFilter
  onStatusChange: (value: StatusFilter) => void
  typeFilter: TypeFilter
  onTypeChange: (value: TypeFilter) => void
  dateFilter: DateFilter
  onDateChange: (value: DateFilter) => void
  onMarkAllRead: () => void
  onClearResolved: () => void
  onRefresh: () => void
}

export function FilterBar({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  typeFilter,
  onTypeChange,
  dateFilter,
  onDateChange,
  onMarkAllRead,
  onClearResolved,
  onRefresh,
}: FilterBarProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search notifications"
            className="pl-9 bg-gray-950 border-gray-800 text-white placeholder:text-gray-500 w-64"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={typeFilter}
            onChange={(e) => onTypeChange(e.target.value as TypeFilter)}
            className="flex h-10 rounded-md border border-gray-800 bg-gray-950 px-3 py-2 text-sm text-white"
          >
            <option value="all">All Types</option>
            <option value="funding_update">Funding</option>
            <option value="community">Community</option>
            <option value="mentorship">Mentorship</option>
            <option value="signal">Signals</option>
            <option value="system">System</option>
            <option value="general">General</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value as StatusFilter)}
            className="flex h-10 rounded-md border border-gray-800 bg-gray-950 px-3 py-2 text-sm text-white"
          >
            <option value="all">All Status</option>
            <option value="unread">Unread</option>
            <option value="resolved">Resolved</option>
          </select>
          <select
            value={dateFilter}
            onChange={(e) => onDateChange(e.target.value as DateFilter)}
            className="flex h-10 rounded-md border border-gray-800 bg-gray-950 px-3 py-2 text-sm text-white"
          >
            <option value="all">All Time</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          className="border-gray-700 text-gray-200 hover:border-gold-500/60 hover:text-gold-300"
          onClick={onMarkAllRead}
        >
          Mark all as read
        </Button>
        <Button
          variant="outline"
          className="border-gray-700 text-gray-200 hover:border-gold-500/60 hover:text-gold-300"
          onClick={onClearResolved}
        >
          Clear resolved
        </Button>
        <Button
          variant="outline"
          className="border-gray-700 text-gray-200 hover:border-gold-500/60 hover:text-gold-300"
          onClick={onRefresh}
        >
          <RefreshCcw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
    </div>
  )
}

