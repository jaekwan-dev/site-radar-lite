// 타입 정의
export interface NewTownProject {
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

// 공공데이터포털 API 클라이언트
export interface BuildingLicenseData {
  id: string
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
  buildingType: string
  totalFloor: number
  groundFloor: number
  undergroundFloor: number
  totalArea: number
  buildingArea: number
  floorArea: number
  parkingCount: number
  householdCount: number
  // 추가된 현장 담당자 정보
  siteManager?: SiteManagerInfo
  engineeringTeam?: EngineeringTeamInfo[]
}

// 현장책임자 정보
export interface SiteManagerInfo {
  name: string
  position: string
  phone: string
  email: string
  licenseNumber?: string // 건축사 면허번호
  company: string
  department?: string
}

// 공무팀 정보
export interface EngineeringTeamInfo {
  name: string
  position: string
  phone: string
  email: string
  department: string
  specialty: string // 전문분야 (구조, 설비, 전기 등)
  company: string
}

export interface ApiResponse<T> {
  success: boolean
  data: T[]
  totalCount: number
  message?: string
}

// API 상태 인터페이스
export interface ApiStatus {
  isConnected: boolean
  lastUpdate: Date | null
  totalRecords: number
  message?: string
}

// 공공데이터포털 API 클라이언트

class PublicDataAPI {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  // 건축인허가정보 조회
  async getBuildingLicenseData(params: {
    sigunguCd?: string // 시군구코드
    bjdongCd?: string // 법정동코드
    platGbCd?: string // 대지구분코드
    bun?: string // 번
    ji?: string // 지
    startDate?: string // 조회시작일 (YYYYMMDD)
    endDate?: string // 조회종료일 (YYYYMMDD)
    numOfRows?: number // 한 페이지 결과 수
    pageNo?: number // 페이지번호
  }): Promise<ApiResponse<BuildingLicenseData>> {
    try {
      const baseUrl = 'http://apis.data.go.kr/1613000/BldRgstHubService/getBrRecapTitleInfo'
      const queryParams = new URLSearchParams()
      queryParams.append('serviceKey', this.apiKey)
      queryParams.append('pageNo', (params.pageNo || 1).toString())
      queryParams.append('numOfRows', (params.numOfRows || 100).toString())
      queryParams.append('resultType', 'json')
      
      // 선택적 매개변수 추가
      if (params.sigunguCd) queryParams.append('sigunguCd', params.sigunguCd)
      if (params.bjdongCd) queryParams.append('bjdongCd', params.bjdongCd)
      if (params.platGbCd) queryParams.append('platGbCd', params.platGbCd)
      if (params.bun) queryParams.append('bun', params.bun)
      if (params.ji) queryParams.append('ji', params.ji)
      if (params.startDate) queryParams.append('startDate', params.startDate)
      if (params.endDate) queryParams.append('endDate', params.endDate)

      const response = await fetch(`${baseUrl}?${queryParams}`)
      
      if (!response.ok) {
        throw new Error(`API 호출 실패: ${response.status}`)
      }

      // 응답 텍스트를 먼저 확인
      const responseText = await response.text()
      
      // JSON 파싱 시도
      let data
      try {
        data = JSON.parse(responseText)
      } catch (jsonError) {
        // JSON 파싱 실패 시 XML인지 확인
        if (responseText.includes('<?xml') || responseText.includes('<OpenAPI_ServiceResponse>')) {
          console.log('XML 응답 감지, 파싱 시도:', responseText.substring(0, 200))
          
          // XML 오류 응답 확인
          if (responseText.includes('SERVICE_KEY_IS_NOT_REGISTERED_ERROR')) {
            throw new Error('API 키가 등록되지 않았습니다. 공공데이터포털에서 API 키를 발급받아 환경변수에 설정해주세요.')
          } else if (responseText.includes('SERVICE ERROR')) {
            throw new Error('API 서비스 오류가 발생했습니다.')
          } else if (responseText.includes('errMsg')) {
            // 기타 XML 오류 메시지 추출
            const errorMatch = responseText.match(/<errMsg>(.*?)<\/errMsg>/)
            const errorMsg = errorMatch ? errorMatch[1] : 'API 오류'
            throw new Error(`API 오류: ${errorMsg}`)
          }
          
          const xmlData = this.parseXMLResponse(responseText)
          // XML 파싱 결과를 JSON 형태로 변환
          data = {
            response: {
              header: { resultCode: '00' },
              body: {
                items: { item: xmlData.items },
                totalCount: xmlData.items.length
              }
            }
          }
        } else {
          console.error('응답 파싱 실패:', responseText.substring(0, 500))
          throw new Error(`응답 파싱 실패: ${jsonError}`)
        }
      }
      
      if (data.response?.header?.resultCode !== '00') {
        throw new Error(data.response?.header?.resultMsg || 'API 응답 오류')
      }

      const items = data.response?.body?.items?.item || []
      const totalCount = data.response?.body?.totalCount || 0

      return {
        success: true,
        data: this.transformBuildingData(Array.isArray(items) ? items : [items]),
        totalCount,
        message: `${totalCount}건의 데이터를 조회했습니다.`
      }
    } catch (error) {
      console.error('API 호출 오류:', error)
      
      // 오류 메시지 상세화
      let errorMessage = '시뮬레이션 데이터입니다.'
      if (error instanceof Error) {
        if (error.message.includes('JSON')) {
          errorMessage += ' (API 응답 형식 오류)'
        } else if (error.message.includes('fetch')) {
          errorMessage += ' (네트워크 연결 오류)'
        } else {
          errorMessage += ` (${error.message})`
        }
      }
      
      // 실제 API 호출 실패 시 목업 데이터 반환
      const mockData = this.generateMockData(params.numOfRows || 20)
      return {
        success: true,
        data: mockData,
        totalCount: mockData.length,
        message: errorMessage
      }
    }
  }

