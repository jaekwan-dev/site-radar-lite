// Phase 1: 확장된 API 서비스

import { 
  DetailedBuildingPermit, 
  ConstructionCompanyInfo, 
  DashboardStats, 
  ProjectProgress,
  ExtendedApiResponse,
  SearchFilters
} from './types'

export class ExtendedBuildingAPI {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  // 1. 건축HUB API 확장 - 상세 허가정보 조회
  async getDetailedBuildingPermits(params: {
    sigunguCd?: string
    bjdongCd?: string
    platGbCd?: string
    bun?: string
    ji?: string
    startDate?: string
    endDate?: string
    numOfRows?: number
    pageNo?: number
  }): Promise<ExtendedApiResponse<DetailedBuildingPermit>> {
    try {
      // 실제 API 호출 (현재는 시뮬레이션)
      const simulationData = this.generateDetailedPermitData(params.numOfRows || 50)
      
      return {
        success: true,
        data: simulationData,
        totalCount: simulationData.length,
        message: `${simulationData.length}건의 상세 허가정보를 조회했습니다.`,
        metadata: {
          lastUpdated: new Date().toISOString(),
          dataSource: 'simulation',
          isSimulation: true
        }
      }
    } catch (error) {
      console.error('상세 허가정보 조회 오류:', error)
      return {
        success: false,
        data: [],
        totalCount: 0,
        message: '상세 허가정보 조회에 실패했습니다.'
      }
    }
  }

  // 2. 시공업체 정보 연계
  async getConstructionCompanyInfo(businessNumber: string): Promise<{
    success: boolean
    data?: ConstructionCompanyInfo
    message?: string
    isSimulation: boolean
  }> {
    try {
      // 실제로는 건설업체 정보 API 호출
      const companyInfo = this.generateCompanyInfo(businessNumber)
      
      return {
        success: true,
        data: companyInfo,
        message: '시공업체 정보를 조회했습니다.',
        isSimulation: true
      }
    } catch (error) {
      console.error('시공업체 정보 조회 오류:', error)
      return {
        success: false,
        message: '시공업체 정보 조회에 실패했습니다.',
        isSimulation: true
      }
    }
  }

  // 3. 대시보드 통계 데이터 생성
  async getDashboardStats(filters?: SearchFilters): Promise<{
    success: boolean
    data?: DashboardStats
    message?: string
  }> {
    try {
      const stats = this.generateDashboardStats(filters)
      
      return {
        success: true,
        data: stats,
        message: '대시보드 통계를 생성했습니다.'
      }
    } catch (error) {
      console.error('대시보드 통계 생성 오류:', error)
      return {
        success: false,
        message: '대시보드 통계 생성에 실패했습니다.'
      }
    }
  }

  // 4. 프로젝트 진행 상태 조회
  async getProjectProgress(projectId: string): Promise<{
    success: boolean
    data?: ProjectProgress
    message?: string
  }> {
    try {
      const progress = this.generateProjectProgress(projectId)
      
      return {
        success: true,
        data: progress,
        message: '프로젝트 진행 상태를 조회했습니다.'
      }
    } catch (error) {
      console.error('프로젝트 진행 상태 조회 오류:', error)
      return {
        success: false,
        message: '프로젝트 진행 상태 조회에 실패했습니다.'
      }
    }
  }

  // 시뮬레이션 데이터 생성 메서드들

