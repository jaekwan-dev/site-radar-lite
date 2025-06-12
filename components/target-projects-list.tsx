"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProjectTable } from "./project-table"
import { Download, FileSpreadsheet, Trash2 } from "lucide-react"
import { toast } from "sonner"
import * as XLSX from 'xlsx'

// 타입 정의
interface TargetProject {
  id: number | string
  address: string
  contractor: string
  completionDate: string
  contact: string
  email: string
  note?: string
}

interface TargetProjectsListProps {
  targetProjects: TargetProject[]
  onClearAll: () => void
}

export function TargetProjectsList({ targetProjects, onClearAll }: TargetProjectsListProps) {
  const exportToCSV = () => {
    if (targetProjects.length === 0) {
      toast.error("다운로드할 데이터가 없습니다!")
      return
    }

    const csvData = targetProjects.map(p => ({
      '주소': p.address,
      '시공사': p.contractor,
      '준공예정일': p.completionDate,
      '담당자': p.contact,
      '이메일': p.email,
      '메모': p.note || ''
    }))

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n')

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `타겟현장_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    
    toast.success("CSV 파일이 다운로드되었습니다!")
  }

  const exportToExcel = () => {
    if (targetProjects.length === 0) {
      toast.error("다운로드할 데이터가 없습니다!")
      return
    }

    const excelData = targetProjects.map(p => ({
      '주소': p.address,
      '시공사': p.contractor,
      '준공예정일': p.completionDate,
      '담당자': p.contact,
      '이메일': p.email,
      '메모': p.note || ''
    }))

    const ws = XLSX.utils.json_to_sheet(excelData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "타겟현장")
    
    const fileName = `타겟현장_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(wb, fileName)
    
    toast.success("엑셀 파일이 다운로드되었습니다!")
  }

  return (
    <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-xl font-bold text-gray-800">
            타겟 현장 목록 ({targetProjects.length}개)
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Button 
              variant="outline" 
              onClick={exportToExcel}
              disabled={targetProjects.length === 0}
              className="shadow-sm hover:shadow-md transition-shadow"
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              엑셀 다운로드
            </Button>
            <Button 
              variant="outline" 
              onClick={exportToCSV}
              disabled={targetProjects.length === 0}
              className="shadow-sm hover:shadow-md transition-shadow"
            >
              <Download className="w-4 h-4 mr-2" />
              CSV 다운로드
            </Button>
            <Button 
              variant="destructive" 
              onClick={onClearAll}
              disabled={targetProjects.length === 0}
              className="shadow-sm hover:shadow-md transition-shadow"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              전체 삭제
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <ProjectTable
          projects={targetProjects}
        />
      </CardContent>
    </Card>
  )
} 