  // 택지개발지구 건축물 정보 조회
  async getNewTownBuildingData(params: {
    district?: string // 지구명
    sigunguCd?: string // 시군구코드
    numOfRows?: number
    pageNo?: number
  }): Promise<ApiResponse<BuildingLicenseData>> {
    try {
      // 실제 API 호출 로직
      const result = await this.getBuildingLicenseData({
        ...params,
        startDate: '20240101', // 2024년 이후 데이터
        endDate: '20251231'    // 2025년까지
      })

      // 신도시 관련 필터링
      if (params.district) {
        result.data = result.data.filter(item => 
          item.district.includes(params.district!) || 
          item.address.includes(params.district!)
        )
      }

      return result
    } catch (error) {
      console.error('신도시 데이터 조회 오류:', error)
      
      // 실패 시 목업 데이터 반환
      const mockData = this.generateMockData(params.numOfRows || 20)
      return {
        success: true,
        data: mockData,
        totalCount: mockData.length,
        message: '시뮬레이션 데이터입니다.'
      }
    }
  }

  // XML 응답 파싱
  private parseXMLResponse(xmlText: string): { items: Record<string, string>[] } {
    // 간단한 XML 파싱 (실제 구현에서는 xml2js 등 라이브러리 사용 권장)
    try {
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml')
      
      // XML을 JSON으로 변환하는 로직
      const items = xmlDoc.getElementsByTagName('item')
      const result = []
      
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        const obj: Record<string, string> = {}
        
        for (let j = 0; j < item.children.length; j++) {
          const child = item.children[j]
          obj[child.tagName] = child.textContent || ''
        }
        
        result.push(obj)
      }
      
      return { items: result }
    } catch (error) {
      console.error('XML 파싱 오류:', error)
      return { items: [] }
    }
  }

  // 건축 데이터 변환
  private transformBuildingData(rawData: Record<string, string>[]): BuildingLicenseData[] {
    return rawData.map((item, index) => ({
      id: `api-${Date.now()}-${index}`,
      district: item.sigunguNm || '정보없음',
      address: `${item.sigunguNm || ''} ${item.bjdongNm || ''} ${item.platPlc || ''}`.trim() || '주소 정보 없음',
      projectName: item.bldNm || `건축물 ${index + 1}`,
      contractor: item.bldNm ? `${item.bldNm} 시공사` : '시공사 정보 없음',
      permitDate: this.formatDate(new Date(item.pmsDay || Date.now())),
      startDate: this.formatDate(new Date(item.stcnsDay || Date.now())),
      completionDate: this.formatDate(new Date(item.useAprDay || Date.now() + 365 * 24 * 60 * 60 * 1000)),
      status: item.pmsDay ? '허가' : '계획',
      contact: '담당자 정보 없음',
      phone: '-',
      email: '-',
      buildingType: item.mainPurpsCdNm || '공동주택',
      totalFloor: parseInt(item.grndFlrCnt || '0') + parseInt(item.ugrndFlrCnt || '0'),
      groundFloor: parseInt(item.grndFlrCnt || '0'),
      undergroundFloor: parseInt(item.ugrndFlrCnt || '0'),
      totalArea: parseFloat(item.totArea || '0'),
      buildingArea: parseFloat(item.archArea || '0'),
      floorArea: parseFloat(item.totArea || '0'),
      parkingCount: parseInt(item.indrMechUtcnt || '0') + parseInt(item.indrAutoUtcnt || '0'),
      householdCount: parseInt(item.hhldCnt || '0')
    }))
  }

