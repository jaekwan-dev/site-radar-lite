"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Search, 
  Download, 
  RefreshCw, 
  Building2,
  MapPin,
  AlertCircle,
  Filter,
  X
} from "lucide-react"
import { toast } from "sonner"

interface NewTownSearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface SearchResult {
  [key: string]: string | number
}

// 전국 신도시 및 택지개발지구 정보
const NEW_TOWN_DISTRICTS = {
  "1기 신도시": {
    "분당신도시": { sigunguCd: "41135", region: "경기도 성남시 분당구" },
    "일산신도시": { sigunguCd: "41285", region: "경기도 고양시 일산동구" },
    "평촌신도시": { sigunguCd: "41390", region: "경기도 안양시 동안구" },
    "산본신도시": { sigunguCd: "41410", region: "경기도 군포시" },
    "중동신도시": { sigunguCd: "41480", region: "경기도 부천시" }
  },
  "2기 신도시": {
    "판교신도시": { sigunguCd: "41135", region: "경기도 성남시 분당구" },
    "운정신도시": { sigunguCd: "41285", region: "경기도 파주시" },
    "동탄신도시": { sigunguCd: "41220", region: "경기도 화성시" },
    "광교신도시": { sigunguCd: "41131", region: "경기도 수원시 영통구" }
  },
  "3기 신도시": {
    "김포한강신도시": { sigunguCd: "41570", region: "경기도 김포시" },
    "하남교산신도시": { sigunguCd: "41450", region: "경기도 하남시" },
    "과천지구": { sigunguCd: "41390", region: "경기도 과천시" },
    "인천검단신도시": { sigunguCd: "28245", region: "인천광역시 서구" },
    "위례신도시": { sigunguCd: "41135", region: "경기도 성남시 수정구" },
    "광명시흥신도시": { sigunguCd: "41210", region: "경기도 광명시" }
  },
  "기타 택지개발지구": {
    "송도국제도시": { sigunguCd: "28185", region: "인천광역시 연수구" },
    "청라국제도시": { sigunguCd: "28245", region: "인천광역시 서구" },
    "영종하늘도시": { sigunguCd: "28140", region: "인천광역시 중구" },
    "세종시": { sigunguCd: "36110", region: "세종특별자치시" }
  }
}

// 건축허가 상태 코드
const PERMIT_STATUS = {
  "": "전체",
  "01": "허가",
  "02": "착공",
  "03": "사용승인",
  "04": "준공"
}

