"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  ArrowLeft, 
  Search, 
  Download, 
  RefreshCw, 
  Building2,
  AlertCircle
} from "lucide-react"
import { toast } from "sonner"

interface BuildingPermitSearchProps {
  serviceType: string
  serviceName: string
  onBack: () => void
}

interface SearchParams {
  sigunguCd?: string
  bjdongCd?: string
  platGbCd?: string
  bun?: string
  ji?: string
  startDate?: string
  endDate?: string
  numOfRows?: number
  pageNo?: number
}

interface SearchResult {
  [key: string]: string | number
}

// 시군구 코드 매핑 (주요 지역만)
const SIGUNGU_CODES = {
  "서울특별시": {
    "11110": "종로구",
    "11140": "중구", 
    "11170": "용산구",
    "11200": "성동구",
    "11215": "광진구",
    "11230": "동대문구",
    "11260": "중랑구",
    "11290": "성북구",
    "11305": "강북구",
    "11320": "도봉구",
    "11350": "노원구",
    "11380": "은평구",
    "11410": "서대문구",
    "11440": "마포구",
    "11470": "양천구",
    "11500": "강서구",
    "11530": "구로구",
    "11545": "금천구",
    "11560": "영등포구",
    "11590": "동작구",
    "11620": "관악구",
    "11650": "서초구",
    "11680": "강남구",
    "11710": "송파구",
    "11740": "강동구"
  },
  "경기도": {
    "41131": "수원시 장안구",
    "41133": "수원시 영통구", 
    "41135": "수원시 팔달구",
    "41137": "수원시 권선구",
    "41210": "성남시 수정구",
    "41220": "성남시 중원구",
    "41230": "성남시 분당구",
    "41281": "안양시 만안구",
    "41285": "안양시 동안구",
    "41360": "부천시",
    "41390": "과천시",
    "41410": "광명시",
    "41430": "평택시",
    "41450": "동두천시",
    "41480": "안산시",
    "41500": "고양시",
    "41550": "남양주시",
    "41570": "오산시",
    "41590": "시흥시"
  }
}

