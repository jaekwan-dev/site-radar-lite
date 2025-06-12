"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building, Users, Copy, Shield, AlertCircle, Search } from "lucide-react"

// 타입 정의
interface SiteManagerInfo {
  name: string
  position: string
  phone: string
  email: string
  licenseNumber?: string
  company: string
  department?: string
}

interface EngineeringTeamInfo {
  name: string
  position: string
  phone: string
  email: string
  department: string
  specialty: string
  company: string
}

interface SiteDetails {
  siteManager?: SiteManagerInfo
  engineeringTeam?: EngineeringTeamInfo[]
  architect?: SiteManagerInfo
  safetyManager?: SiteManagerInfo
  sources: string[]
  isRealData: boolean
  message?: string
}

interface SelectedProject {
  id: number | string
  projectName?: string
  address?: string
}

interface ProjectDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedProject: SelectedProject | null
  siteDetails: SiteDetails | null
  isLoading: boolean
}

export function ProjectDetailDialog({
  open,
  onOpenChange,
  selectedProject,
  siteDetails,
  isLoading
}: ProjectDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-none w-[95vw] h-[95vh] !max-h-none overflow-y-auto p-8" style={{width: '95vw', height: '95vh', maxWidth: 'none', maxHeight: 'none'}}>
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Building className="w-6 h-6 mr-3 text-blue-600" />
            현장 상세 정보
            {selectedProject && (
              <span className="ml-2 text-base font-normal text-gray-600">
                - {selectedProject.projectName}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-3 text-blue-600">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-lg font-medium">상세 정보를 조회하는 중...</span>
            </div>
          </div>
        ) : siteDetails ? (
          <div className="space-y-8 mt-6">
            {/* 정보 출처 */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm font-medium text-gray-600">정보 출처:</span>
              {siteDetails.sources.map((source, index) => (
                <Badge key={index} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {source}
                </Badge>
              ))}
            </div>

            {/* 실제 데이터가 없는 경우 안내 메시지 */}
            {!siteDetails.isRealData && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                  <span className="text-yellow-800 font-medium">
                    {siteDetails.message || '상세 담당자 정보는 현재 수집 중입니다'}
                  </span>
                </div>
                <p className="text-yellow-700 text-sm mt-2">
                  실제 API 연동이 완료되면 정확한 담당자 정보를 제공할 예정입니다.
                </p>
              </div>
            )}

            {/* 현장책임자 정보 */}
            {siteDetails.siteManager && (
              <Card className="border-blue-200 bg-blue-50/30">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl flex items-center">
                    <Building className="w-6 h-6 mr-3 text-blue-600" />
                    현장책임자
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-600">이름:</span>
                      <p className="font-medium">{siteDetails.siteManager?.name || '-'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">직책:</span>
                      <p className="font-medium">{siteDetails.siteManager?.position || '-'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">연락처:</span>
                      <p className="font-mono">{siteDetails.siteManager?.phone || '-'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">이메일:</span>
                      <p className="font-mono text-blue-600">{siteDetails.siteManager?.email || '-'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">소속:</span>
                      <p className="font-medium">{siteDetails.siteManager?.company || '-'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">면허번호:</span>
                      <p className="font-mono">{siteDetails.siteManager?.licenseNumber || '-'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 공무팀 정보 */}
            {siteDetails.engineeringTeam && siteDetails.engineeringTeam.length > 0 && (
              <Card className="border-green-200 bg-green-50/30">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl flex items-center">
                    <Users className="w-6 h-6 mr-3 text-green-600" />
                    공무팀
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid gap-4">
                    {siteDetails.engineeringTeam.map((member, index) => (
                      <div key={index} className="bg-white rounded-lg p-6 border border-green-100">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                          <div>
                            <span className="text-sm font-medium text-gray-600">이름:</span>
                            <p className="font-medium">{member.name || '-'}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-600">전문분야:</span>
                            {member.specialty ? (
                              <Badge variant="outline" className="bg-green-100 text-green-800">
                                {member.specialty}
                              </Badge>
                            ) : (
                              <span className="text-gray-500">-</span>
                            )}
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-600">직책:</span>
                            <p className="font-medium">{member.position || '-'}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-600">연락처:</span>
                            <p className="font-mono">{member.phone || '-'}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-600">이메일:</span>
                            <p className="font-mono text-blue-600">{member.email || '-'}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-600">부서:</span>
                            <p className="font-medium">{member.department || '-'}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 설계책임자 정보 */}
            {siteDetails.architect && (
              <Card className="border-purple-200 bg-purple-50/30">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl flex items-center">
                    <Copy className="w-6 h-6 mr-3 text-purple-600" />
                    설계책임자
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-600">이름:</span>
                      <p className="font-medium">{siteDetails.architect?.name || '-'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">직책:</span>
                      <p className="font-medium">{siteDetails.architect?.position || '-'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">연락처:</span>
                      <p className="font-mono">{siteDetails.architect?.phone || '-'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">이메일:</span>
                      <p className="font-mono text-blue-600">{siteDetails.architect?.email || '-'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">소속:</span>
                      <p className="font-medium">{siteDetails.architect?.company || '-'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">건축사 면허:</span>
                      <p className="font-mono">{siteDetails.architect?.licenseNumber || '-'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 안전관리자 정보 */}
            {siteDetails.safetyManager && (
              <Card className="border-orange-200 bg-orange-50/30">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl flex items-center">
                    <Shield className="w-6 h-6 mr-3 text-orange-600" />
                    안전관리자
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-600">이름:</span>
                      <p className="font-medium">{siteDetails.safetyManager?.name || '-'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">직책:</span>
                      <p className="font-medium">{siteDetails.safetyManager?.position || '-'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">연락처:</span>
                      <p className="font-mono">{siteDetails.safetyManager?.phone || '-'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">이메일:</span>
                      <p className="font-mono text-blue-600">{siteDetails.safetyManager?.email || '-'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">소속:</span>
                      <p className="font-medium">{siteDetails.safetyManager?.company || '-'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">부서:</span>
                      <p className="font-medium">{siteDetails.safetyManager?.department || '-'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>상세 정보를 조회할 수 없습니다.</p>
            <p className="text-sm">다시 시도해주세요.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
} 