  // 목업 데이터 생성 (실제 API 연동 전 테스트용)
  private generateMockData(count: number): BuildingLicenseData[] {
    const districts = ['김포한강신도시', '하남교산신도시', '과천지구', '인천검단신도시', '위례신도시', '광명시흥신도시']
    const contractors = ['대우건설', '현대건설', '삼성물산', 'GS건설', '포스코건설', '롯데건설', '두산건설', '대림산업']
    const buildingTypes = ['공동주택', '업무시설', '상업시설', '복합시설', '교육시설']
    
    return Array.from({ length: count }, (_, index) => ({
      id: `api-real-${Date.now()}-${index}`,
      district: districts[Math.floor(Math.random() * districts.length)],
      address: `경기도 ${districts[Math.floor(Math.random() * districts.length)].slice(0, 2)} ${Math.floor(Math.random() * 999) + 1}번지`,
      projectName: `${districts[Math.floor(Math.random() * districts.length)]} ${index + 1}단지`,
      contractor: contractors[Math.floor(Math.random() * contractors.length)],
      permitDate: this.formatDate(new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)),
      startDate: this.formatDate(new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000)),
      completionDate: this.formatDate(new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000)),
      status: Math.random() > 0.3 ? '착공' : '허가',
      contact: `${['김', '이', '박', '최', '정', '한'][Math.floor(Math.random() * 6)]}${['현장', '소장', '팀장', '과장', '부장'][Math.floor(Math.random() * 5)]}`,
      phone: `010-${Math.floor(Math.random() * 9000 + 1000)}-${Math.floor(Math.random() * 9000 + 1000)}`,
      email: `contact${index}@${contractors[Math.floor(Math.random() * contractors.length)].replace('건설', '').toLowerCase()}.co.kr`,
      buildingType: buildingTypes[Math.floor(Math.random() * buildingTypes.length)],
      totalFloor: Math.floor(Math.random() * 30) + 5,
      groundFloor: Math.floor(Math.random() * 25) + 5,
      undergroundFloor: Math.floor(Math.random() * 5) + 1,
      totalArea: Math.floor(Math.random() * 50000) + 10000,
      buildingArea: Math.floor(Math.random() * 20000) + 5000,
      floorArea: Math.floor(Math.random() * 100000) + 20000,
      parkingCount: Math.floor(Math.random() * 500) + 100,
      householdCount: Math.floor(Math.random() * 1000) + 200
    }))
  }

  // KISCON 현장정보 조회
  async getKisconSiteInfo(_projectId: string): Promise<{
    success: boolean
    siteManager?: SiteManagerInfo
    engineeringTeam?: EngineeringTeamInfo[]
    message?: string
    isRealData: boolean
  }> {
    try {
      // 실제 KISCON API 연동 시도
      // 현재는 연동되지 않았으므로 빈 데이터 반환
      await new Promise(resolve => setTimeout(resolve, 500))
      
      return {
        success: true,
        isRealData: false,
        message: 'KISCON API 연동 대기 중입니다'
      }
      
    } catch (error) {
      return {
        success: false,
        isRealData: false,
        message: error instanceof Error ? error.message : 'KISCON 정보 조회 실패'
      }
    }
  }

  // 건축물대장 상세정보 조회
  async getBuildingRegistryDetail(_buildingId: string): Promise<{
    success: boolean
    contactInfo?: {
      architect?: SiteManagerInfo
      contractor?: SiteManagerInfo
    }
    message?: string
    isRealData: boolean
  }> {
    try {
      // 실제 건축물대장 API 연동 대기 중
      await new Promise(resolve => setTimeout(resolve, 300))

      return {
        success: true,
        isRealData: false,
        message: '건축물대장 API 연동 대기 중입니다'
      }
      
    } catch (error) {
      return {
        success: false,
        isRealData: false,
        message: error instanceof Error ? error.message : '건축물대장 조회 실패'
      }
    }
  }

  // 현장 게시 정보 조회 (현장 간판, 공사계획서 등)
  async getSiteNoticeInfo(_address: string): Promise<{
    success: boolean
    noticeInfo?: {
      siteManager?: SiteManagerInfo
      safetyManager?: SiteManagerInfo
      emergencyContacts?: Array<{
        name: string
        role: string
        phone: string
        email?: string
      }>
    }
    message?: string
    isRealData: boolean
  }> {
    try {
      // 실제 현장 게시 정보 API 연동 대기 중
      await new Promise(resolve => setTimeout(resolve, 400))

      return {
        success: true,
        isRealData: false,
        message: '현장 게시 정보 API 연동 대기 중입니다'
      }
      
    } catch (error) {
      return {
        success: false,
        isRealData: false,
        message: error instanceof Error ? error.message : '현장 게시 정보 조회 실패'
      }
    }
  }

  // 통합 현장 상세정보 조회
  async getComprehensiveSiteInfo(projectId: string, address: string): Promise<{
    success: boolean
    data?: {
      siteManager?: SiteManagerInfo
      engineeringTeam?: EngineeringTeamInfo[]
      architect?: SiteManagerInfo
      safetyManager?: SiteManagerInfo
      emergencyContacts?: Array<{
        name: string
        role: string
        phone: string
        email?: string
      }>
    }
    sources: string[]
    message?: string
    isRealData: boolean
  }> {
    try {
      // 여러 소스에서 병렬로 정보 수집
      const [kisconResult, registryResult, noticeResult] = await Promise.all([
        this.getKisconSiteInfo(projectId),
        this.getBuildingRegistryDetail(projectId),
        this.getSiteNoticeInfo(address)
      ])

      const sources: string[] = ['공공데이터포털']
      const data: Record<string, unknown> = {}
      let hasRealData = false

      // KISCON 정보 통합
      if (kisconResult.success && kisconResult.isRealData) {
        if (kisconResult.siteManager) data.siteManager = kisconResult.siteManager
        if (kisconResult.engineeringTeam) data.engineeringTeam = kisconResult.engineeringTeam
        sources.push('KISCON')
        hasRealData = true
      }

      // 건축물대장 정보 통합
      if (registryResult.success && registryResult.isRealData && registryResult.contactInfo) {
        if (registryResult.contactInfo.architect) data.architect = registryResult.contactInfo.architect
        if (registryResult.contactInfo.contractor && !data.siteManager) {
          data.siteManager = registryResult.contactInfo.contractor
        }
        sources.push('건축물대장')
        hasRealData = true
      }

      // 현장 게시 정보 통합
      if (noticeResult.success && noticeResult.isRealData && noticeResult.noticeInfo) {
        if (noticeResult.noticeInfo.siteManager && !data.siteManager) {
          data.siteManager = noticeResult.noticeInfo.siteManager
        }
        if (noticeResult.noticeInfo.safetyManager) data.safetyManager = noticeResult.noticeInfo.safetyManager
        if (noticeResult.noticeInfo.emergencyContacts) data.emergencyContacts = noticeResult.noticeInfo.emergencyContacts
        sources.push('현장게시정보')
        hasRealData = true
      }

      return {
        success: true,
        data: hasRealData ? data : undefined,
        sources,
        isRealData: hasRealData,
        message: hasRealData ? '실제 데이터를 조회했습니다' : '상세 담당자 정보는 현재 수집 중입니다'
      }
    } catch (error) {
      return {
        success: false,
        sources: ['공공데이터포털'],
        isRealData: false,
        message: error instanceof Error ? error.message : '상세 정보 조회 실패'
      }
    }
  }

  // API 상태 확인
  async getApiStatus(): Promise<ApiStatus> {
    try {
      const testResult = await this.getBuildingLicenseData({ numOfRows: 1 })
      
      return {
        isConnected: testResult.success,
        lastUpdate: new Date(),
        totalRecords: testResult.totalCount,
        message: testResult.message
      }
    } catch (error) {
      return {
        isConnected: false,
        lastUpdate: null,
        totalRecords: 0,
        message: error instanceof Error ? error.message : 'API 연결 실패'
      }
    }
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0]
  }
}

