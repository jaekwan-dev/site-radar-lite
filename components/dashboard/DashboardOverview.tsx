"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Building2, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Users,
  BarChart3,
  RefreshCw
} from "lucide-react"
import { DashboardStats, DashboardCard } from "@/lib/types"
import { getExtendedAPI } from "@/lib/extended-api"
import { toast } from "sonner"

interface DashboardOverviewProps {
  className?: string
}

export function DashboardOverview({ className }: DashboardOverviewProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      const api = getExtendedAPI()
      const response = await api.getDashboardStats()
      
      if (response.success && response.data) {
        setStats(response.data)
        setLastUpdated(new Date())
        toast.success("대시보드 데이터를 업데이트했습니다.")
      } else {
        toast.error("대시보드 데이터 로드에 실패했습니다.")
      }
    } catch (error) {
      console.error("대시보드 데이터 로드 오류:", error)
      toast.error("대시보드 데이터 로드 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">대시보드 개요</h2>
          <Button disabled>
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            로딩중...
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">대시보드 데이터를 불러올 수 없습니다.</p>
        <Button onClick={loadDashboardData} className="mt-4">
          다시 시도
        </Button>
      </div>
    )
  }

  // 대시보드 카드 데이터 생성
  const dashboardCards: DashboardCard[] = [
    {
      id: "total",
      title: "전체 프로젝트",
      value: stats.totalProjects,
      icon: "Building2",
      color: "blue",
      description: "신도시 전체 건축 프로젝트"
    },
    {
      id: "active",
      title: "진행중 프로젝트",
      value: stats.activeProjects,
      icon: "Clock",
      color: "yellow",
      description: "현재 진행중인 프로젝트",
      change: {
        value: 12,
        type: "increase",
        period: "지난달 대비"
      }
    },
    {
      id: "completed",
      title: "완료 프로젝트",
      value: stats.completedProjects,
      icon: "CheckCircle",
      color: "green",
      description: "준공 완료된 프로젝트",
      change: {
        value: 8,
        type: "increase",
        period: "지난달 대비"
      }
    },
    {
      id: "planned",
      title: "계획 프로젝트",
      value: stats.plannedProjects,
      icon: "TrendingUp",
      color: "purple",
      description: "계획 단계의 프로젝트"
    }
  ]

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Building2": return <Building2 className="w-5 h-5" />
      case "Clock": return <Clock className="w-5 h-5" />
      case "CheckCircle": return <CheckCircle className="w-5 h-5" />
      case "TrendingUp": return <TrendingUp className="w-5 h-5" />
      default: return <BarChart3 className="w-5 h-5" />
    }
  }

  const getColorClasses = (color: string) => {
    switch (color) {
      case "blue": return "text-blue-600 bg-blue-50"
      case "green": return "text-green-600 bg-green-50"
      case "yellow": return "text-yellow-600 bg-yellow-50"
      case "red": return "text-red-600 bg-red-50"
      case "purple": return "text-purple-600 bg-purple-50"
      default: return "text-gray-600 bg-gray-50"
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold">대시보드 개요</h2>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              시뮬레이션 데이터
            </Badge>
          </div>
          <p className="text-gray-600">
            신도시/택지개발지구 건축 현황 종합 정보
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-sm text-gray-500">
              최종 업데이트: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <Button onClick={loadDashboardData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            새로고침
          </Button>
        </div>
      </div>

      {/* 주요 지표 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardCards.map((card) => (
          <Card key={card.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${getColorClasses(card.color || 'gray')}`}>
                  {getIcon(card.icon || 'BarChart3')}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold">
                  {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
                </div>
                {card.change && (
                  <div className="flex items-center text-sm">
                    <TrendingUp className={`w-3 h-3 mr-1 ${
                      card.change.type === 'increase' ? 'text-green-500' : 'text-red-500'
                    }`} />
                    <span className={
                      card.change.type === 'increase' ? 'text-green-600' : 'text-red-600'
                    }>
                      +{card.change.value} {card.change.period}
                    </span>
                  </div>
                )}
                <p className="text-xs text-gray-500">{card.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 단계별 현황 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            프로젝트 단계별 현황
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {stats.stageStats.permitPending}
              </div>
              <div className="text-sm text-gray-600">허가대기</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stats.stageStats.permitApproved}
              </div>
              <div className="text-sm text-gray-600">허가완료</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {stats.stageStats.constructionStarted}
              </div>
              <div className="text-sm text-gray-600">착공</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {stats.stageStats.underConstruction}
              </div>
              <div className="text-sm text-gray-600">시공중</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats.stageStats.nearCompletion}
              </div>
              <div className="text-sm text-gray-600">준공임박</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {stats.stageStats.completed}
              </div>
              <div className="text-sm text-gray-600">준공완료</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 지역별 현황 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            지역별 현황
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.regionStats.map((region, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{region.region}</div>
                  <div className="text-sm text-gray-600">
                    프로젝트 {region.projectCount}개 • 세대수 {region.totalHouseholds.toLocaleString()}세대
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">{region.averageProgress}%</div>
                  <div className="text-xs text-gray-500">평균 진행률</div>
                </div>
                <div className="ml-4">
                  <Badge variant={region.averageProgress >= 70 ? "default" : region.averageProgress >= 50 ? "secondary" : "outline"}>
                    {region.averageProgress >= 70 ? "순조" : region.averageProgress >= 50 ? "보통" : "지연"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 규모별 분석 */}
      <Card>
        <CardHeader>
          <CardTitle>규모별 프로젝트 분석</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">
                {stats.scaleAnalysis.smallScale}
              </div>
              <div className="text-sm text-blue-700 mt-1">소규모</div>
              <div className="text-xs text-gray-600">100세대 미만</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">
                {stats.scaleAnalysis.mediumScale}
              </div>
              <div className="text-sm text-green-700 mt-1">중규모</div>
              <div className="text-xs text-gray-600">100-500세대</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">
                {stats.scaleAnalysis.largeScale}
              </div>
              <div className="text-sm text-purple-700 mt-1">대규모</div>
              <div className="text-xs text-gray-600">500세대 이상</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 