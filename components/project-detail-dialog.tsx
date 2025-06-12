"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { 
  Building2, 
  MapPin, 
  Calendar, 
  Clock,
  AlertTriangle,
  Shield,
  FileText,
  BarChart3,
  Activity,
  Truck,
  Wrench,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { 
  type ComprehensiveProjectInfo,
  type KisconCompanyInfo,
  type KisconStatistics,
  type SafetyMapInfo,
  type ConstructionSystemInfo,
  type RegionalConstructionInfo
} from "@/lib/api"

interface SelectedProject {
  id: number | string
  projectName?: string
  address?: string
}

interface ProjectDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: SelectedProject | null
  isLoading: boolean
  comprehensiveInfo: ComprehensiveProjectInfo | null
}

export function ProjectDetailDialog({
  open,
  onOpenChange,
  project,
  isLoading,
  comprehensiveInfo
}: ProjectDetailDialogProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getStatusColor = (status: 'success' | 'failed' | 'simulation') => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800'
      case 'simulation': return 'bg-yellow-100 text-yellow-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: 'success' | 'failed' | 'simulation') => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4" />
      case 'simulation': return <AlertCircle className="w-4 h-4" />
      case 'failed': return <XCircle className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  const getRiskLevelColor = (level: 'high' | 'medium' | 'low') => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getEnvironmentalStatusColor = (status: 'normal' | 'warning' | 'violation') => {
    switch (status) {
      case 'normal': return 'text-green-600'
      case 'warning': return 'text-yellow-600'
      case 'violation': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const renderKisconCompanyInfo = (info: KisconCompanyInfo) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          건설업체 상세정보
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">사업자등록번호</label>
            <p className="font-mono">{info.businessNumber}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">대표자명</label>
            <p>{info.ceoName}</p>
          </div>
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-500">업체 주소</label>
          <p>{info.companyAddress}</p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-500">등록업종</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {info.registeredTypes.map((type, index) => (
              <Badge key={index} variant="secondary">{type}</Badge>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">건설업 등록증 정보</h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <label className="text-gray-500">등록번호</label>
              <p className="font-mono">{info.licenseInfo.licenseNumber}</p>
            </div>
            <div>
              <label className="text-gray-500">등록일자</label>
              <p>{info.licenseInfo.registrationDate}</p>
            </div>
            <div>
              <label className="text-gray-500">유효기간</label>
              <p>{info.licenseInfo.expiryDate}</p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-3">최근 3년간 공사실적</h4>
          <div className="space-y-3">
            {info.recentProjects.map((project, index) => (
              <div key={index} className="border rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-medium">{project.projectName}</h5>
                  <Badge variant="outline">{project.completionDate}</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-1">발주기관: {project.client}</p>
                <p className="text-sm font-medium text-blue-600">
                  계약금액: {formatCurrency(project.contractAmount)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderKisconStatistics = (stats: KisconStatistics) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          공사대장 통계
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="font-medium mb-3">월간 통보 건수 및 계약금액 추이</h4>
          <div className="space-y-2">
            {stats.monthlyData.map((data, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="font-medium">{data.month}</span>
                <div className="text-right">
                  <div className="text-sm">{data.reportCount}건</div>
                  <div className="text-xs text-gray-600">{formatCurrency(data.contractAmount)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-3">공사유형별 현황 분석</h4>
          <div className="space-y-3">
            {stats.typeAnalysis.map((type, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{type.type}</span>
                  <span>{type.count}건 ({type.percentage}%)</span>
                </div>
                <Progress value={type.percentage} className="h-2" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderSafetyInfo = (safety: SafetyMapInfo) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          위치기반 안전정보
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="font-medium mb-3">위험시설물 (반경 500m)</h4>
          <div className="space-y-2">
            {safety.hazardousFacilities.map((facility, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="font-medium">{facility.name}</span>
                    <Badge className={getRiskLevelColor(facility.riskLevel)}>
                      {facility.riskLevel}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{facility.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{facility.distance}m</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-3">응급의료기관/소방서</h4>
          <div className="space-y-2">
            {safety.emergencyFacilities.map((facility, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span className="font-medium">{facility.name}</span>
                    <Badge variant="outline">{facility.type}</Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm">{facility.distance}m</p>
                  <p className="text-xs text-gray-600">{facility.accessTime}분</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">교통혼잡도 정보</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>혼잡도:</span>
              <Badge className={
                safety.trafficInfo.congestionLevel === 'high' ? 'bg-red-100 text-red-800' :
                safety.trafficInfo.congestionLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }>
                {safety.trafficInfo.congestionLevel}
              </Badge>
            </div>
            <div>
              <span className="text-gray-600">혼잡시간:</span>
              <p>{safety.trafficInfo.peakHours.join(', ')}</p>
            </div>
            <div>
              <span className="text-gray-600">우회경로:</span>
              <p>{safety.trafficInfo.alternativeRoutes.join(', ')}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderConstructionSystemInfo = (info: ConstructionSystemInfo) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          건설사업정보시스템
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="font-medium mb-3">설계도서</h4>
          <div className="space-y-2">
            {info.designDocuments.map((doc, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4" />
                  <div>
                    <p className="font-medium">{doc.fileName}</p>
                    <p className="text-sm text-gray-600">{doc.type} • {doc.fileSize}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">{doc.uploadDate}</span>
                  <Button size="sm" variant="outline">
                    <Eye className="w-4 h-4 mr-1" />
                    보기
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-3">공사감리보고서</h4>
          <div className="space-y-3">
            {info.supervisionReports.map((report, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{report.reportDate}</span>
                  <Badge variant="outline">{report.progressRate}% 진행</Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">자재검수:</span>
                    <span className="ml-2 font-medium">{report.materialInspection}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">품질상태:</span>
                    <span className="ml-2 font-medium">{report.qualityStatus}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-3">유지보수 이력</h4>
          <div className="space-y-2">
            {info.maintenanceHistory.map((maintenance, index) => (
              <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{maintenance.type}</p>
                  <p className="text-sm text-gray-600">{maintenance.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{formatCurrency(maintenance.cost)}</p>
                  <p className="text-xs text-gray-500">{maintenance.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-3">설비별 점검주기</h4>
          <div className="space-y-2">
            {info.facilityInspections.map((inspection, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4" />
                  <span className="font-medium">{inspection.facility}</span>
                  <Badge className={
                    inspection.status === 'normal' ? 'bg-green-100 text-green-800' :
                    inspection.status === 'attention' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }>
                    {inspection.status}
                  </Badge>
                </div>
                <div className="text-right text-sm">
                  <p>최근: {inspection.lastInspection}</p>
                  <p className="text-gray-600">다음: {inspection.nextInspection}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderRegionalInfo = (info: RegionalConstructionInfo) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          지역별 건설현장 정보
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="font-medium mb-3">공사 진행 현황</h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>현재 단계: <strong>{info.progressInfo.currentStage}</strong></span>
              <Badge variant="outline">{info.progressInfo.progressRate}% 완료</Badge>
            </div>
            <Progress value={info.progressInfo.progressRate} className="h-3" />
            <p className="text-sm text-gray-600">
              예상 준공일: {info.progressInfo.expectedCompletion}
            </p>
            
            <div className="space-y-2">
              <h5 className="font-medium">주요 마일스톤</h5>
              {info.progressInfo.milestones.map((milestone, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    {milestone.status === 'completed' && <CheckCircle className="w-4 h-4 text-green-600" />}
                    {milestone.status === 'in_progress' && <Clock className="w-4 h-4 text-blue-600" />}
                    {milestone.status === 'pending' && <Calendar className="w-4 h-4 text-gray-400" />}
                    <span className={milestone.status === 'completed' ? 'line-through text-gray-500' : ''}>
                      {milestone.stage}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {milestone.actualDate || milestone.plannedDate}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-3">환경측정 데이터</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 border rounded-lg">
              <p className="text-sm text-gray-600">소음</p>
              <p className={`text-lg font-bold ${getEnvironmentalStatusColor(info.environmentalData.noise.status)}`}>
                {info.environmentalData.noise.level}dB
              </p>
              <p className="text-xs text-gray-500">기준: {info.environmentalData.noise.standard}dB</p>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <p className="text-sm text-gray-600">진동</p>
              <p className={`text-lg font-bold ${getEnvironmentalStatusColor(info.environmentalData.vibration.status)}`}>
                {info.environmentalData.vibration.level}dB
              </p>
              <p className="text-xs text-gray-500">기준: {info.environmentalData.vibration.standard}dB</p>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <p className="text-sm text-gray-600">먼지</p>
              <p className={`text-lg font-bold ${getEnvironmentalStatusColor(info.environmentalData.dust.status)}`}>
                {info.environmentalData.dust.level}㎍/㎥
              </p>
              <p className="text-xs text-gray-500">기준: {info.environmentalData.dust.standard}㎍/㎥</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            최종 측정: {info.environmentalData.lastMeasured}
          </p>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Truck className="w-4 h-4" />
            교통통제 계획
          </h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-600">통제 계획:</span>
              <p className="font-medium">{info.trafficControl.controlPlan}</p>
            </div>
            <div>
              <span className="text-gray-600">영향 도로:</span>
              <p>{info.trafficControl.affectedRoads.join(', ')}</p>
            </div>
            <div>
              <span className="text-gray-600">우회 경로:</span>
              <p>{info.trafficControl.alternativeRoutes.join(', ')}</p>
            </div>
            <div>
              <span className="text-gray-600">통제 기간:</span>
              <p>{info.trafficControl.controlPeriod.start} ~ {info.trafficControl.controlPeriod.end}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

     return (
     <Dialog open={open} onOpenChange={onOpenChange}>
       <DialogContent className="!max-w-none !w-[98vw] !h-[98vh] !max-h-none overflow-y-auto" style={{width: '98vw', height: '98vh', maxWidth: 'none', maxHeight: 'none'}}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            {project?.projectName || `프로젝트 ${project?.id}`} 상세정보
          </DialogTitle>
          {project?.address && (
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {project.address}
            </p>
          )}
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3">상세 정보를 조회하고 있습니다...</span>
          </div>
        ) : comprehensiveInfo ? (
          <div className="space-y-6">
            {/* 데이터 소스 상태 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">데이터 연계 상태</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {comprehensiveInfo.dataSources.map((source, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 border rounded-lg">
                      {getStatusIcon(source.status)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{source.source}</p>
                        <Badge className={`${getStatusColor(source.status)} text-xs`}>
                          {source.status === 'success' ? '연결됨' : 
                           source.status === 'simulation' ? '시뮬레이션' : '실패'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 탭으로 구분된 상세 정보 */}
            <Tabs defaultValue="kiscon" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="kiscon">KISCON</TabsTrigger>
                <TabsTrigger value="safety">안전정보</TabsTrigger>
                <TabsTrigger value="construction">건설정보</TabsTrigger>
                <TabsTrigger value="regional">지역정보</TabsTrigger>
                <TabsTrigger value="statistics">통계</TabsTrigger>
              </TabsList>

              <TabsContent value="kiscon" className="space-y-4">
                {comprehensiveInfo.kisconInfo ? 
                  renderKisconCompanyInfo(comprehensiveInfo.kisconInfo) :
                  <Card><CardContent className="py-8 text-center text-gray-500">KISCON 정보를 불러올 수 없습니다.</CardContent></Card>
                }
              </TabsContent>

              <TabsContent value="safety" className="space-y-4">
                {comprehensiveInfo.safetyInfo ? 
                  renderSafetyInfo(comprehensiveInfo.safetyInfo) :
                  <Card><CardContent className="py-8 text-center text-gray-500">안전정보를 불러올 수 없습니다.</CardContent></Card>
                }
              </TabsContent>

              <TabsContent value="construction" className="space-y-4">
                {comprehensiveInfo.constructionSystemInfo ? 
                  renderConstructionSystemInfo(comprehensiveInfo.constructionSystemInfo) :
                  <Card><CardContent className="py-8 text-center text-gray-500">건설정보를 불러올 수 없습니다.</CardContent></Card>
                }
              </TabsContent>

              <TabsContent value="regional" className="space-y-4">
                {comprehensiveInfo.regionalInfo ? 
                  renderRegionalInfo(comprehensiveInfo.regionalInfo) :
                  <Card><CardContent className="py-8 text-center text-gray-500">지역정보를 불러올 수 없습니다.</CardContent></Card>
                }
              </TabsContent>

              <TabsContent value="statistics" className="space-y-4">
                {comprehensiveInfo.kisconStats ? 
                  renderKisconStatistics(comprehensiveInfo.kisconStats) :
                  <Card><CardContent className="py-8 text-center text-gray-500">통계정보를 불러올 수 없습니다.</CardContent></Card>
                }
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">상세 정보를 불러올 수 없습니다.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
} 