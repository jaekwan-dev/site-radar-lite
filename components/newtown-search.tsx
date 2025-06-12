"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ProjectTable } from "./project-table"
import { Search, Download, Filter, FileSpreadsheet } from "lucide-react"
import { toast } from "sonner"
import * as XLSX from 'xlsx'

// 타입 정의
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

interface NewTownSearchProps {
  projects: NewTownProject[]
  isLoading: boolean
  completionFilter: string
  statusFilter: string
  sortField: string
  sortDirection: 'asc' | 'desc'
  onSearch: () => void
  onAddToTarget: (project: NewTownProject) => void
  onDetailView: (project: NewTownProject) => void
  onCompletionFilterChange: (value: string) => void
  onStatusFilterChange: (value: string) => void
  onSort: (field: string) => void
  getSortIcon: (field: string) => React.ReactNode
}

export function NewTownSearch({
  projects,
  isLoading,
  completionFilter,
  statusFilter,
  sortField,
  sortDirection,
  onSearch,
  onAddToTarget,
  onDetailView,
  onCompletionFilterChange,
  onStatusFilterChange,
  onSort,
  getSortIcon
}: NewTownSearchProps) {
  // 필터링된 프로젝트 계산
  const getFilteredProjects = () => {
    let filtered = [...projects]

    // 준공예정일 필터
    if (completionFilter !== "all") {
      filtered = filtered.filter((project) => {
        const completionDate = new Date(project.completionDate)
        
        switch (completionFilter) {
          case "6months":
            const sixMonthsLater = new Date()
            sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6)
            return completionDate <= sixMonthsLater
          case "2025h1":
            const endOf2025H1 = new Date(2025, 5, 30)
            return completionDate <= endOf2025H1 && completionDate.getFullYear() === 2025
          case "2025h2":
            const startOf2025H2 = new Date(2025, 6, 1)
            const endOf2025H2 = new Date(2025, 11, 31)
            return completionDate >= startOf2025H2 && completionDate <= endOf2025H2
          case "2025":
            return completionDate.getFullYear() === 2025
          default:
            return true
        }
      })
    }

    // 상태 필터
    if (statusFilter !== "all") {
      filtered = filtered.filter(project => project.status === statusFilter)
    }

    // 정렬
    filtered.sort((a, b) => {
      let aValue: string | number | Date = a[sortField as keyof NewTownProject]
      let bValue: string | number | Date = b[sortField as keyof NewTownProject]
      
      if (sortField === 'completionDate' || sortField === 'permitDate' || sortField === 'startDate') {
        aValue = new Date(aValue)
        bValue = new Date(bValue)
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }

  const filteredAndSortedProjects = getFilteredProjects()

  const exportToCSV = () => {
    const csvData = filteredAndSortedProjects.map(p => ({
      '지구명': p.district,
      '주소': p.address,
      '프로젝트명': p.projectName,
      '시공사': p.contractor,
      '허가일': p.permitDate,
      '착공일': p.startDate,
      '준공예정일': p.completionDate,
      '상태': p.status,
      '담당자': p.contact,
      '연락처': p.phone,
      '이메일': p.email
    }))

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n')

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `신도시현장_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    
    toast.success("CSV 파일이 다운로드되었습니다!")
  }

  const exportToExcel = () => {
    const excelData = filteredAndSortedProjects.map(p => ({
      '지구명': p.district,
      '주소': p.address,
      '프로젝트명': p.projectName,
      '시공사': p.contractor,
      '허가일': p.permitDate,
      '착공일': p.startDate,
      '준공예정일': p.completionDate,
      '상태': p.status,
      '담당자': p.contact,
      '연락처': p.phone,
      '이메일': p.email
    }))

    const ws = XLSX.utils.json_to_sheet(excelData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "신도시현장")
    
    const fileName = `신도시현장_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(wb, fileName)
    
    toast.success("엑셀 파일이 다운로드되었습니다!")
  }

  const getFilterLabel = (filter: string) => {
    const labels = {
      "all": "전체 현장",
      "6months": "6개월 이내",
      "2025h1": "2025 상반기",
      "2025h2": "2025 하반기",
      "2025": "2025년 전체"
    }
    return labels[filter as keyof typeof labels] || filter
  }

  const getStatusLabel = (status: string) => {
    const labels = {
      "all": "전체 상태",
      "허가": "허가",
      "착공": "착공"
    }
    return labels[status as keyof typeof labels] || status
  }

  return (
    <div className="space-y-6">
      {/* 검색 카드 */}
      <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-gray-800">전국 신도시/택지개발지구 건축허가 및 착공 현장</CardTitle>
          <p className="text-gray-600 leading-relaxed">
            전국 신도시 및 택지개발지구 내 건축허가 및 착공된 사업을 조회합니다.
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* 검색 버튼 */}
          <div className="flex justify-center">
            <Button 
              onClick={onSearch} 
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all px-8 py-2"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Search className="w-4 h-4 mr-2" />
              )}
              {isLoading ? '조회 중...' : '전체 현장 조회'}
            </Button>
          </div>

          {/* 필터 및 정렬 */}
          <div className="flex flex-wrap items-center gap-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <Select value={completionFilter} onValueChange={onCompletionFilterChange}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="준공예정일 필터" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 현장</SelectItem>
                  <SelectItem value="6months">6개월 이내 준공</SelectItem>
                  <SelectItem value="2025h1">2025년 상반기</SelectItem>
                  <SelectItem value="2025h2">2025년 하반기</SelectItem>
                  <SelectItem value="2025">2025년 전체</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="상태 필터" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 상태</SelectItem>
                  <SelectItem value="허가">허가</SelectItem>
                  <SelectItem value="착공">착공</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 활성 필터 표시 */}
            <div className="flex items-center gap-2">
              {completionFilter !== "all" && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {getFilterLabel(completionFilter)}
                </Badge>
              )}
              {statusFilter !== "all" && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {getStatusLabel(statusFilter)}
                </Badge>
              )}
              {sortField && (
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  {sortField} {sortDirection === 'asc' ? '↑' : '↓'}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 검색 결과 카드 */}
      <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-bold text-gray-800">검색 결과</CardTitle>
              <p className="text-gray-600 mt-1">
                총 <span className="font-semibold text-blue-600">{projects.length}</span>개 현장 중 
                <span className="font-semibold text-green-600 ml-1">{filteredAndSortedProjects.length}</span>개 현장 표시
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" onClick={exportToExcel} className="shadow-sm hover:shadow-md transition-shadow">
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                엑셀 다운로드
              </Button>
              <Button variant="outline" onClick={exportToCSV} className="shadow-sm hover:shadow-md transition-shadow">
                <Download className="w-4 h-4 mr-2" />
                CSV 다운로드
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {filteredAndSortedProjects.length > 0 ? (
            <ProjectTable
              projects={filteredAndSortedProjects as never}
              onAddToTarget={onAddToTarget as never}
              onDetailView={onDetailView as never}
              onSort={onSort}
              getSortIcon={getSortIcon}
              showActions={true}
            />
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-2">검색 결과가 없습니다</div>
              <div className="text-gray-500 text-sm">
                {projects.length === 0 
                  ? "먼저 '전체 현장 조회' 버튼을 클릭해주세요" 
                  : "다른 필터 조건을 시도해보세요"
                }
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 