// API 클라이언트 인스턴스 생성 (동적 API 키 지원)
function getApiKey(): string {
  // 브라우저 환경에서는 localStorage에서 API 키 읽기
  if (typeof window !== 'undefined') {
    const savedApiKey = localStorage.getItem('PUBLIC_DATA_API_KEY')
    if (savedApiKey) {
      return savedApiKey
    }
  }
  
  // 서버 환경이거나 저장된 키가 없는 경우 환경변수 사용
  return process.env.NEXT_PUBLIC_DATA_API_KEY || 'test-key'
}

// API 클라이언트 인스턴스를 동적으로 생성
export let publicDataAPI = new PublicDataAPI(getApiKey())

// API 키 업데이트 함수
export function updateApiKey(newApiKey: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('PUBLIC_DATA_API_KEY', newApiKey)
  }
  // 새로운 API 키로 클라이언트 인스턴스 재생성
  publicDataAPI = new PublicDataAPI(newApiKey)
  // 확장 API 클라이언트도 업데이트
  const extendedAPI = new PublicDataAPIExtended(newApiKey)
  Object.assign(extendedPublicDataAPI, extendedAPI)
}

// 지역 코드 매핑
export const REGION_CODES = {
  '서울특별시': '11',
  '부산광역시': '26',
  '대구광역시': '27',
  '인천광역시': '28',
  '광주광역시': '29',
  '대전광역시': '30',
  '울산광역시': '31',
  '세종특별자치시': '36',
  '경기도': '41',
  '강원도': '42',
  '충청북도': '43',
  '충청남도': '44',
  '전라북도': '45',
  '전라남도': '46',
  '경상북도': '47',
  '경상남도': '48',
  '제주특별자치도': '50'
}

// 신도시/택지개발지구 코드 매핑
export const NEW_TOWN_CODES = {
  '김포한강신도시': '41570',
  '하남교산신도시': '41450',
  '과천지구': '41390',
  '인천검단신도시': '28245',
  '위례신도시': '41135',
  '광명시흥신도시': '41210'
}

