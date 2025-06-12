"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Building2, 
  FileText, 
  MapPin, 
  Car, 
  Wrench, 
  Home,
  TreePine,
  Shield,
  Layers,
  Search
} from "lucide-react"

interface BuildingPermitMenuProps {
  onServiceSelect: (serviceType: string, serviceName: string) => void
}

// 건축HUB 서비스 목록
const BUILDING_HUB_SERVICES = [
  {
    category: "🏙️ 신도시 전용",
    services: [
      {
        id: "newtown_permit",
        name: "전국 신도시 건축허가/착공 조회",
        description: "전국 신도시 및 택지개발지구 내 건축허가 및 착공 사업 조회",
        icon: Building2,
        endpoint: "getNewTownPermits",
        popular: true,
        isSpecial: true
      }
    ]
  },
  {
    category: "기본 정보",
    services: [
      {
        id: "dong_outline",
        name: "동별개요",
        description: "건축물의 동별 기본 정보",
        icon: Building2,
        endpoint: "getApDongOulnInfo",
        popular: true
      },
      {
        id: "floor_outline", 
        name: "층별개요",
        description: "건축물의 층별 상세 정보",
        icon: Layers,
        endpoint: "getApFlrOulnInfo",
        popular: true
      },
      {
        id: "unit_outline",
        name: "호별개요", 
        description: "각 호실별 상세 정보",
        icon: Home,
        endpoint: "getUnitOutline"
      }
    ]
  },
  {
    category: "시설 정보",
    services: [
      {
        id: "parking",
        name: "주차장",
        description: "주차장 설치 및 관리 정보",
        icon: Car,
        endpoint: "getParking",
        popular: true
      },
      {
        id: "attached_parking",
        name: "부설주차장",
        description: "부설주차장 상세 정보",
        icon: Car,
        endpoint: "getAttachedParking"
      },
      {
        id: "sewage_treatment",
        name: "오수정화시설",
        description: "오수정화시설 설치 정보",
        icon: TreePine,
        endpoint: "getSewageTreatment"
      },
      {
        id: "structure_facility",
        name: "공작물관리대장",
        description: "공작물 관리 정보",
        icon: Wrench,
        endpoint: "getStructureFacility"
      }
    ]
  },
  {
    category: "면적 정보",
    services: [
      {
        id: "exclusive_common_area",
        name: "전유공용면적",
        description: "전유면적 및 공용면적 정보",
        icon: FileText,
        endpoint: "getExclusiveCommonArea"
      },
      {
        id: "unit_exclusive_area",
        name: "호별전유공용면적",
        description: "호별 전유 및 공용면적",
        icon: FileText,
        endpoint: "getUnitExclusiveArea"
      }
    ]
  },
  {
    category: "위치 및 지역정보",
    services: [
      {
        id: "site_location",
        name: "대지위치",
        description: "건축물 대지의 위치 정보",
        icon: MapPin,
        endpoint: "getSiteLocation",
        popular: true
      },
      {
        id: "road_name_register",
        name: "도로명대장",
        description: "도로명 주소 관련 정보",
        icon: MapPin,
        endpoint: "getRoadNameRegister"
      },
      {
        id: "regional_district",
        name: "지역지구구역",
        description: "지역, 지구, 구역 지정 정보",
        icon: Shield,
        endpoint: "getRegionalDistrict"
      }
    ]
  },
  {
    category: "건축행위",
    services: [
      {
        id: "major_repair",
        name: "대수선",
        description: "대수선 관련 정보",
        icon: Wrench,
        endpoint: "getMajorRepair"
      },
      {
        id: "demolition_record",
        name: "철거멸실관리대장",
        description: "철거 및 멸실 관리 정보",
        icon: Building2,
        endpoint: "getDemolitionRecord"
      },
      {
        id: "temporary_building",
        name: "가설건축물",
        description: "가설건축물 관련 정보",
        icon: Building2,
        endpoint: "getTemporaryBuilding"
      }
    ]
  },
  {
    category: "주택 관련",
    services: [
      {
        id: "housing_type",
        name: "주택유형",
        description: "주택의 유형별 분류 정보",
        icon: Home,
        endpoint: "getHousingType"
      }
    ]
  }
]

export function BuildingPermitMenu({ onServiceSelect }: BuildingPermitMenuProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const handleServiceClick = (service: { endpoint: string; name: string }) => {
    onServiceSelect(service.endpoint, service.name)
  }

  const getPopularServices = () => {
    return BUILDING_HUB_SERVICES.flatMap(category => 
      category.services.filter(service => service.popular)
    )
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">건축인허가 정보 조회</h2>
        <p className="text-gray-600">
          국토교통부 건축HUB에서 제공하는 다양한 건축인허가 정보를 조회할 수 있습니다
        </p>
      </div>

      {/* 인기 서비스 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5 text-blue-600" />
            인기 조회 서비스
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {getPopularServices().map((service) => {
              const IconComponent = service.icon
              return (
                <Button
                  key={service.id}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-blue-50 hover:border-blue-300"
                  onClick={() => handleServiceClick(service)}
                >
                  <IconComponent className="w-6 h-6 text-blue-600" />
                  <div className="text-center">
                    <div className="font-medium text-sm">{service.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{service.description}</div>
                  </div>
                  <Badge variant="secondary" className="text-xs">인기</Badge>
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* 카테고리별 서비스 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">전체 서비스</h3>
        
        {BUILDING_HUB_SERVICES.map((category) => (
          <Card key={category.category}>
            <CardHeader 
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => setSelectedCategory(
                selectedCategory === category.category ? null : category.category
              )}
            >
              <CardTitle className="flex items-center justify-between">
                <span className="text-base">{category.category}</span>
                <Badge variant="outline">{category.services.length}개</Badge>
              </CardTitle>
            </CardHeader>
            
            {(selectedCategory === category.category || selectedCategory === null) && (
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {category.services.map((service) => {
                    const IconComponent = service.icon
                    return (
                      <Button
                        key={service.id}
                        variant="ghost"
                        className="h-auto p-4 flex flex-col items-start space-y-2 text-left hover:bg-blue-50"
                        onClick={() => handleServiceClick(service)}
                      >
                        <div className="flex items-center space-x-2 w-full">
                          <IconComponent className="w-5 h-5 text-blue-600 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">{service.name}</div>
                            {service.popular && (
                              <Badge variant="secondary" className="text-xs mt-1">인기</Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 w-full">{service.description}</div>
                      </Button>
                    )
                  })}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* 안내사항 */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <h4 className="font-medium text-blue-900">📋 이용 안내</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 실제 데이터 조회를 위해서는 공공데이터포털 API 키가 필요합니다</li>
              <li>• 각 서비스별로 조회 조건(지역코드, 건축물번호 등)이 다를 수 있습니다</li>
              <li>• 일부 서비스는 대용량 데이터로 인해 응답 시간이 길 수 있습니다</li>
              <li>• API 호출 한도: 개발계정 10,000회/일, 운영계정 별도 신청</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 