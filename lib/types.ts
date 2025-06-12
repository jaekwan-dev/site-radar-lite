// Phase 1: 건축HUB API 확장을 위한 타입 정의

// 확장된 건축허가 정보
export interface DetailedBuildingPermit {
  // 기본 정보
  mgmBldrgstPk: string              // 관리건축물대장PK
  platPlc: string                   // 대지위치
  sigunguCd: string                 // 시군구코드
  bjdongCd: string                  // 법정동코드
  platGbCd: string                  // 대지구분코드
  bun: string                       // 번
  ji: string                        // 지
  newPlatPlc?: string               // 새주소
  bldNm?: string                    // 건물명
  splotNm?: string                  // 특수지명
  
  // 건축물 기본정보
  mainPurpsCdNm: string             // 주용도명
  etcPurps?: string                 // 기타용도
  hhldCnt?: number                  // 세대수
  fmlyCnt?: number                  // 가구수
  heit?: number                     // 높이
  grndFlrCnt?: number               // 지상층수
  ugrndFlrCnt?: number              // 지하층수
  strctCdNm?: string                // 구조명
  totArea?: number                  // 연면적
  archArea?: number                 // 건축면적
  bcRat?: number                    // 건폐율
  totDongTotArea?: number           // 총동연면적
  vlRat?: number                    // 용적률
  vlRatEstmTotArea?: number         // 용적률산정연면적
  
  // 허가 관련 정보
  pmsDay?: string                   // 허가일
  stcnsDay?: string                 // 착공일
  useAprDay?: string                // 사용승인일
  pmsnoGbCdNm?: string              // 허가번호구분명
  pmsnoKikCdNm?: string             // 허가번호기관명
  pmsnoYear?: string                // 허가번호년
  pmsnoKikCd?: string               // 허가번호기관코드
  pmsno?: string                    // 허가번호
  
  // 추가 허가정보 (Phase 1 확장)
  permitConditions?: string[]        // 허가조건
  attachedDocuments?: string[]       // 첨부서류
  reviewPeriod?: number             // 심사기간(일)
  permitFee?: number                // 허가수수료
  
  // 공사정보 (Phase 1 확장)
  constructionCompany?: string      // 시공업체
  constructionLicense?: string      // 건설업 면허번호
  estimatedCost?: number           // 공사비
  scheduledCompletion?: string     // 예정 준공일
  
  // 감리정보 (Phase 1 확장)
  supervisionCompany?: string      // 감리업체
  chiefEngineer?: string          // 현장대리인
  
  // 메타데이터
  crtnDay?: string                  // 생성일
  lastUpdated?: string              // 최종 업데이트
}

// 시공업체 상세 정보
export interface ConstructionCompanyInfo {
  businessNumber: string           // 사업자등록번호
  companyName: string             // 회사명
  ceoName: string                 // 대표자명
  companyAddress: string          // 회사주소
  phoneNumber?: string            // 전화번호
  faxNumber?: string              // 팩스번호
  email?: string                  // 이메일
  website?: string                // 웹사이트
  
  // 면허 정보
  licenseInfo: {
    licenseNumber: string         // 면허번호
    licenseType: string          // 면허종류
    registrationDate: string     // 등록일
    expiryDate?: string          // 만료일
    licenseGrade: string         // 면허등급
  }
  
  // 등록 업종
  registeredTypes: string[]       // 등록업종
  
  // 최근 프로젝트
  recentProjects: Array<{
    projectName: string          // 공사명
    client: string              // 발주처
    contractAmount: number      // 계약금액
    startDate: string          // 착공일
    completionDate: string     // 준공일
    location: string           // 공사위치
  }>
  
  // 평가 정보
  evaluation?: {
    totalScore: number          // 종합점수
    technicalScore: number     // 기술점수
    managementScore: number    // 경영점수
    safetyRecord: string       // 안전실적
    lastEvaluationDate: string // 최종평가일
  }
}

// 대시보드 통계 정보
export interface DashboardStats {
  // 전체 현황
  totalProjects: number           // 전체 프로젝트 수
  activeProjects: number          // 진행중 프로젝트 수
  completedProjects: number       // 완료 프로젝트 수
  plannedProjects: number         // 계획 프로젝트 수
  
  // 단계별 현황
  stageStats: {
    permitPending: number         // 허가대기
    permitApproved: number        // 허가완료
    constructionStarted: number   // 착공
    underConstruction: number     // 시공중
    nearCompletion: number        // 준공임박
    completed: number             // 준공완료
  }
  
  // 지역별 현황
  regionStats: Array<{
    region: string               // 지역명
    projectCount: number         // 프로젝트 수
    totalHouseholds: number      // 총 세대수
    averageProgress: number      // 평균 진행률
  }>
  
  // 월별 트렌드
  monthlyTrend: Array<{
    month: string               // 월
    permits: number             // 허가건수
    constructions: number       // 착공건수
    completions: number         // 준공건수
  }>
  
  // 규모별 분석
  scaleAnalysis: {
    smallScale: number          // 소규모 (100세대 미만)
    mediumScale: number         // 중규모 (100-500세대)
    largeScale: number          // 대규모 (500세대 이상)
  }
}

// 프로젝트 진행 상태
export interface ProjectProgress {
  projectId: string             // 프로젝트 ID
  currentStage: 'permit_pending' | 'permit_approved' | 'construction_started' | 
                'under_construction' | 'near_completion' | 'completed'
  progressRate: number          // 진행률 (0-100)
  
  // 단계별 일정
  milestones: Array<{
    stage: string               // 단계명
    plannedDate: string         // 계획일
    actualDate?: string         // 실제일
    status: 'completed' | 'in_progress' | 'pending' | 'delayed'
    description?: string        // 설명
  }>
  
  // 지연 정보
  delays?: Array<{
    stage: string               // 지연 단계
    plannedDate: string         // 계획일
    expectedDate: string        // 예상일
    delayDays: number          // 지연일수
    reason: string             // 지연사유
  }>
}

// API 응답 타입
export interface ExtendedApiResponse<T> {
  success: boolean
  data: T[]
  totalCount: number
  message?: string
  metadata?: {
    lastUpdated: string
    dataSource: string
    isSimulation: boolean
  }
}

// 검색 필터
export interface SearchFilters {
  // 기본 필터
  region?: string               // 지역
  newTownType?: string          // 신도시 구분
  projectScale?: 'small' | 'medium' | 'large'  // 규모
  
  // 상태 필터
  projectStatus?: string[]      // 프로젝트 상태
  permitStatus?: string[]       // 허가 상태
  
  // 기간 필터
  permitDateFrom?: string       // 허가일 시작
  permitDateTo?: string         // 허가일 종료
  constructionDateFrom?: string // 착공일 시작
  constructionDateTo?: string   // 착공일 종료
  
  // 규모 필터
  householdsMin?: number        // 최소 세대수
  householdsMax?: number        // 최대 세대수
  areaMin?: number             // 최소 면적
  areaMax?: number             // 최대 면적
}

// 대시보드 카드 정보
export interface DashboardCard {
  id: string
  title: string
  value: number | string
  change?: {
    value: number
    type: 'increase' | 'decrease' | 'neutral'
    period: string
  }
  icon?: string
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple'
  description?: string
}

// 차트 데이터
export interface ChartData {
  labels: string[]
  datasets: Array<{
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string
    borderWidth?: number
  }>
} 