// 편의 함수들
export async function fetchNewTownProjects(): Promise<NewTownProject[]> {
  try {
    const response = await publicDataAPI.getNewTownBuildingData({
      numOfRows: 50
    })
    
    if (response.success) {
      // BuildingLicenseData를 NewTownProject로 변환
      return response.data.map((item: BuildingLicenseData) => ({
        id: parseInt(item.id.replace(/\D/g, '') || '0'),
        district: item.district,
        address: item.address,
        projectName: item.projectName,
        contractor: item.contractor,
        permitDate: item.permitDate,
        startDate: item.startDate,
        completionDate: item.completionDate,
        status: item.status,
        contact: item.contact,
        phone: item.phone,
        email: item.email
      }))
    } else {
      throw new Error(response.message || 'API 호출 실패')
    }
  } catch (error) {
    console.error('신도시 프로젝트 조회 실패:', error)
    
    // 오류 상세 로깅
    if (error instanceof Error) {
      console.error('오류 상세:', {
        message: error.message,
        stack: error.stack?.substring(0, 500)
      })
      
      // API 키 오류인 경우 사용자에게 알림
      if (error.message.includes('API 키가 등록되지 않았습니다')) {
        console.warn('⚠️ 공공데이터포털 API 키가 설정되지 않았습니다. 시뮬레이션 데이터를 표시합니다.')
        console.warn('실제 데이터를 보려면 .env.local 파일에 NEXT_PUBLIC_DATA_API_KEY를 설정해주세요.')
      }
    }
    
    // 샘플 데이터 반환
    return [
      {
        id: 1,
        district: "김포한강신도시",
        address: "경기도 김포시 구래동 일원",
        projectName: "김포한강신도시 A-1블록 공동주택",
        contractor: "대우건설",
        permitDate: "2024-03-15",
        startDate: "2024-04-01",
        completionDate: "2025-06-30",
        status: "착공",
        contact: "김현장",
        phone: "010-1234-5678",
        email: "kim@daewoo.co.kr",
      },
      {
        id: 2,
        district: "하남교산신도시",
        address: "경기도 하남시 교산동 일원",
        projectName: "하남교산 B-2블록 아파트",
        contractor: "현대건설",
        permitDate: "2024-02-20",
        startDate: "2024-03-10",
        completionDate: "2025-03-30",
        status: "착공",
        contact: "박소장",
        phone: "010-2345-6789",
        email: "park@hyundai.co.kr",
      },
      {
        id: 3,
        district: "과천지구",
        address: "경기도 과천시 과천동 일원",
        projectName: "과천지구 C-3블록 주상복합",
        contractor: "삼성물산",
        permitDate: "2024-01-10",
        startDate: "2024-02-01",
        completionDate: "2025-11-30",
        status: "착공",
        contact: "이팀장",
        phone: "010-3456-7890",
        email: "lee@samsung.co.kr",
      },
      {
        id: 4,
        district: "인천검단신도시",
        address: "인천광역시 서구 검단동 일원",
        projectName: "검단신도시 D-1블록 오피스텔",
        contractor: "GS건설",
        permitDate: "2024-04-05",
        startDate: "",
        completionDate: "2026-06-30",
        status: "허가",
        contact: "최부장",
        phone: "010-4567-8901",
        email: "choi@gs.co.kr",
      },
      {
        id: 5,
        district: "위례신도시",
        address: "경기도 성남시 수정구 창곡동 일원",
        projectName: "위례신도시 E-2블록 아파트",
        contractor: "포스코건설",
        permitDate: "2024-03-25",
        startDate: "2024-04-15",
        completionDate: "2025-10-31",
        status: "착공",
        contact: "정과장",
        phone: "010-5678-9012",
        email: "jung@posco.co.kr",
      },
      {
        id: 6,
        district: "광명시흥신도시",
        address: "경기도 광명시 소하동 일원",
        projectName: "광명시흥 F-1블록 아파트",
        contractor: "롯데건설",
        permitDate: "2024-05-10",
        startDate: "2024-06-01",
        completionDate: "2025-12-31",
        status: "착공",
        contact: "한과장",
        phone: "010-6789-0123",
        email: "han@lotte.co.kr",
      }
    ]
  }
}

export async function fetchSiteDetails(projectId: string) {
  try {
    const result = await publicDataAPI.getComprehensiveSiteInfo(projectId, '')
    
    return {
      siteManager: result.data?.siteManager,
      engineeringTeam: result.data?.engineeringTeam,
      architect: result.data?.architect,
      safetyManager: result.data?.safetyManager,
      sources: result.sources,
      isRealData: result.isRealData,
      message: result.message
    }
  } catch (error) {
    console.error('상세 정보 조회 실패:', error)
    return {
      sources: ['공공데이터포털'],
      isRealData: false,
      message: '상세 정보 조회에 실패했습니다'
    }
  }
}

// KISCON API 관련 타입
export interface KisconCompanyInfo {
  businessNumber: string
  ceoName: string
  companyAddress: string
  registeredTypes: string[]
  licenseInfo: {
    licenseNumber: string
    registrationDate: string
    expiryDate: string
  }
  recentProjects: Array<{
    projectName: string
    client: string
    contractAmount: number
    completionDate: string
  }>
}

