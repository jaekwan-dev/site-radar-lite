"use client"

import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Clock, Calendar } from "lucide-react"

interface NewTownProject {
  id: number | string
  district: string
  address: string
  projectName: string
  contractor: string
  permitDate: string
  startDate: string
  completionDate: string
  status: string
  contact: string
  phone: string
  email: string
}

interface StatsDashboardProps {
  projects: NewTownProject[]
  isLoading: boolean
  onStatClick: (filterType: string) => void
}

export function StatsDashboard({ projects, isLoading, onStatClick }: StatsDashboardProps) {
  const stats = {
    total: projects.length,
    sixMonths: projects.filter((p) => {
      const completionDate = new Date(p.completionDate)
      const sixMonthsLater = new Date()
      sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6)
      return completionDate <= sixMonthsLater
    }).length,
    h1_2025: projects.filter((p) => {
      const completionDate = new Date(p.completionDate)
      const endOf2025H1 = new Date(2025, 5, 30)
      return completionDate <= endOf2025H1 && completionDate.getFullYear() === 2025
    }).length,
    h2_2025: projects.filter((p) => {
      const completionDate = new Date(p.completionDate)
      const startOf2025H2 = new Date(2025, 6, 1)
      const endOf2025H2 = new Date(2025, 11, 31)
      return completionDate >= startOf2025H2 && completionDate <= endOf2025H2
    }).length
  }

  const statCards = [
    {
      id: "all",
      title: "전체 현장",
      value: stats.total,
      icon: MapPin,
      color: "blue"
    },
    {
      id: "6months",
      title: "6개월 내 준공",
      value: stats.sixMonths,
      icon: Clock,
      color: "purple"
    },
    {
      id: "2025h1",
      title: "2025 상반기",
      value: stats.h1_2025,
      icon: Calendar,
      color: "green"
    },
    {
      id: "2025h2",
      title: "2025 하반기",
      value: stats.h2_2025,
      icon: Calendar,
      color: "orange"
    }
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "bg-blue-100 text-blue-600 border-b-2 border-blue-600",
      purple: "bg-purple-100 text-purple-600 border-b-2 border-purple-600",
      green: "bg-green-100 text-green-600 border-b-2 border-green-600",
      orange: "bg-orange-100 text-orange-600 border-b-2 border-orange-600"
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statCards.map((stat) => {
        const Icon = stat.icon
        return (
          <Card 
            key={stat.id}
            className={`border-0 shadow-lg bg-white/80 backdrop-blur-sm transition-all duration-200 ${
              !isLoading ? 'cursor-pointer hover:shadow-xl hover:scale-105' : 'cursor-default'
            }`}
            onClick={() => !isLoading && onStatClick(stat.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${getColorClasses(stat.color)}`}>
                  {isLoading ? (
                    <div className={`animate-spin rounded-full h-5 w-5 border-b-2 border-${stat.color}-600`}></div>
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600">{stat.title}</p>
                  <p className="text-xl font-bold text-gray-900">
                    {isLoading ? '-' : stat.value}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
} 