  private generateDetailedPermitData(count: number): DetailedBuildingPermit[] {
    const sampleData: DetailedBuildingPermit[] = []
    const companies = ['대우건설', '현대건설', '삼성물산', 'GS건설', '포스코건설', '롯데건설']
    const supervisionCompanies = ['삼성엔지니어링', '현대엔지니어링', '대우엔지니어링', 'SK건설']
    const regions = ['김포한강신도시', '하남교산신도시', '과천지구', '인천검단신도시', '위례신도시']

    for (let i = 0; i < count; i++) {
      const permitDate = new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
      const constructionDate = new Date(permitDate.getTime() + (Math.random() * 90 + 30) * 24 * 60 * 60 * 1000)
      const completionDate = new Date(constructionDate.getTime() + (Math.random() * 365 + 365) * 24 * 60 * 60 * 1000)

      sampleData.push({
        mgmBldrgstPk: `${11000 + i}-${100000 + i}`,
        platPlc: `${regions[i % regions.length]} ${100 + i}번지`,
        sigunguCd: `${41000 + (i % 10)}`,
        bjdongCd: `${41000 + (i % 10)}${String(i % 100).padStart(2, '0')}00`,
        platGbCd: "0",
        bun: String(100 + i),
        ji: String(i % 10),
        newPlatPlc: `${regions[i % regions.length]} 신도시로 ${100 + i}`,
        bldNm: `${regions[i % regions.length]} ${i + 1}단지`,
        splotNm: regions[i % regions.length],
        mainPurpsCdNm: "공동주택",
        etcPurps: "아파트",
        hhldCnt: Math.floor(Math.random() * 800) + 200,
        fmlyCnt: Math.floor(Math.random() * 800) + 200,
        heit: Math.floor(Math.random() * 50) + 30,
        grndFlrCnt: Math.floor(Math.random() * 20) + 10,
        ugrndFlrCnt: Math.floor(Math.random() * 3) + 2,
        strctCdNm: "철근콘크리트구조",
        totArea: Math.floor(Math.random() * 50000) + 20000,
        archArea: Math.floor(Math.random() * 5000) + 2000,
        bcRat: Math.floor(Math.random() * 30) + 15,
        vlRat: Math.floor(Math.random() * 200) + 150,
        pmsDay: permitDate.toISOString().split('T')[0].replace(/-/g, ''),
        stcnsDay: constructionDate.toISOString().split('T')[0].replace(/-/g, ''),
        useAprDay: completionDate.toISOString().split('T')[0].replace(/-/g, ''),
        pmsnoGbCdNm: "건축허가",
        pmsnoKikCdNm: `${regions[i % regions.length].split('신도시')[0]}시청`,
        pmsnoYear: permitDate.getFullYear().toString(),
        pmsno: `${permitDate.getFullYear()}-${String(i + 1).padStart(4, '0')}`,
        
        // Phase 1 확장 정보
        permitConditions: [
          "조경면적 30% 이상 확보",
          "주차장 세대당 1.5대 이상 확보",
          "어린이집 설치 의무"
        ],
        attachedDocuments: [
          "건축계획서",
          "구조계산서",
          "설비계획서",
          "조경계획서",
          "교통영향평가서"
        ],
        reviewPeriod: Math.floor(Math.random() * 30) + 15,
        permitFee: Math.floor(Math.random() * 5000000) + 1000000,
        constructionCompany: companies[i % companies.length],
        constructionLicense: `${String(i % 100).padStart(2, '0')}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
        estimatedCost: Math.floor(Math.random() * 50000000000) + 10000000000,
        scheduledCompletion: completionDate.toISOString().split('T')[0].replace(/-/g, ''),
        supervisionCompany: supervisionCompanies[i % supervisionCompanies.length],
        chiefEngineer: `김${String.fromCharCode(44032 + Math.floor(Math.random() * 11172))}${String.fromCharCode(44032 + Math.floor(Math.random() * 11172))}`,
        crtnDay: permitDate.toISOString().split('T')[0].replace(/-/g, ''),
        lastUpdated: new Date().toISOString()
      })
    }

    return sampleData
  }

  private generateCompanyInfo(businessNumber: string): ConstructionCompanyInfo {
    const companies = [
      { name: '대우건설', ceo: '정원주', grade: '특급' },
      { name: '현대건설', ceo: '윤영준', grade: '특급' },
      { name: '삼성물산', ceo: '오세철', grade: '특급' },
      { name: 'GS건설', ceo: '허윤홍', grade: '특급' },
      { name: '포스코건설', ceo: '김성우', grade: '특급' }
    ]
    
    const company = companies[Math.floor(Math.random() * companies.length)]
    
    return {
      businessNumber,
      companyName: company.name,
      ceoName: company.ceo,
      companyAddress: "서울특별시 강남구 테헤란로 123",
      phoneNumber: "02-1234-5678",
      email: `info@${company.name.toLowerCase()}.co.kr`,
      website: `https://www.${company.name.toLowerCase()}.co.kr`,
      
      licenseInfo: {
        licenseNumber: `서울-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
        licenseType: "종합건설업",
        registrationDate: "2020-01-01",
        licenseGrade: company.grade
      },
      
      registeredTypes: [
        "토목공사업",
        "건축공사업",
        "산업환경설비공사업",
        "조경공사업"
      ],
      
      recentProjects: [
        {
          projectName: "김포한강신도시 A1블록",
          client: "한국토지주택공사",
          contractAmount: 25000000000,
          startDate: "2023-03-01",
          completionDate: "2025-02-28",
          location: "경기도 김포시"
        },
        {
          projectName: "하남교산신도시 B2블록",
          client: "한국토지주택공사",
          contractAmount: 18000000000,
          startDate: "2023-06-01",
          completionDate: "2025-05-31",
          location: "경기도 하남시"
        }
      ],
      
      evaluation: {
        totalScore: Math.floor(Math.random() * 20) + 80,
        technicalScore: Math.floor(Math.random() * 20) + 80,
        managementScore: Math.floor(Math.random() * 20) + 80,
        safetyRecord: "우수",
        lastEvaluationDate: "2024-01-01"
      }
    }
  }

  private generateDashboardStats(_filters?: SearchFilters): DashboardStats {
    return {
      totalProjects: 156,
      activeProjects: 89,
      completedProjects: 45,
      plannedProjects: 22,
      
      stageStats: {
        permitPending: 12,
        permitApproved: 28,
        constructionStarted: 34,
        underConstruction: 45,
        nearCompletion: 15,
        completed: 22
      },
      
      regionStats: [
        { region: "김포한강신도시", projectCount: 25, totalHouseholds: 12500, averageProgress: 65 },
        { region: "하남교산신도시", projectCount: 22, totalHouseholds: 11000, averageProgress: 58 },
        { region: "과천지구", projectCount: 18, totalHouseholds: 9000, averageProgress: 72 },
        { region: "인천검단신도시", projectCount: 28, totalHouseholds: 14000, averageProgress: 45 },
        { region: "위례신도시", projectCount: 32, totalHouseholds: 16000, averageProgress: 78 },
        { region: "광명시흥신도시", projectCount: 31, totalHouseholds: 15500, averageProgress: 52 }
      ],
      
      monthlyTrend: [
        { month: "2024-01", permits: 8, constructions: 12, completions: 5 },
        { month: "2024-02", permits: 12, constructions: 8, completions: 7 },
        { month: "2024-03", permits: 15, constructions: 14, completions: 6 },
        { month: "2024-04", permits: 18, constructions: 16, completions: 9 },
        { month: "2024-05", permits: 22, constructions: 18, completions: 8 },
        { month: "2024-06", permits: 19, constructions: 21, completions: 12 },
        { month: "2024-07", permits: 25, constructions: 19, completions: 10 },
        { month: "2024-08", permits: 28, constructions: 24, completions: 14 },
        { month: "2024-09", permits: 24, constructions: 26, completions: 11 },
        { month: "2024-10", permits: 21, constructions: 23, completions: 13 },
        { month: "2024-11", permits: 18, constructions: 20, completions: 15 },
        { month: "2024-12", permits: 16, constructions: 18, completions: 12 }
      ],
      
      scaleAnalysis: {
        smallScale: 45,  // 100세대 미만
        mediumScale: 78, // 100-500세대
        largeScale: 33   // 500세대 이상
      }
    }
  }

  private generateProjectProgress(projectId: string): ProjectProgress {
    const stages = [
      'permit_pending', 'permit_approved', 'construction_started', 
      'under_construction', 'near_completion', 'completed'
    ] as const
    
    const currentStageIndex = Math.floor(Math.random() * stages.length)
    const currentStage = stages[currentStageIndex]
    
    return {
      projectId,
      currentStage,
      progressRate: Math.floor(Math.random() * 100),
      
      milestones: [
        {
          stage: "허가신청",
          plannedDate: "2024-01-15",
          actualDate: "2024-01-12",
          status: "completed",
          description: "건축허가 신청 완료"
        },
        {
          stage: "허가승인",
          plannedDate: "2024-02-15",
          actualDate: currentStageIndex >= 1 ? "2024-02-18" : undefined,
          status: currentStageIndex >= 1 ? "completed" : "in_progress",
          description: "건축허가 승인"
        },
        {
          stage: "착공신고",
          plannedDate: "2024-03-01",
          actualDate: currentStageIndex >= 2 ? "2024-03-05" : undefined,
          status: currentStageIndex >= 2 ? "completed" : "pending",
          description: "착공신고 완료"
        },
        {
          stage: "기초공사",
          plannedDate: "2024-04-01",
          actualDate: currentStageIndex >= 3 ? "2024-04-03" : undefined,
          status: currentStageIndex >= 3 ? "completed" : "pending",
          description: "기초공사 완료"
        },
        {
          stage: "골조공사",
          plannedDate: "2024-08-01",
          status: currentStageIndex >= 4 ? "completed" : currentStageIndex === 3 ? "in_progress" : "pending",
          description: "골조공사 진행"
        },
        {
          stage: "준공검사",
          plannedDate: "2025-02-01",
          status: currentStageIndex >= 5 ? "completed" : "pending",
          description: "준공검사 및 사용승인"
        }
      ],
      
      delays: currentStageIndex < 3 ? [] : [
        {
          stage: "허가승인",
          plannedDate: "2024-02-15",
          expectedDate: "2024-02-18",
          delayDays: 3,
          reason: "추가 서류 보완"
        }
      ]
    }
  }
}

// 싱글톤 인스턴스 생성 함수
let extendedApiInstance: ExtendedBuildingAPI | null = null

export function getExtendedAPI(): ExtendedBuildingAPI {
  if (!extendedApiInstance) {
    const apiKey = typeof window !== 'undefined' 
      ? localStorage.getItem('buildingApiKey') || ''
      : ''
    extendedApiInstance = new ExtendedBuildingAPI(apiKey)
  }
  return extendedApiInstance
}

export function updateExtendedAPIKey(newApiKey: string) {
  extendedApiInstance = new ExtendedBuildingAPI(newApiKey)
} 