export interface KisconStatistics {
  monthlyData: Array<{
    month: string
    reportCount: number
    contractAmount: number
  }>
  typeAnalysis: Array<{
    type: string
    count: number
    percentage: number
  }>
}

// 생활안전지도 API 관련 타입
export interface SafetyMapInfo {
  hazardousFacilities: Array<{
    type: string
    name: string
    distance: number
    riskLevel: 'high' | 'medium' | 'low'
    coordinates: { lat: number; lng: number }
  }>
  emergencyFacilities: Array<{
    type: 'hospital' | 'fire_station' | 'police'
    name: string
    distance: number
    accessTime: number
    coordinates: { lat: number; lng: number }
  }>
  trafficInfo: {
    congestionLevel: 'high' | 'medium' | 'low'
    peakHours: string[]
    alternativeRoutes: string[]
  }
}

// 건설사업정보시스템 API 관련 타입
export interface ConstructionSystemInfo {
  designDocuments: Array<{
    type: string
    fileName: string
    fileSize: string
    uploadDate: string
    downloadUrl?: string
  }>
  supervisionReports: Array<{
    reportDate: string
    progressRate: number
    materialInspection: string
    qualityStatus: string
  }>
  maintenanceHistory: Array<{
    date: string
    type: string
    description: string
    cost: number
  }>
  facilityInspections: Array<{
    facility: string
    lastInspection: string
    nextInspection: string
    status: 'normal' | 'attention' | 'repair_needed'
  }>
}

// 지역별 건설현장 API 관련 타입
export interface RegionalConstructionInfo {
  progressInfo: {
    currentStage: string
    progressRate: number
    expectedCompletion: string
    milestones: Array<{
      stage: string
      plannedDate: string
      actualDate?: string
      status: 'completed' | 'in_progress' | 'pending'
    }>
  }
  environmentalData: {
    noise: { level: number; standard: number; status: 'normal' | 'warning' | 'violation' }
    vibration: { level: number; standard: number; status: 'normal' | 'warning' | 'violation' }
    dust: { level: number; standard: number; status: 'normal' | 'warning' | 'violation' }
    lastMeasured: string
  }
  trafficControl: {
    controlPlan: string
    affectedRoads: string[]
    alternativeRoutes: string[]
    controlPeriod: { start: string; end: string }
  }
}

// 통합 상세정보 타입
export interface ComprehensiveProjectInfo {
  kisconInfo?: KisconCompanyInfo
  kisconStats?: KisconStatistics
  safetyInfo?: SafetyMapInfo
  constructionSystemInfo?: ConstructionSystemInfo
  regionalInfo?: RegionalConstructionInfo
  dataSources: Array<{
    source: string
    status: 'success' | 'failed' | 'simulation'
    lastUpdated?: string
    message?: string
  }>
}

// PublicDataAPI 클래스에 새로운 메서드들 추가
class PublicDataAPIExtended extends PublicDataAPI {
  // KISCON 건설업체 상세정보 조회
  async getKisconCompanyDetail(businessNumber: string): Promise<{
    success: boolean
    data?: KisconCompanyInfo
    isSimulation: boolean
    message?: string
  }> {
    try {
      // 실제 KISCON API 호출 시도
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // 현재는 시뮬레이션 데이터 반환
      const simulationData: KisconCompanyInfo = {
        businessNumber: businessNumber,
        ceoName: '김건설',
        companyAddress: '서울특별시 강남구 테헤란로 123',
        registeredTypes: ['토목공사업', '건축공사업', '전기공사업'],
        licenseInfo: {
          licenseNumber: 'KISCON-2024-001',
          registrationDate: '2020-03-15',
          expiryDate: '2025-03-14'
        },
        recentProjects: [
          {
            projectName: '강남 아파트 신축공사',
            client: '서울시 강남구청',
            contractAmount: 15000000000,
            completionDate: '2024-06-30'
          },
          {
            projectName: '교량 보수공사',
            client: '한국도로공사',
            contractAmount: 8500000000,
            completionDate: '2024-03-20'
          },
          {
            projectName: '학교 증축공사',
            client: '서울시교육청',
            contractAmount: 5200000000,
            completionDate: '2023-12-15'
          }
        ]
      }

      return {
        success: true,
        data: simulationData,
        isSimulation: true,
        message: 'KISCON API 연동 대기 중 - 시뮬레이션 데이터'
      }
    } catch (error) {
      return {
        success: false,
        isSimulation: false,
        message: error instanceof Error ? error.message : 'KISCON 정보 조회 실패'
      }
    }
  }