export function NewTownSearchDialog({ open, onOpenChange }: NewTownSearchDialogProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [selectedDistrict, setSelectedDistrict] = useState<string>("")
  const [permitStatus, setPermitStatus] = useState<string>("")
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [numOfRows, setNumOfRows] = useState<number>(100)
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)

  // 기본 날짜 설정 (최근 1년)
  useEffect(() => {
    const today = new Date()
    const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate())
    
    setEndDate(today.toISOString().split('T')[0])
    setStartDate(oneYearAgo.toISOString().split('T')[0])
  }, [])

  const handleSearch = async () => {
    if (!selectedDistrict) {
      toast.error("신도시/택지개발지구를 선택해주세요")
      return
    }

    setIsLoading(true)
    
    try {
      // .env.local에서 API 키 읽기
      const encodingKey = process.env.NEXT_PUBLIC_ENCODING_KEY
      
      if (!encodingKey) {
        toast.error("API 인증키가 설정되지 않았습니다")
        return
      }

      // 선택된 지구 정보 가져오기
      const districtInfo = Object.values(NEW_TOWN_DISTRICTS)
        .flatMap(category => Object.entries(category))
        .find(([name]) => name === selectedDistrict)?.[1]

      if (!districtInfo) {
        toast.error("선택된 지구 정보를 찾을 수 없습니다")
        return
      }

      // API 호출 URL 구성 (건축인허가 기본 정보 조회)
      const baseUrl = 'https://apis.data.go.kr/1613000/ArchPmsHubService'
      const endpoint = '/getApBasisOulnInfo'
      
      const params = new URLSearchParams({
        serviceKey: encodingKey,
        numOfRows: numOfRows.toString(),
        pageNo: '1',
        sigunguCd: districtInfo.sigunguCd,
        ...(permitStatus && { pmsGbCd: permitStatus }),
        ...(startDate && { startDate: startDate.replace(/-/g, '') }),
        ...(endDate && { endDate: endDate.replace(/-/g, '') })
      })

      const response = await fetch(`${baseUrl}${endpoint}?${params}`)
      const xmlText = await response.text()
      
      // XML 파싱
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml')
      
      // 에러 체크
      const resultCode = xmlDoc.querySelector('resultCode')?.textContent
      if (resultCode !== '00') {
        const resultMsg = xmlDoc.querySelector('resultMsg')?.textContent
        throw new Error(resultMsg || '알 수 없는 오류가 발생했습니다')
      }

      // 데이터 추출
      const items = xmlDoc.querySelectorAll('item')
      const parsedResults: SearchResult[] = []
      
      items.forEach(item => {
        const result: SearchResult = {}
        const children = item.children
        
        for (let i = 0; i < children.length; i++) {
          const child = children[i]
          result[child.tagName] = child.textContent || ''
        }
        
        // 추가 정보 보강
        result['신도시명'] = selectedDistrict
        result['지역'] = districtInfo.region
        
        parsedResults.push(result)
      })

      setResults(parsedResults)
      
      // 총 개수 추출
      const totalCountElement = xmlDoc.querySelector('totalCount')
      setTotalCount(parseInt(totalCountElement?.textContent || '0'))
      
      toast.success(`${selectedDistrict}에서 ${parsedResults.length}건의 건축허가/착공 사업을 조회했습니다`)
      
    } catch (error) {
      console.error('API 호출 오류:', error)
      toast.error(error instanceof Error ? error.message : '데이터 조회에 실패했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadCSV = () => {
    if (results.length === 0) {
      toast.error("다운로드할 데이터가 없습니다")
      return
    }

    const headers = Object.keys(results[0])
    const csvContent = [
      headers.join(','),
      ...results.map(row => 
        headers.map(header => `"${row[header] || ''}"`).join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `신도시_건축허가착공_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success("CSV 파일이 다운로드되었습니다")
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* 헤더 */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">전국 신도시 건축허가/착공 조회</h2>
              <p className="text-gray-600">전국 신도시 및 택지개발지구 내 건축허가 및 착공된 사업을 조회합니다</p>
            </div>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* 검색 조건 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-blue-600" />
                검색 조건
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* 신도시 분류 */}
                <div className="space-y-2">
                  <Label>신도시 분류</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="분류 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(NEW_TOWN_DISTRICTS).map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 신도시/지구 선택 */}
                <div className="space-y-2">
                  <Label>신도시/택지개발지구 *</Label>
                  <Select 
                    value={selectedDistrict} 
                    onValueChange={setSelectedDistrict}
                    disabled={!selectedCategory}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="지구 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedCategory && NEW_TOWN_DISTRICTS[selectedCategory as keyof typeof NEW_TOWN_DISTRICTS] && 
                        Object.keys(NEW_TOWN_DISTRICTS[selectedCategory as keyof typeof NEW_TOWN_DISTRICTS]).map((district) => (
                          <SelectItem key={district} value={district}>{district}</SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </div>

                {/* 허가 상태 */}
                <div className="space-y-2">
                  <Label>허가 상태</Label>
                  <Select value={permitStatus} onValueChange={setPermitStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="전체" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PERMIT_STATUS).map(([code, name]) => (
                        <SelectItem key={code} value={code}>{name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 조회 시작일 */}
                <div className="space-y-2">
                  <Label>조회 시작일</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                {/* 조회 종료일 */}
                <div className="space-y-2">
                  <Label>조회 종료일</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>

                {/* 조회 건수 */}
                <div className="space-y-2">
                  <Label>조회 건수</Label>
                  <Select 
                    value={numOfRows.toString()} 
                    onValueChange={(value) => setNumOfRows(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="50">50건</SelectItem>
                      <SelectItem value="100">100건</SelectItem>
                      <SelectItem value="500">500건</SelectItem>
                      <SelectItem value="1000">1000건</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4">
                <div className="text-sm text-gray-600">
                  * 필수 선택 항목
                </div>
                <Button onClick={handleSearch} disabled={isLoading || !selectedDistrict}>
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4 mr-2" />
                  )}
                  조회하기
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 조회 결과 */}
          {results.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-green-600" />
                    조회 결과
                    <Badge variant="outline">{totalCount.toLocaleString()}건</Badge>
                  </CardTitle>
                  <Button variant="outline" onClick={handleDownloadCSV}>
                    <Download className="w-4 h-4 mr-2" />
                    CSV 다운로드
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        {Object.keys(results[0]).map((key) => (
                          <th key={key} className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-900">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((result, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          {Object.values(result).map((value, cellIndex) => (
                            <td key={cellIndex} className="border border-gray-300 px-4 py-2 text-sm text-gray-700">
                              {value}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 신도시 정보 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(NEW_TOWN_DISTRICTS).map(([category, districts]) => (
              <Card key={category} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    {category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {Object.keys(districts).map((district) => (
                      <div key={district} className="text-sm text-gray-600">
                        • {district}
                      </div>
                    ))}
                  </div>
                  <Badge variant="outline" className="mt-2">
                    {Object.keys(districts).length}개 지구
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 안내사항 */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>조회 안내:</strong> 
              신도시 분류를 선택한 후 특정 지구를 선택하여 조회하세요.
              허가 상태별 필터링과 기간별 조회가 가능합니다.
              대용량 데이터 조회 시 시간이 소요될 수 있습니다.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  )
} 