export function BuildingPermitSearch({ serviceType, serviceName, onBack }: BuildingPermitSearchProps) {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    numOfRows: 10,
    pageNo: 1
  })
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [selectedProvince, setSelectedProvince] = useState<string>("")

  const handleSearch = async () => {
    if (!searchParams.sigunguCd) {
      toast.error("시군구를 선택해주세요")
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

      // API 호출 URL 구성
      const baseUrl = 'https://apis.data.go.kr/1613000/ArchPmsHubService'
      const endpoint = `/${serviceType}`
      
      const params = new URLSearchParams({
        serviceKey: encodingKey,
        numOfRows: searchParams.numOfRows?.toString() || '10',
        pageNo: searchParams.pageNo?.toString() || '1',
        sigunguCd: searchParams.sigunguCd,
        ...(searchParams.bjdongCd && { bjdongCd: searchParams.bjdongCd }),
        ...(searchParams.platGbCd && { platGbCd: searchParams.platGbCd }),
        ...(searchParams.bun && { bun: searchParams.bun }),
        ...(searchParams.ji && { ji: searchParams.ji }),
        ...(searchParams.startDate && { startDate: searchParams.startDate }),
        ...(searchParams.endDate && { endDate: searchParams.endDate })
      })

      const response = await fetch(`${baseUrl}${endpoint}?${params}`)
      const xmlText = await response.text()
      
      // XML 파싱 (간단한 파싱)
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
        
        parsedResults.push(result)
      })

      setResults(parsedResults)
      
      // 총 개수 추출
      const totalCountElement = xmlDoc.querySelector('totalCount')
      setTotalCount(parseInt(totalCountElement?.textContent || '0'))
      
      toast.success(`${parsedResults.length}건의 데이터를 조회했습니다`)
      
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

    // CSV 생성
    const headers = Object.keys(results[0])
    const csvContent = [
      headers.join(','),
      ...results.map(row => 
        headers.map(header => `"${row[header] || ''}"`).join(',')
      )
    ].join('\n')

    // 파일 다운로드
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${serviceName}_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success("CSV 파일이 다운로드되었습니다")
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          뒤로가기
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{serviceName}</h2>
          <p className="text-gray-600">건축인허가 정보를 조회합니다</p>
        </div>
      </div>

      {/* 검색 조건 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5 text-blue-600" />
            검색 조건
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 시도 선택 */}
            <div className="space-y-2">
              <Label>시도</Label>
              <Select value={selectedProvince} onValueChange={setSelectedProvince}>
                <SelectTrigger>
                  <SelectValue placeholder="시도 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="서울특별시">서울특별시</SelectItem>
                  <SelectItem value="경기도">경기도</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 시군구 선택 */}
            <div className="space-y-2">
              <Label>시군구 *</Label>
              <Select 
                value={searchParams.sigunguCd} 
                onValueChange={(value) => setSearchParams(prev => ({ ...prev, sigunguCd: value }))}
                disabled={!selectedProvince}
              >
                <SelectTrigger>
                  <SelectValue placeholder="시군구 선택" />
                </SelectTrigger>
                <SelectContent>
                  {selectedProvince && SIGUNGU_CODES[selectedProvince as keyof typeof SIGUNGU_CODES] && 
                    Object.entries(SIGUNGU_CODES[selectedProvince as keyof typeof SIGUNGU_CODES]).map(([code, name]) => (
                      <SelectItem key={code} value={code}>{name}</SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>

            {/* 법정동코드 */}
            <div className="space-y-2">
              <Label>법정동코드</Label>
              <Input
                placeholder="법정동코드 입력"
                value={searchParams.bjdongCd || ''}
                onChange={(e) => setSearchParams(prev => ({ ...prev, bjdongCd: e.target.value }))}
              />
            </div>

            {/* 대지구분코드 */}
            <div className="space-y-2">
              <Label>대지구분코드</Label>
              <Select 
                value={searchParams.platGbCd} 
                onValueChange={(value) => setSearchParams(prev => ({ ...prev, platGbCd: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="대지구분 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">대지</SelectItem>
                  <SelectItem value="1">산</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 번 */}
            <div className="space-y-2">
              <Label>번</Label>
              <Input
                placeholder="번 입력"
                value={searchParams.bun || ''}
                onChange={(e) => setSearchParams(prev => ({ ...prev, bun: e.target.value }))}
              />
            </div>

            {/* 지 */}
            <div className="space-y-2">
              <Label>지</Label>
              <Input
                placeholder="지 입력"
                value={searchParams.ji || ''}
                onChange={(e) => setSearchParams(prev => ({ ...prev, ji: e.target.value }))}
              />
            </div>

            {/* 조회 시작일 */}
            <div className="space-y-2">
              <Label>조회 시작일</Label>
              <Input
                type="date"
                value={searchParams.startDate || ''}
                onChange={(e) => setSearchParams(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>

            {/* 조회 종료일 */}
            <div className="space-y-2">
              <Label>조회 종료일</Label>
              <Input
                type="date"
                value={searchParams.endDate || ''}
                onChange={(e) => setSearchParams(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>

            {/* 조회 건수 */}
            <div className="space-y-2">
              <Label>조회 건수</Label>
              <Select 
                value={searchParams.numOfRows?.toString()} 
                onValueChange={(value) => setSearchParams(prev => ({ ...prev, numOfRows: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10건</SelectItem>
                  <SelectItem value="50">50건</SelectItem>
                  <SelectItem value="100">100건</SelectItem>
                  <SelectItem value="1000">1000건</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4">
            <div className="text-sm text-gray-600">
              * 필수 입력 항목
            </div>
            <Button onClick={handleSearch} disabled={isLoading}>
              {isLoading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Search className="w-4 h-4 mr-2" />
              )}
              {isLoading ? '조회 중...' : '조회하기'}
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

      {/* 안내사항 */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>조회 안내:</strong> 시군구는 필수 선택 항목입니다. 
          더 정확한 결과를 위해 법정동코드, 번지 등 추가 조건을 입력해주세요.
          대용량 데이터 조회 시 응답 시간이 길어질 수 있습니다.
        </AlertDescription>
      </Alert>
    </div>
  )
} 