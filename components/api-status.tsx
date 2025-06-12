"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Wifi, WifiOff, RefreshCw, Database, Clock, CheckCircle } from "lucide-react"

interface ApiStatusProps {
  isConnected?: boolean
  lastUpdate?: Date
  totalRecords?: number
  onRefresh?: () => void
  isLoading?: boolean
}

export function ApiStatus({ 
  isConnected = true, 
  lastUpdate = new Date(), 
  totalRecords = 6, 
  onRefresh,
  isLoading = false 
}: ApiStatusProps = {}) {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const getTimeSinceUpdate = () => {
    if (!lastUpdate) return null
    const diff = Math.floor((currentTime.getTime() - lastUpdate.getTime()) / 1000)
    if (diff < 60) return `${diff}초 전`
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`
    return `${Math.floor(diff / 3600)}시간 전`
  }

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-blue-600" />
            <span>실시간 API 연동 상태</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="h-8"
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            새로고침
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 연결 상태 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <Wifi className="w-4 h-4 text-green-600" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-600" />
            )}
            <span className="text-sm font-medium">공공데이터포털 연결</span>
          </div>
          <Badge 
            variant={isConnected ? "default" : "destructive"}
            className={isConnected ? "bg-green-100 text-green-800" : ""}
          >
            {isConnected ? "연결됨" : "연결 안됨"}
          </Badge>
        </div>

        {/* 데이터 현황 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <Database className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">총 레코드</span>
            </div>
            <p className="text-xl font-bold text-blue-900">{totalRecords.toLocaleString()}</p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <Clock className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">현재 시간</span>
            </div>
            <p className="text-lg font-bold text-green-900">{formatTime(currentTime)}</p>
          </div>
        </div>

        {/* 마지막 업데이트 */}
        {lastUpdate && (
          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-700">마지막 업데이트</span>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {formatTime(lastUpdate)}
              </p>
              <p className="text-xs text-gray-500">
                {getTimeSinceUpdate()}
              </p>
            </div>
          </div>
        )}

        {/* API 정보 */}
        <div className="border-t pt-3">
          <h4 className="text-sm font-medium text-gray-700 mb-2">연동 API 정보</h4>
          <div className="space-y-1 text-xs text-gray-600">
            <p>• 국토교통부 건축HUB 건축인허가정보 서비스</p>
            <p>• 택지개발사업지구 건축물 현황정보</p>
            <p>• 실시간 데이터 업데이트 지원</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 