  // KISCON 공사대장 통계 조회
  async getKisconStatistics(region?: string): Promise<{
    success: boolean
    data?: KisconStatistics
    isSimulation: boolean
    message?: string
  }> {
    try {
      await new Promise(resolve => setTimeout(resolve, 600))
      
      const simulationData: KisconStatistics = {
        monthlyData: [
          { month: '2024-01', reportCount: 245, contractAmount: 125000000000 },
          { month: '2024-02', reportCount: 198, contractAmount: 98000000000 },
          { month: '2024-03', reportCount: 312, contractAmount: 156000000000 },
          { month: '2024-04', reportCount: 287, contractAmount: 142000000000 },
          { month: '2024-05', reportCount: 334, contractAmount: 178000000000 },
          { month: '2024-06', reportCount: 298, contractAmount: 165000000000 }
        ],
        typeAnalysis: [
          { type: '토목공사', count: 456, percentage: 35.2 },
          { type: '건축공사', count: 389, percentage: 30.1 },
          { type: '전기공사', count: 234, percentage: 18.1 },
          { type: '기계설비공사', count: 156, percentage: 12.1 },
          { type: '기타', count: 58, percentage: 4.5 }
        ]
      }

      return {
        success: true,
        data: simulationData,
        isSimulation: true,
        message: `${region || '전국'} 지역 통계 - 시뮬레이션 데이터`
      }
    } catch (error) {
      return {
        success: false,
        isSimulation: false,
        message: error instanceof Error ? error.message : '통계 조회 실패'
      }
    }
  }

  // 생활안전지도 API 조회
  async getSafetyMapInfo(_address: string): Promise<{
    success: boolean
    data?: SafetyMapInfo
    isSimulation: boolean
    message?: string
  }> {
    try {
      await new Promise(resolve => setTimeout(resolve, 700))
      
      const simulationData: SafetyMapInfo = {
        hazardousFacilities: [
          {
            type: '고압가스배관',
            name: '도시가스 주배관',
            distance: 150,
            riskLevel: 'medium',
            coordinates: { lat: 37.5665, lng: 126.9780 }
          },
          {
            type: '고압전선',
            name: '송전선로 154kV',
            distance: 320,
            riskLevel: 'low',
            coordinates: { lat: 37.5675, lng: 126.9790 }
          }
        ],
        emergencyFacilities: [
          {
            type: 'hospital',
            name: '서울대학교병원',
            distance: 850,
            accessTime: 12,
            coordinates: { lat: 37.5796, lng: 126.9669 }
          },
          {
            type: 'fire_station',
            name: '종로소방서',
            distance: 650,
            accessTime: 8,
            coordinates: { lat: 37.5735, lng: 126.9788 }
          }
        ],
        trafficInfo: {
          congestionLevel: 'medium',
          peakHours: ['08:00-09:30', '18:00-19:30'],
          alternativeRoutes: ['우회도로 A', '지하차도 B']
        }
      }

      return {
        success: true,
        data: simulationData,
        isSimulation: true,
        message: '생활안전지도 API 연동 대기 중 - 시뮬레이션 데이터'
      }
    } catch (error) {
      return {
        success: false,
        isSimulation: false,
        message: error instanceof Error ? error.message : '안전정보 조회 실패'
      }
    }
  }

  // 건설사업정보시스템 API 조회
  async getConstructionSystemInfo(_projectId: string): Promise<{
    success: boolean
    data?: ConstructionSystemInfo
    isSimulation: boolean
    message?: string
  }> {
    try {
      await new Promise(resolve => setTimeout(resolve, 900))
      
      const simulationData: ConstructionSystemInfo = {
        designDocuments: [
          {
            type: '건축도면',
            fileName: '평면도_1층.dwg',
            fileSize: '2.3MB',
            uploadDate: '2024-02-15'
          },
          {
            type: '구조도면',
            fileName: '구조평면도.pdf',
            fileSize: '1.8MB',
            uploadDate: '2024-02-20'
          },
          {
            type: '설비도면',
            fileName: '전기설비도.dwg',
            fileSize: '3.1MB',
            uploadDate: '2024-02-25'
          }
        ],
        supervisionReports: [
          {
            reportDate: '2024-06-01',
            progressRate: 65,
            materialInspection: '적합',
            qualityStatus: '양호'
          },
          {
            reportDate: '2024-05-01',
            progressRate: 52,
            materialInspection: '적합',
            qualityStatus: '양호'
          }
        ],
        maintenanceHistory: [
          {
            date: '2024-05-15',
            type: '외벽 보수',
            description: '외벽 균열 보수작업',
            cost: 2500000
          },
          {
            date: '2024-03-20',
            type: '설비 점검',
            description: '엘리베이터 정기점검',
            cost: 800000
          }
        ],
        facilityInspections: [
          {
            facility: '엘리베이터',
            lastInspection: '2024-05-30',
            nextInspection: '2024-08-30',
            status: 'normal'
          },
          {
            facility: '소방시설',
            lastInspection: '2024-06-10',
            nextInspection: '2024-12-10',
            status: 'normal'
          }
        ]
      }

      return {
        success: true,
        data: simulationData,
        isSimulation: true,
        message: '건설사업정보시스템 API 연동 대기 중 - 시뮬레이션 데이터'
      }
    } catch (error) {
      return {
        success: false,
        isSimulation: false,
        message: error instanceof Error ? error.message : '건설정보 조회 실패'
      }
    }
  }

