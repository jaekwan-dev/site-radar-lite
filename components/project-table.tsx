"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Eye } from "lucide-react"

// 타입 정의
interface Project {
  id: number | string
  district?: string
  address: string
  projectName?: string
  contractor: string
  permitDate?: string
  startDate?: string
  completionDate: string
  status?: string
  contact: string
  phone?: string
  email: string
  note?: string
}

interface ProjectTableProps {
  projects: Project[]
  onAddToTarget?: (project: Project) => void
  onDetailView?: (project: Project) => void
  onSort?: (field: string) => void
  getSortIcon?: (field: string) => React.ReactNode
  showActions?: boolean
}

export function ProjectTable({
  projects,
  onAddToTarget,
  onDetailView,
  onSort,
  getSortIcon,
  showActions = false
}: ProjectTableProps) {

  if (projects.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="text-lg font-medium mb-2">조회된 현장이 없습니다</div>
        <p className="text-sm">다른 조건으로 검색해보세요.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <Table>
        <TableHeader>
          <TableRow className="border-b bg-gray-50/50">
            {projects[0].projectName && (
              <TableHead className="font-semibold px-4 py-3">
                <Button
                  variant="ghost"
                  className="h-auto p-0 font-semibold hover:bg-transparent"
                  onClick={() => onSort?.('projectName')}
                >
                  프로젝트명 {getSortIcon?.('projectName')}
                </Button>
              </TableHead>
            )}
            <TableHead className="font-semibold px-4 py-3">
              <Button
                variant="ghost"
                className="h-auto p-0 font-semibold hover:bg-transparent"
                onClick={() => onSort?.('address')}
              >
                주소 {getSortIcon?.('address')}
              </Button>
            </TableHead>
            <TableHead className="font-semibold px-4 py-3">
              <Button
                variant="ghost"
                className="h-auto p-0 font-semibold hover:bg-transparent"
                onClick={() => onSort?.('contractor')}
              >
                시공사 {getSortIcon?.('contractor')}
              </Button>
            </TableHead>
            {projects[0].permitDate && (
              <TableHead className="font-semibold px-4 py-3">
                <Button
                  variant="ghost"
                  className="h-auto p-0 font-semibold hover:bg-transparent"
                  onClick={() => onSort?.('permitDate')}
                >
                  허가일 {getSortIcon?.('permitDate')}
                </Button>
              </TableHead>
            )}
            {projects[0].startDate && (
              <TableHead className="font-semibold px-4 py-3">
                <Button
                  variant="ghost"
                  className="h-auto p-0 font-semibold hover:bg-transparent"
                  onClick={() => onSort?.('startDate')}
                >
                  착공일 {getSortIcon?.('startDate')}
                </Button>
              </TableHead>
            )}
            <TableHead className="font-semibold px-4 py-3">
              <Button
                variant="ghost"
                className="h-auto p-0 font-semibold hover:bg-transparent"
                onClick={() => onSort?.('completionDate')}
              >
                준공예정일 {getSortIcon?.('completionDate')}
              </Button>
            </TableHead>
            {projects[0].status && (
              <TableHead className="font-semibold px-4 py-3">
                <Button
                  variant="ghost"
                  className="h-auto p-0 font-semibold hover:bg-transparent"
                  onClick={() => onSort?.('status')}
                >
                  상태 {getSortIcon?.('status')}
                </Button>
              </TableHead>
            )}
            <TableHead className="font-semibold px-4 py-3">담당자</TableHead>
            {projects[0].phone && (
              <TableHead className="font-semibold px-4 py-3">연락처</TableHead>
            )}
            {showActions && (
              <TableHead className="font-semibold px-4 py-3">액션</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project, idx) => (
            <TableRow key={project.id || idx} className="border-b hover:bg-blue-50/30 transition-colors">
              {project.projectName && (
                <TableCell className="px-4 py-3 font-medium">{project.projectName}</TableCell>
              )}
              <TableCell className="max-w-xs px-4 py-3">
                <div className="truncate font-medium" title={project.address}>
                  {project.address}
                </div>
              </TableCell>
              <TableCell className="font-medium px-4 py-3">{project.contractor}</TableCell>
              {project.permitDate && (
                <TableCell className="font-mono px-4 py-3">{project.permitDate}</TableCell>
              )}
              {project.startDate && (
                <TableCell className="font-mono px-4 py-3">{project.startDate}</TableCell>
              )}
              <TableCell className="font-mono px-4 py-3">{project.completionDate}</TableCell>
              {project.status && (
                <TableCell className="px-4 py-3">
                  <Badge 
                    variant={project.status === '착공' ? 'default' : 'secondary'}
                    className={project.status === '착공' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                  >
                    {project.status}
                  </Badge>
                </TableCell>
              )}
              <TableCell className="px-4 py-3">{project.contact}</TableCell>
              {project.phone && (
                <TableCell className="font-mono text-sm px-4 py-3">{project.phone}</TableCell>
              )}
              {showActions && (
                <TableCell className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => onAddToTarget?.(project)}
                      className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md transition-all"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      추가
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDetailView?.(project)}
                      className="shadow-sm hover:shadow-md transition-all"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      상세
                    </Button>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 