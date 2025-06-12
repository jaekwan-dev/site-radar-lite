"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ChevronUp, ChevronDown, Building2 } from "lucide-react"
import { toast } from "sonner"

// 컴포넌트 imports
import { StatsDashboard } from "@/components/stats-dashboard"
import { NewTownSearch } from "@/components/newtown-search"
import { ManualInput } from "@/components/manual-input"
import { TargetProjectsList } from "@/components/target-projects-list"
import { ProjectDetailDialog } from "@/components/project-detail-dialog"
import { ApiStatus } from "@/components/api-status"
import { ApiKeyDialog } from "@/components/api-key-dialog"


// API imports
import { 
  fetchNewTownProjects, 
  extendedPublicDataAPI,
  updateApiKey,
  type NewTownProject,
  type ComprehensiveProjectInfo
} from "@/lib/api"

// 타입 정의
interface Project {
  id: number
  address: string
  contractor: string
  completionDate: string
  contact: string
  email: string
  note?: string
}

interface FormData {
  address: string
  contractor: string
  completionDate: string
  contact: string
  email: string
  note: string
}

// SiteDetails 인터페이스는 ComprehensiveProjectInfo로 대체됨

interface SelectedProject {
  id: number | string
  projectName?: string
  address?: string
}

export default function SimulatorPage() {
  // 상태 관리
  const [projects, setProjects] = useState<NewTownProject[]>([])
  const [targetProjects, setTargetProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [completionFilter, setCompletionFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortField, setSortField] = useState("")
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  
  // Dialog 상태
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<SelectedProject | null>(null)
  const [comprehensiveInfo, setComprehensiveInfo] = useState<ComprehensiveProjectInfo | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false)

  // 폼 상태
  const [form, setForm] = useState<FormData>({
    address: "",
    contractor: "",
    completionDate: "",
    contact: "",
    email: "",
    note: ""
  })

  // 초기 데이터 로딩
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true)
      try {
        const data = await fetchNewTownProjects()
        setProjects(data)
        
        // 시뮬레이션 데이터인지 확인
        const isSimulationData = data.some(project => 
          project.projectName?.includes('[시뮬레이션]') || 
          project.district === '김포한강신도시'
        )
        
        if (isSimulationData && data.length > 0) {
          toast.info("시뮬레이션 데이터를 로드했습니다.\n실제 데이터를 보려면 API 키를 설정해주세요.", {
            duration: 4000
          })
        }
      } catch (error) {
        console.error('초기 데이터 로딩 실패:', error)
        
        if (error instanceof Error && error.message.includes('API 키가 등록되지 않았습니다')) {
          toast.error("API 키가 등록되지 않았습니다.\n.env.local 파일에 NEXT_PUBLIC_DATA_API_KEY를 설정해주세요.", {
            duration: 7000
          })
        } else {
          toast.error("데이터 로딩에 실패했습니다.")
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadInitialData()
  }, [])

  // localStorage에서 타겟 프로젝트 로드
  useEffect(() => {
    const saved = localStorage.getItem('targetProjects')
    if (saved) {
      setTargetProjects(JSON.parse(saved))
    }
  }, [])

  // 타겟 프로젝트 저장
  useEffect(() => {
    localStorage.setItem('targetProjects', JSON.stringify(targetProjects))
  }, [targetProjects])

  // 핸들러 함수들
  const handleSearch = async () => {
    setIsLoading(true)
    try {
      const data = await fetchNewTownProjects()
      setProjects(data)
      
      // 시뮬레이션 데이터인지 확인
      const isSimulationData = data.some(project => 
        project.projectName?.includes('[시뮬레이션]') || 
        project.district === '김포한강신도시'
      )
      
      if (isSimulationData) {
        toast.warning(`⚠️ 시뮬레이션 데이터 ${data.length}개를 표시합니다.\n실제 데이터를 보려면 API 키를 설정해주세요.`, {
          duration: 5000
        })
      } else {
        toast.success(`${data.length}개의 현장을 조회했습니다!`)
      }
    } catch (error) {
      console.error('검색 실패:', error)
      
      if (error instanceof Error && error.message.includes('API 키가 등록되지 않았습니다')) {
        toast.error("API 키가 등록되지 않았습니다.\n.env.local 파일에 NEXT_PUBLIC_DATA_API_KEY를 설정해주세요.", {
          duration: 7000
        })
      } else {
        toast.error("검색에 실패했습니다.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddToTarget = (project: NewTownProject | Project) => {
    const newProject: Project = {
      id: Date.now(),
      address: project.address,
      contractor: project.contractor,
      completionDate: project.completionDate,
      contact: project.contact,
      email: project.email,
      note: 'projectName' in project ? `신도시: ${project.projectName}` : project.note
    }

    setTargetProjects(prev => [...prev, newProject])
    
    const projectInfo = 'projectName' in project 
      ? `${project.contractor} - ${project.projectName}`
      : `${project.contractor} - ${project.address}`
    
    toast.success(`타겟 현장에 추가되었습니다!\n${projectInfo}`)
  }

  const handleDetailView = async (project: NewTownProject) => {
    setSelectedProject({
      id: project.id,
      projectName: project.projectName,
      address: project.address
    })
    
    setDialogOpen(true)
    setDetailLoading(true)
    
    try {
      const response = await extendedPublicDataAPI.getComprehensiveProjectDetail(project.id.toString(), project.address || '', project.projectName || '')
      if (response.success && response.data) {
        setComprehensiveInfo(response.data)
      } else {
        throw new Error(response.message || '상세 정보 조회 실패')
      }
    } catch (error) {
      console.error('상세 정보 조회 실패:', error)
      toast.error("상세 정보를 불러오는데 실패했습니다.")
    } finally {
      setDetailLoading(false)
    }
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleManualAdd = () => {
    if (!form.address || !form.contractor || !form.completionDate || !form.contact || !form.email) {
      toast.error("모든 필수 항목을 입력해주세요!")
      return
    }

    const newProject: Project = {
      id: Date.now(),
      address: form.address,
      contractor: form.contractor,
      completionDate: form.completionDate,
      contact: form.contact,
      email: form.email,
      note: form.note
    }

    setTargetProjects(prev => [...prev, newProject])
    
    // 폼 초기화
    setForm({
      address: "",
      contractor: "",
      completionDate: "",
      contact: "",
      email: "",
      note: ""
    })

    toast.success(`타겟 현장에 추가되었습니다!\n${newProject.contractor} - ${newProject.address}`)
  }

  const handleClearAll = () => {
    setTargetProjects([])
    toast.success("모든 타겟 현장이 삭제되었습니다!")
  }

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (field: string) => {
    if (sortField !== field) return null
    return sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
  }

  const handleStatClick = (filterType: string) => {
    if (isLoading) return
    
    setCompletionFilter(filterType)
    
    // 스크롤을 신도시 현장 조회 섹션으로 이동
    setTimeout(() => {
      const element = document.getElementById('newtown-search')
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }

  const handleApiKeySet = async (apiKey: string) => {
    updateApiKey(apiKey)
    toast.success("API 키가 설정되었습니다! 실제 데이터를 조회할 수 있습니다.")
    
    // 데이터 새로고침
    await handleSearch()
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* 헤더 */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Site Radar Lite - 시뮬레이터
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            건축현장 타겟 관리 도구 - 실시간 현장 정보 조회 및 타겟 현장 관리 (시뮬레이션 데이터)
          </p>
        </div>

        {/* 통계 대시보드 */}
        <StatsDashboard 
          projects={projects}
          isLoading={isLoading}
          onStatClick={handleStatClick}
        />

                         {/* API 상태 */}
        <ApiStatus 
          isConnected={true}
          lastUpdate={new Date()}
          totalRecords={projects.length}
          onRefresh={handleSearch}
          onOpenApiKeyDialog={() => setApiKeyDialogOpen(true)}
          isLoading={isLoading}
        />

        {/* 전국 건축허가/착공 조회 시스템 버튼 */}
        <div className="text-center">
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-3"
            onClick={() => window.location.href = '/search'}
          >
            <Building2 className="w-5 h-5 mr-2" />
            전국 건축허가/착공 조회 시스템
          </Button>
        </div>

        {/* 메인 탭 */}
        <Tabs defaultValue="search" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm shadow-lg">
            <TabsTrigger value="search" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              신도시 현장 조회
            </TabsTrigger>
            <TabsTrigger value="manual" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              수동 입력
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" id="newtown-search">
            <NewTownSearch
              projects={projects}
              isLoading={isLoading}
              completionFilter={completionFilter}
              statusFilter={statusFilter}
              sortField={sortField}
              sortDirection={sortDirection}
              onSearch={handleSearch}
              onAddToTarget={handleAddToTarget}
              onDetailView={handleDetailView}
              onCompletionFilterChange={setCompletionFilter}
              onStatusFilterChange={setStatusFilter}
              onSort={handleSort}
              getSortIcon={getSortIcon}
            />
          </TabsContent>

          <TabsContent value="manual">
            <ManualInput
              form={form}
              onFormChange={handleFormChange}
              onAdd={handleManualAdd}
            />
          </TabsContent>
        </Tabs>

        {/* 타겟 현장 목록 */}
        <TargetProjectsList
          targetProjects={targetProjects}
          onClearAll={handleClearAll}
        />

        {/* 상세 정보 Dialog */}
        <ProjectDetailDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          project={selectedProject}
          comprehensiveInfo={comprehensiveInfo}
          isLoading={detailLoading}
        />

        {/* API 키 설정 Dialog */}
        <ApiKeyDialog
          open={apiKeyDialogOpen}
          onOpenChange={setApiKeyDialogOpen}
          onApiKeySet={handleApiKeySet}
        />


      </div>
    </div>
  )
} 