  // 지역별 건설현장 API 조회
  async getRegionalConstructionInfo(_address: string): Promise<{
    success: boolean
    data?: RegionalConstructionInfo
    isSimulation: boolean
    message?: string
  }> {
    try {
      await new Promise(resolve => setTimeout(resolve, 750))
      
      const simulationData: RegionalConstructionInfo = {
        progressInfo: {
          currentStage: '골조공사',
          progressRate: 68,
          expectedCompletion: '2025-03-30',
          milestones: [
            { stage: '착공', plannedDate: '2024-02-01', actualDate: '2024-02-01', status: 'completed' },
            { stage: '기초공사', plannedDate: '2024-03-15', actualDate: '2024-03-12', status: 'completed' },
            { stage: '골조공사', plannedDate: '2024-06-30', status: 'in_progress' },
            { stage: '마감공사', plannedDate: '2024-11-30', status: 'pending' },
            { stage: '준공', plannedDate: '2025-03-30', status: 'pending' }
          ]
        },
        environmentalData: {
          noise: { level: 62, standard: 65, status: 'normal' },
          vibration: { level: 58, standard: 60, status: 'normal' },
          dust: { level: 78, standard: 80, status: 'warning' },
          lastMeasured: '2024-06-12 14:30'
        },
        trafficControl: {
          controlPlan: '편도 1차로 통제',
          affectedRoads: ['메인도로 A', '진입로 B'],
          alternativeRoutes: ['우회도로 C', '이면도로 D'],
          controlPeriod: { start: '2024-06-01', end: '2024-08-31' }
        }
      }

      return {
        success: true,
        data: simulationData,
        isSimulation: true,
        message: '지역별 건설현장 API 연동 대기 중 - 시뮬레이션 데이터'
      }
    } catch (error) {
      return {
        success: false,
        isSimulation: false,
        message: error instanceof Error ? error.message : '지역정보 조회 실패'
      }
    }
  }

  // 통합 상세정보 조회
  async getComprehensiveProjectDetail(projectId: string, address: string, businessNumber?: string): Promise<{
    success: boolean
    data?: ComprehensiveProjectInfo
    message?: string
  }> {
    try {
      const [kisconInfo, kisconStats, safetyInfo, constructionInfo, regionalInfo] = await Promise.all([
        businessNumber ? this.getKisconCompanyDetail(businessNumber) : Promise.resolve(null),
        this.getKisconStatistics(),
        this.getSafetyMapInfo(address),
        this.getConstructionSystemInfo(projectId),
        this.getRegionalConstructionInfo(address)
      ])

      const dataSources = [
        {
          source: 'KISCON 건설업체정보',
          status: kisconInfo?.success ? (kisconInfo.isSimulation ? 'simulation' : 'success') : 'failed',
          lastUpdated: kisconInfo?.success ? new Date().toISOString() : undefined,
          message: kisconInfo?.message
        },
        {
          source: 'KISCON 공사대장통계',
          status: kisconStats.success ? (kisconStats.isSimulation ? 'simulation' : 'success') : 'failed',
          lastUpdated: kisconStats.success ? new Date().toISOString() : undefined,
          message: kisconStats.message
        },
        {
          source: '생활안전지도',
          status: safetyInfo.success ? (safetyInfo.isSimulation ? 'simulation' : 'success') : 'failed',
          lastUpdated: safetyInfo.success ? new Date().toISOString() : undefined,
          message: safetyInfo.message
        },
        {
          source: '건설사업정보시스템',
          status: constructionInfo.success ? (constructionInfo.isSimulation ? 'simulation' : 'success') : 'failed',
          lastUpdated: constructionInfo.success ? new Date().toISOString() : undefined,
          message: constructionInfo.message
        },
        {
          source: '지역별건설현장정보',
          status: regionalInfo.success ? (regionalInfo.isSimulation ? 'simulation' : 'success') : 'failed',
          lastUpdated: regionalInfo.success ? new Date().toISOString() : undefined,
          message: regionalInfo.message
        }
      ] as Array<{ source: string; status: 'success' | 'failed' | 'simulation'; lastUpdated?: string; message?: string }>

      return {
        success: true,
        data: {
          kisconInfo: kisconInfo?.data,
          kisconStats: kisconStats.data,
          safetyInfo: safetyInfo.data,
          constructionSystemInfo: constructionInfo.data,
          regionalInfo: regionalInfo.data,
          dataSources
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : '통합 정보 조회 실패'
      }
    }
  }
}

// 확장된 API 클라이언트 인스턴스 생성
export const extendedPublicDataAPI = new PublicDataAPIExtended(getApiKey())

// 기본 내보내기
export default PublicDataAPI 