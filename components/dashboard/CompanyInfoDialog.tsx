"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Building, 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Award, 
  Calendar,
  DollarSign,
  Star,
  AlertCircle,
  Loader2
} from "lucide-react"
import { ConstructionCompanyInfo } from "@/lib/types"
import { getExtendedAPI } from "@/lib/extended-api"
import { toast } from "sonner"

interface CompanyInfoDialogProps {
  companyName: string
  businessNumber?: string
  children: React.ReactNode
}

export function CompanyInfoDialog({ companyName, businessNumber, children }: CompanyInfoDialogProps) {
  const [open, setOpen] = useState(false)
  const [companyInfo, setCompanyInfo] = useState<ConstructionCompanyInfo | null>(null)
  const [loading, setLoading] = useState(false)

  const handleOpenDialog = async () => {
    setOpen(true)
    if (!companyInfo) {
      await loadCompanyInfo()
    }
  }

  const loadCompanyInfo = async () => {
    setLoading(true)
    try {
      const api = getExtendedAPI()
      // 실제로는 businessNumber를 사용하지만, 시뮬레이션에서는 회사명 기반으로 생성
      const mockBusinessNumber = businessNumber || `${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 90) + 10}-${Math.floor(Math.random() * 90000) + 10000}`
      const response = await api.getConstructionCompanyInfo(mockBusinessNumber)
      
      if (response.success && response.data) {
        // 회사명을 실제 전달받은 이름으로 업데이트
        setCompanyInfo({
          ...response.data,
          companyName: companyName
        })
      } else {
        toast.error("시공업체 정보를 불러올 수 없습니다.")
      }
    } catch (error) {
      console.error("시공업체 정보 로드 오류:", error)
      toast.error("시공업체 정보 로드 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return `${(amount / 100000000).toFixed(0)}억원`
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "특급": return "bg-purple-100 text-purple-800"
      case "1급": return "bg-blue-100 text-blue-800"
      case "2급": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 80) return "text-blue-600"
    if (score >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild onClick={handleOpenDialog}>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            {companyName} 상세정보
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2">시공업체 정보를 불러오는 중...</span>
          </div>
        ) : companyInfo ? (
          <div className="space-y-6">
            {/* 기본 정보 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  기본 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">대표자:</span>
                      <span className="font-medium">{companyInfo.ceoName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">주소:</span>
                      <span className="text-sm">{companyInfo.companyAddress}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">전화:</span>
                      <span className="text-sm">{companyInfo.phoneNumber}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">이메일:</span>
                      <span className="text-sm">{companyInfo.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">웹사이트:</span>
                      <a href={companyInfo.website} target="_blank" rel="noopener noreferrer" 
                         className="text-sm text-blue-600 hover:underline">
                        {companyInfo.website}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">사업자번호:</span>
                      <span className="text-sm font-mono">{companyInfo.businessNumber}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 면허 정보 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  면허 정보
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">면허번호:</span>
                      <span className="font-medium">{companyInfo.licenseInfo.licenseNumber}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">면허종류:</span>
                      <span className="font-medium">{companyInfo.licenseInfo.licenseType}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">면허등급:</span>
                      <Badge className={getGradeColor(companyInfo.licenseInfo.licenseGrade)}>
                        {companyInfo.licenseInfo.licenseGrade}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">등록일:</span>
                      <span className="text-sm">{companyInfo.licenseInfo.registrationDate}</span>
                    </div>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div>
                  <h4 className="font-medium mb-2">등록업종</h4>
                  <div className="flex flex-wrap gap-2">
                    {companyInfo.registeredTypes.map((type, index) => (
                      <Badge key={index} variant="outline">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 평가 정보 */}
            {companyInfo.evaluation && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    평가 정보
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className={`text-2xl font-bold ${getScoreColor(companyInfo.evaluation.totalScore)}`}>
                        {companyInfo.evaluation.totalScore}
                      </div>
                      <div className="text-xs text-gray-600">종합점수</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className={`text-2xl font-bold ${getScoreColor(companyInfo.evaluation.technicalScore)}`}>
                        {companyInfo.evaluation.technicalScore}
                      </div>
                      <div className="text-xs text-gray-600">기술점수</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className={`text-2xl font-bold ${getScoreColor(companyInfo.evaluation.managementScore)}`}>
                        {companyInfo.evaluation.managementScore}
                      </div>
                      <div className="text-xs text-gray-600">경영점수</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">
                        {companyInfo.evaluation.safetyRecord}
                      </div>
                      <div className="text-xs text-gray-600">안전실적</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    최종평가일: {companyInfo.evaluation.lastEvaluationDate}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 최근 프로젝트 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  최근 프로젝트
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {companyInfo.recentProjects.map((project, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium">{project.projectName}</h4>
                        <Badge variant="secondary">
                          {formatCurrency(project.contractAmount)}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                        <div>발주처: {project.client}</div>
                        <div>착공: {project.startDate}</div>
                        <div>준공: {project.completionDate}</div>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        위치: {project.location}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 시뮬레이션 안내 */}
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <AlertCircle className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-700">
                이 정보는 시뮬레이션 데이터입니다. 실제 서비스에서는 건설업체 정보 API를 통해 실시간 데이터를 제공합니다.
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">시공업체 정보를 불러올 수 없습니다.</p>
            <Button onClick={loadCompanyInfo} className="mt-4">
              다시 시도
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
} 