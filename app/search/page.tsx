"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Search, 
  Download, 
  RefreshCw, 
  Key,
  Database,
  ArrowRight,
  BarChart3,
  Building
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

// Phase 1 컴포넌트 import
import { DashboardOverview } from "@/components/dashboard/DashboardOverview"
import { CompanyInfoDialog } from "@/components/dashboard/CompanyInfoDialog"

interface SearchResult {
  [key: string]: string | number
}

// interface SearchParams {
//   sigunguCd?: string
//   bjdongCd?: string
//   platGbCd?: string
//   bun?: string
//   ji?: string
//   startDate?: string
//   endDate?: string
//   numOfRows?: number
//   pageNo?: number
//   pmsGbCd?: string
// }

// 전국 시군구 및 법정동 기반 조회 시스템

// 서비스별 주요 표시 필드 정의 (테이블에 표시될 핵심 정보)
const SERVICE_MAIN_FIELDS = {
  "getApBasisOulnInfo": [
    { key: "bldNm", label: "건물명" },
    { key: "platPlc", label: "대지위치" },
    { key: "mainPurpsCdNm", label: "주용도" },
    { key: "hhldCnt", label: "세대수" },
    { key: "totArea", label: "연면적(㎡)" },
    { key: "grndFlrCnt", label: "지상층수" },
    { key: "pmsDay", label: "허가일" },
    { key: "stcnsDay", label: "착공일" }
  ],
  "getApDongOulnInfo": [
    { key: "dongNm", label: "동명" },
    { key: "platPlc", label: "대지위치" },
    { key: "dongPurpsCdNm", label: "동용도" },
    { key: "hhldCnt", label: "세대수" },
    { key: "totArea", label: "연면적(㎡)" },
    { key: "grndFlrCnt", label: "지상층수" },
    { key: "strctCdNm", label: "구조" }
  ],
  "getApFlrOulnInfo": [
    { key: "dongNm", label: "동명" },
    { key: "flrNoNm", label: "층번호" },
    { key: "mainPurpsCdNm", label: "주용도" },
    { key: "area", label: "면적(㎡)" },
    { key: "strctCdNm", label: "구조" }
  ],
  "getApHoOulnInfo": [
    { key: "dongNm", label: "동명" },
    { key: "hoNm", label: "호명" },
    { key: "flrNoNm", label: "층번호" },
    { key: "mainPurpsCdNm", label: "주용도" },
    { key: "area", label: "면적(㎡)" }
  ],
  "getApJijiguInfo": [
    { key: "platPlc", label: "대지위치" },
    { key: "jiyukGuyukCdNm", label: "지역지구구역명" },
    { key: "jiyukGuyukGbCdNm", label: "구분" },
    { key: "reprYn", label: "대표여부" }
  ],
  "getApPlatPlcInfo": [
    { key: "platPlc", label: "지번주소" },
    { key: "newPlatPlc", label: "도로명주소" },
    { key: "bldNm", label: "건물명" },
    { key: "zip", label: "우편번호" }
  ]
}

// 건축HUB API 서비스 목록 (신도시/택지개발지구 관련)
const BUILDING_HUB_SERVICES = [
  {
    id: "getApBasisOulnInfo",
    name: "건축인허가 기본개요",
    description: "건축인허가 기본 정보 조회",
    category: "기본정보",
    requiredParams: ["sigunguCd", "bjdongCd", "platGbCd", "bun", "ji"],
    optionalParams: ["startDate", "endDate", "pmsGbCd"]
  },
  {
    id: "getApDongOulnInfo",
    name: "동별개요",
    description: "동별 건축물 개요 정보",
    category: "기본정보", 
    requiredParams: ["sigunguCd", "bjdongCd", "platGbCd", "bun", "ji"],
    optionalParams: ["startDate", "endDate"]
  },
  {
    id: "getApFlrOulnInfo", 
    name: "층별개요",
    description: "층별 건축물 개요 정보",
    category: "기본정보",
    requiredParams: ["sigunguCd", "bjdongCd", "platGbCd", "bun", "ji"],
    optionalParams: ["startDate", "endDate"]
  },
  {
    id: "getApHoOulnInfo",
    name: "호별개요", 
    description: "호별 건축물 개요 정보",
    category: "기본정보",
    requiredParams: ["sigunguCd", "bjdongCd", "platGbCd", "bun", "ji"],
    optionalParams: ["startDate", "endDate"]
  },
  {
    id: "getApJijiguInfo",
    name: "지역지구구역 조회",
    description: "지역지구구역 정보 조회",
    category: "위치정보",
    requiredParams: ["sigunguCd", "bjdongCd", "platGbCd", "bun", "ji"],
    optionalParams: ["startDate", "endDate"]
  },
  {
    id: "getApPlatPlcInfo",
    name: "대지위치 조회",
    description: "대지위치 정보 조회",
    category: "위치정보",
    requiredParams: ["sigunguCd", "bjdongCd", "platGbCd", "bun", "ji"],
    optionalParams: ["startDate", "endDate"]
  }
]

// 시뮬레이션 데이터 생성 함수
const generateSimulationData = (serviceId: string, count: number = 15): SearchResult[] => {
  const data: SearchResult[] = []
  const companies = ['대우건설', '현대건설', '삼성물산', 'GS건설', '포스코건설', '롯데건설', 'SK건설', '한화건설']
  const regions = ['김포한강신도시', '하남교산신도시', '과천지구', '인천검단신도시', '위례신도시', '광명시흥신도시']
  
  for (let i = 0; i < count; i++) {
    const baseData = {
      "mgmBldrgstPk": `${11000 + i}-${100000 + i}`,
      "platPlc": `${regions[i % regions.length]} ${100 + i}번지`,
      "sigunguCd": `${41000 + (i % 10)}`,
      "bjdongCd": `${41000 + (i % 10)}${String(i % 100).padStart(2, '0')}00`,
      "platGbCd": "0",
      "bun": String(100 + i),
      "ji": String(i % 10),
      "newPlatPlc": `${regions[i % regions.length]} 신도시로 ${100 + i}`,
      "constructionCompany": companies[i % companies.length],
      "constructionLicense": `${String(i % 100).padStart(2, '0')}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`
    }

    switch (serviceId) {
      case "getApBasisOulnInfo":
        data.push({
          ...baseData,
          "bldNm": `${regions[i % regions.length]} ${i + 1}단지`,
          "splotNm": regions[i % regions.length],
          "mainPurpsCdNm": "공동주택",
          "etcPurps": "아파트",
          "hhldCnt": String(Math.floor(Math.random() * 800) + 200),
          "heit": String(Math.floor(Math.random() * 50) + 30),
          "grndFlrCnt": String(Math.floor(Math.random() * 20) + 10),
          "ugrndFlrCnt": String(Math.floor(Math.random() * 3) + 2),
          "pmsDay": `2024${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
          "stcnsDay": `2024${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
          "useAprDay": `2025${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
          "pmsnoGbCdNm": "건축허가",
          "crtnDay": `2024${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
          "totArea": String(Math.floor(Math.random() * 50000) + 20000),
          "archArea": String(Math.floor(Math.random() * 5000) + 2000),
          "platArea": String(Math.floor(Math.random() * 8000) + 3000)
        })
        break
      
      case "getApDongOulnInfo":
        data.push({
          ...baseData,
          "dongNm": `${Math.floor(i / 4) + 1}0${(i % 4) + 1}동`,
          "mainAtchGbCdNm": "주건축물",
          "dongPurpsCdNm": "공동주택",
          "etcPurps": "아파트",
          "heit": String(Math.floor(Math.random() * 50) + 30),
          "grndFlrCnt": String(Math.floor(Math.random() * 20) + 10),
          "ugrndFlrCnt": String(Math.floor(Math.random() * 3) + 2),
          "strctCdNm": "철근콘크리트구조",
          "totArea": String(Math.floor(Math.random() * 10000) + 5000),
          "hhldCnt": String(Math.floor(Math.random() * 200) + 50),
          "fmlyCnt": String(Math.floor(Math.random() * 200) + 50)
        })
        break
      
      case "getApFlrOulnInfo":
        data.push({
          ...baseData,
          "dongNm": `${Math.floor(i / 15) + 1}0${Math.floor((i % 15) / 3) + 1}동`,
          "flrNo": String((i % 15) + 1),
          "flrNoNm": `${(i % 15) + 1}층`,
          "mainAtchGbCdNm": "주건축물",
          "strctCdNm": "철근콘크리트구조",
          "mainPurpsCdNm": "공동주택",
          "etcPurps": "아파트",
          "area": String(Math.floor(Math.random() * 500) + 300),
          "areaExctYn": "Y"
        })
        break
      
      case "getApHoOulnInfo":
        data.push({
          ...baseData,
          "dongNm": `${Math.floor(i / 20) + 1}0${Math.floor((i % 20) / 4) + 1}동`,
          "flrNo": String(Math.floor((i % 20) / 4) + 1),
          "flrNoNm": `${Math.floor((i % 20) / 4) + 1}층`,
          "hoNm": `${String(Math.floor((i % 20) / 4) + 1).padStart(2, '0')}0${(i % 4) + 1}호`,
          "mainAtchGbCdNm": "주건축물",
          "mainPurpsCdNm": "공동주택",
          "etcPurps": "아파트",
          "area": String(Math.floor(Math.random() * 100) + 60),
          "areaExctYn": "Y"
        })
        break
      
      case "getApJijiguInfo":
        const zones = ["준주거지역", "일반상업지역", "근린상업지역", "준공업지역"]
        data.push({
          ...baseData,
          "jiyukGuyukCd": `UQ${String.fromCharCode(65 + (i % 4))}`,
          "jiyukGuyukCdNm": zones[i % zones.length],
          "jiyukGuyukGbCdNm": "용도지역",
          "reprYn": i % 3 === 0 ? "Y" : "N"
        })
        break
      
      case "getApPlatPlcInfo":
        data.push({
          ...baseData,
          "dongNm": `${regions[i % regions.length].replace('신도시', '').replace('지구', '')}동`,
          "jibun": `${100 + i}-${i % 10}`,
          "roadNm": `${regions[i % regions.length].replace('신도시', '').replace('지구', '')}로`,
          "buldMnnm": String(100 + i),
          "buldSlno": String(i % 10)
        })
        break
      
      default:
        data.push(baseData)
    }
  }
  
  return data
}

// 시뮬레이션 데이터는 generateSimulationData 함수로 동적 생성

// 필드명 한글 매핑
const FIELD_MAPPINGS: { [key: string]: string } = {
  // 공통 필드
  "mgmBldrgstPk": "관리건축물대장PK",
  "platPlc": "대지위치",
  "sigunguCd": "시군구코드",
  "bjdongCd": "법정동코드",
  "platGbCd": "대지구분코드",
  "bun": "번지",
  "ji": "지번",
  "newPlatPlc": "도로명대지위치",
  "dongNm": "동명칭",
  "신도시명": "신도시명",
  "constructionCompany": "시공업체",
  "constructionLicense": "건설업면허번호",
  
  // 기본개요 필드
  "bldNm": "건물명",
  "splotNm": "특수지명",
  "block": "블록",
  "lot": "로트",
  "bylotCnt": "외필지수",
  "naRoadCd": "새주소도로코드",
  "naPlatPlc": "새주소대지위치",
  "mainAtchGbCd": "주부속구분코드",
  "mainAtchGbCdNm": "주부속구분",
  "platArea": "대지면적(㎡)",
  "archArea": "건축면적(㎡)",
  "bcRat": "건폐율(%)",
  "totArea": "연면적(㎡)",
  "vlRatEstmTotArea": "용적률산정연면적(㎡)",
  "vlRat": "용적률(%)",
  "mainPurpsCd": "주용도코드",
  "mainPurpsCdNm": "주용도",
  "etcPurps": "기타용도",
  "hhldCnt": "세대수",
  "fmlyCnt": "가구수",
  "heit": "높이(m)",
  "grndFlrCnt": "지상층수",
  "ugrndFlrCnt": "지하층수",
  "rideUseElvtCnt": "승용승강기수",
  "emgenUseElvtCnt": "비상용승강기수",
  "atchBldCnt": "부속건축물수",
  "atchBldArea": "부속건축물면적(㎡)",
  "totDongTotArea": "총동연면적(㎡)",
  "indrMechUtcnt": "옥내기계식대수",
  "indrMechArea": "옥내기계식면적(㎡)",
  "oudrMechUtcnt": "옥외기계식대수",
  "oudrMechArea": "옥외기계식면적(㎡)",
  "pmsDay": "허가일",
  "stcnsDay": "착공일",
  "useAprDay": "사용승인일",
  "pmsnoYear": "허가번호년",
  "pmsnoKikCd": "허가번호기관코드",
  "pmsnoKikCdNm": "허가번호기관명",
  "pmsnoGbCd": "허가번호구분코드",
  "pmsnoGbCdNm": "허가구분",
  "ho": "호수",
  "engrGrade": "에너지효율등급",
  "engrRat": "에너지절약계획서점수",
  "crtnDay": "생성일",
  
  // 동별개요 필드
  "dongPurpsCd": "동용도코드",
  "dongPurpsCdNm": "동용도",
  "strctCd": "구조코드",
  "strctCdNm": "구조",
  "etcStrct": "기타구조",
  "mainBldCnt": "주건축물수",
  
  // 층별개요 필드
  "flrNo": "층번호",
  "flrNoNm": "층명칭",
  "area": "면적(㎡)",
  "areaExctYn": "면적제외여부",
  
  // 호별개요 필드
  "hoNm": "호명칭",
  
  // 지역지구구역 필드
  "jiyukGuyukCd": "지역지구구역코드",
  "jiyukGuyukCdNm": "지역지구구역명",
  "jiyukGuyukGbCd": "지역지구구역구분코드",
  "jiyukGuyukGbCdNm": "지역지구구역구분",
  "reprYn": "대표여부",
  "etcJiyukGuyukNm": "기타지역지구구역명",
  
  // 대지위치 필드
  "jibun": "지번",
  "roadNm": "도로명",
  "buldMnnm": "건물본번",
  "buldSlno": "건물부번"
}

// 전국 시군구 데이터 (행정표준코드 기준)
const SIGUNGU_DATA = {
  "서울특별시": {
    "11110": "종로구", "11140": "중구", "11170": "용산구", "11200": "성동구", "11215": "광진구",
    "11230": "동대문구", "11260": "중랑구", "11290": "성북구", "11305": "강북구", "11320": "도봉구",
    "11350": "노원구", "11380": "은평구", "11410": "서대문구", "11440": "마포구", "11470": "양천구",
    "11500": "강서구", "11530": "구로구", "11545": "금천구", "11560": "영등포구", "11590": "동작구",
    "11620": "관악구", "11650": "서초구", "11680": "강남구", "11710": "송파구", "11740": "강동구"
  },
  "부산광역시": {
    "26110": "중구", "26140": "서구", "26170": "동구", "26200": "영도구", "26230": "부산진구",
    "26260": "동래구", "26290": "남구", "26320": "북구", "26350": "해운대구", "26380": "사하구",
    "26410": "금정구", "26440": "강서구", "26470": "연제구", "26500": "수영구", "26530": "사상구",
    "26710": "기장군"
  },
  "대구광역시": {
    "27110": "중구", "27140": "동구", "27170": "서구", "27200": "남구", "27230": "북구",
    "27260": "수성구", "27290": "달서구", "27710": "달성군"
  },
  "인천광역시": {
    "28110": "중구", "28140": "동구", "28177": "미추홀구", "28185": "연수구", "28200": "남동구",
    "28237": "부평구", "28245": "계양구", "28260": "서구", "28710": "강화군", "28720": "옹진군"
  },
  "광주광역시": {
    "29110": "동구", "29140": "서구", "29155": "남구", "29170": "북구", "29200": "광산구"
  },
  "대전광역시": {
    "30110": "동구", "30140": "중구", "30170": "서구", "30200": "유성구", "30230": "대덕구"
  },
  "울산광역시": {
    "31110": "중구", "31140": "남구", "31170": "동구", "31200": "북구", "31710": "울주군"
  },
  "세종특별자치시": {
    "36110": "세종시"
  },
  "경기도": {
    "41111": "수원시 장안구", "41113": "수원시 권선구", "41115": "수원시 팔달구", "41117": "수원시 영통구",
    "41131": "성남시 수정구", "41133": "성남시 중원구", "41135": "성남시 분당구",
    "41150": "의정부시", "41171": "안양시 만안구", "41173": "안양시 동안구", "41190": "부천시",
    "41210": "광명시", "41220": "평택시", "41250": "동두천시", "41270": "안산시", "41280": "고양시",
    "41290": "과천시", "41310": "구리시", "41360": "남양주시", "41370": "오산시", "41390": "시흥시",
    "41410": "군포시", "41430": "의왕시", "41450": "하남시", "41460": "용인시", "41480": "파주시",
    "41500": "이천시", "41550": "안성시", "41570": "김포시", "41590": "화성시", "41610": "광주시",
    "41630": "양주시", "41650": "포천시", "41670": "여주시", "41800": "연천군", "41820": "가평군", "41830": "양평군"
  },
  "강원특별자치도": {
    "51110": "춘천시", "51130": "원주시", "51150": "강릉시", "51170": "동해시", "51190": "태백시",
    "51210": "속초시", "51230": "삼척시", "51720": "홍천군", "51730": "횡성군", "51750": "영월군",
    "51760": "평창군", "51770": "정선군", "51780": "철원군", "51790": "화천군", "51800": "양구군",
    "51810": "인제군", "51820": "고성군", "51830": "양양군"
  },
  "충청북도": {
    "43111": "청주시 상당구", "43112": "청주시 서원구", "43113": "청주시 흥덕구", "43114": "청주시 청원구",
    "43130": "충주시", "43150": "제천시", "43720": "보은군", "43730": "옥천군", "43740": "영동군",
    "43745": "증평군", "43750": "진천군", "43760": "괴산군", "43770": "음성군", "43800": "단양군"
  },
  "충청남도": {
    "44131": "천안시 동남구", "44133": "천안시 서북구", "44150": "공주시", "44180": "보령시",
    "44200": "아산시", "44210": "서산시", "44230": "논산시", "44250": "계룡시", "44270": "당진시",
    "44710": "금산군", "44760": "부여군", "44770": "서천군", "44790": "청양군", "44800": "홍성군",
    "44810": "예산군", "44825": "태안군"
  },
  "전북특별자치도": {
    "52111": "전주시 완산구", "52113": "전주시 덕진구", "52130": "군산시", "52140": "익산시",
    "52180": "정읍시", "52190": "남원시", "52210": "김제시", "52710": "완주군", "52720": "진안군",
    "52730": "무주군", "52740": "장수군", "52750": "임실군", "52770": "순창군", "52790": "고창군", "52800": "부안군"
  },
  "전라남도": {
    "46110": "목포시", "46130": "여수시", "46150": "순천시", "46170": "나주시", "46230": "광양시",
    "46710": "담양군", "46720": "곡성군", "46730": "구례군", "46770": "고흥군", "46780": "보성군",
    "46790": "화순군", "46800": "장흥군", "46810": "강진군", "46820": "해남군", "46830": "영암군",
    "46840": "무안군", "46860": "함평군", "46870": "영광군", "46880": "장성군", "46890": "완도군",
    "46900": "진도군", "46910": "신안군"
  },
  "경상북도": {
    "47111": "포항시 남구", "47113": "포항시 북구", "47130": "경주시", "47150": "김천시",
    "47170": "안동시", "47190": "구미시", "47210": "영주시", "47230": "영천시", "47250": "상주시",
    "47280": "문경시", "47290": "경산시", "47720": "군위군", "47730": "의성군", "47750": "청송군",
    "47760": "영양군", "47770": "영덕군", "47820": "청도군", "47830": "고령군", "47840": "성주군",
    "47850": "칠곡군", "47900": "예천군", "47920": "봉화군", "47930": "울진군", "47940": "울릉군"
  },
  "경상남도": {
    "48121": "창원시 의창구", "48123": "창원시 성산구", "48125": "창원시 마산합포구", 
    "48127": "창원시 마산회원구", "48129": "창원시 진해구", "48170": "진주시", "48220": "통영시",
    "48240": "사천시", "48250": "김해시", "48270": "밀양시", "48310": "거제시", "48330": "양산시",
    "48720": "의령군", "48730": "함안군", "48740": "창녕군", "48820": "고성군", "48840": "남해군", "48850": "하동군",
    "48860": "산청군", "48870": "함양군", "48880": "거창군", "48890": "합천군"
  },
  "제주특별자치도": {
    "50110": "제주시", "50130": "서귀포시"
  }
}

// 주요 법정동 데이터 (시군구별 대표 법정동)
const BJDONG_DATA: { [key: string]: { [key: string]: string } } = {
  // 서울특별시 종로구
  "11110": {
    "10100": "청운효자동", "10200": "사직동", "10300": "삼청동", "10400": "부암동", "10500": "평창동",
    "10600": "무악동", "10700": "교남동", "10800": "가회동", "10900": "종로1.2.3.4가동", "11000": "종로5.6가동"
  },
  // 서울특별시 강남구
  "11680": {
    "10100": "신사동", "10200": "논현동", "10300": "압구정동", "10400": "청담동", "10500": "삼성동",
    "10600": "대치동", "10700": "역삼동", "10800": "도곡동", "10900": "개포동", "11000": "일원동"
  },
  // 경기도 수원시 영통구
  "41117": {
    "10100": "매탄동", "10200": "원천동", "10300": "영통동", "10400": "하동", "10500": "광교동"
  },
  // 경기도 성남시 분당구
  "41135": {
    "10100": "분당동", "10200": "수내동", "10300": "정자동", "10400": "구미동", "10500": "백현동",
    "10600": "운중동", "10700": "판교동", "10800": "삼평동"
  },
  // 경기도 고양시 (일산동구)
  "41285": {
    "10100": "식사동", "10200": "정발산동", "10300": "장항동", "10400": "마두동", "10500": "백석동",
    "10600": "대화동", "10700": "킨텍스동"
  },
  // 경기도 김포시
  "41570": {
    "10100": "김포1동", "10200": "김포2동", "10300": "사우동", "10400": "풍무동", "10500": "고촌읍",
    "10600": "양촌읍", "10700": "대곶면", "10800": "월곶면", "10900": "하성면", "11000": "통진읍"
  },
  // 경기도 하남시
  "41450": {
    "10100": "신장1동", "10200": "신장2동", "10300": "풍산동", "10400": "교산동", "10500": "춘궁동",
    "10600": "덕풍1동", "10700": "덕풍2동", "10800": "덕풍3동", "10900": "위례동", "25900": "감일동"
  },
  // 경기도 과천시
  "41290": {
    "10100": "갈현동", "10200": "별양동", "10300": "부림동", "10400": "과천동", "10500": "막계동"
  },
  // 경기도 광명시
  "41210": {
    "10100": "광명1동", "10200": "광명2동", "10300": "광명3동", "10400": "광명4동", "10500": "광명5동",
    "10600": "광명6동", "10700": "광명7동", "10800": "하안1동", "10900": "하안2동", "11000": "하안3동"
  },
  // 경기도 화성시
  "41590": {
    "10100": "향남읍", "10200": "남양읍", "10300": "우정읍", "10400": "비봉면", "10500": "마도면",
    "10600": "송산면", "10700": "서신면", "10800": "새솔동", "10900": "반송동", "11000": "동탄1동",
    "11100": "동탄2동", "11200": "동탄3동", "11300": "동탄4동", "11400": "동탄5동", "11500": "동탄6동"
  },
  // 인천광역시 서구
  "28245": {
    "10100": "가좌1동", "10200": "가좌2동", "10300": "가좌3동", "10400": "가좌4동", "10500": "가정1동",
    "10600": "가정2동", "10700": "가정3동", "10800": "석남1동", "10900": "석남2동", "11000": "석남3동",
    "11100": "검단1동", "11200": "검단2동", "11300": "검단3동", "11400": "검단4동", "11500": "검단5동"
  },
  // 인천광역시 연수구
  "28185": {
    "10100": "옥련동", "10200": "선학동", "10300": "연수1동", "10400": "연수2동", "10500": "연수3동",
    "10600": "청학동", "10700": "송도1동", "10800": "송도2동", "10900": "송도3동", "11000": "송도4동",
    "11100": "송도5동"
  },
  // 세종특별자치시
  "36110": {
    "10100": "조치원읍", "10200": "연기면", "10300": "연동면", "10400": "부강면", "10500": "금남면",
    "10600": "장군면", "10700": "연서면", "10800": "전의면", "10900": "전동면", "11000": "소정면",
    "11100": "한솔동", "11200": "도담동", "11300": "아름동", "11400": "종촌동", "11500": "고운동",
    "11600": "보람동", "11700": "새롬동"
  }
}

export default function Home() {
  const [selectedSigungu, setSelectedSigungu] = useState<string>("")
  const [selectedBjdong, setSelectedBjdong] = useState<string>("")
  const [searchResults, setSearchResults] = useState<{ [key: string]: SearchResult[] }>({})
  const [loading, setLoading] = useState(false)
  const [apiKey, setApiKey] = useState<string>("")
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false)
  const [totalResults, setTotalResults] = useState(0)
  const [selectedDetailInfo, setSelectedDetailInfo] = useState<SearchResult | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)

  useEffect(() => {
    const savedApiKey = localStorage.getItem('buildingApiKey')
    if (savedApiKey) {
      setApiKey(savedApiKey)
    }
  }, [])

  const handleApiKeyChange = (value: string) => {
    setApiKey(value)
    localStorage.setItem('buildingApiKey', value)
  }

  // 선택된 시군구에 따른 법정동 목록 가져오기
  const getAvailableBjdongs = () => {
    if (!selectedSigungu) return {}
    return BJDONG_DATA[selectedSigungu] || {}
  }

  // 시군구 변경 시 법정동 초기화
  const handleSigunguChange = (value: string) => {
    setSelectedSigungu(value)
    setSelectedBjdong("") // 법정동 초기화
  }

  // 검색 실행 (모든 서비스 조회) - 2024년 최신 API 적용
  const handleSearch = async () => {
    if (!selectedSigungu || !selectedBjdong) {
      toast.error("시군구와 법정동을 모두 선택해주세요")
      return
    }

    setLoading(true)
    const results: { [serviceId: string]: SearchResult[] } = {}

    // API 키가 없는 경우 경고 메시지와 함께 실제 API 호출 시도
    if (!apiKey) {
      toast.warning("⚠️ API 키가 설정되지 않았습니다. 제한된 데이터만 조회됩니다.")
    }
    
    // 모든 서비스에 대해 순차적으로 API 호출 (2024년 최신 API)
    for (const service of BUILDING_HUB_SERVICES) {
      try {
        // 2024년 최신 API 엔드포인트 구성
        const baseUrl = 'https://apis.data.go.kr/1613000'
        let endpoint = ''
        
        switch (service.id) {
          case 'getApBasisOulnInfo':
            endpoint = '/ArchPmsHubService/getApBasisOulnInfo'
            break
          case 'getApDongOulnInfo':
            endpoint = '/ArchPmsHubService/getApDongOulnInfo'
            break
          case 'getApFlrOulnInfo':
            endpoint = '/ArchPmsHubService/getApFlrOulnInfo'
            break
          case 'getApHoOulnInfo':
            endpoint = '/ArchPmsHubService/getApHoOulnInfo'
            break
          case 'getApJijiguInfo':
            endpoint = '/ArchPmsHubService/getApJijiguInfo'
            break
          case 'getApPlatPlcInfo':
            endpoint = '/ArchPmsHubService/getApPlatPlcInfo'
            break
          default:
            endpoint = '/ArchPmsHubService/getApBasisOulnInfo'
        }
        
        const params = new URLSearchParams({
          serviceKey: apiKey || 'demo-key', // API 키가 없어도 시도
          numOfRows: "100",
          pageNo: "1",
          sigunguCd: selectedSigungu,
          bjdongCd: selectedBjdong
        })

        console.log(`API 호출: ${baseUrl}${endpoint}`)
        console.log('파라미터:', Object.fromEntries(params))

        const response = await fetch(`${baseUrl}${endpoint}?${params}`)
        
        if (!response.ok) {
          console.warn(`API 응답 오류: ${response.status} - ${response.statusText}`)
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        const xmlText = await response.text()
        console.log(`${service.name} API 응답 (첫 500자):`, xmlText.substring(0, 500))
        
        // XML 파싱 (2024년 최신 응답 형식)
        const parser = new DOMParser()
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml')
        
        // 다양한 에러 체크 패턴
        const resultCode = xmlDoc.querySelector('resultCode')?.textContent
        const resultMsg = xmlDoc.querySelector('resultMsg')?.textContent
        const returnAuthMsg = xmlDoc.querySelector('cmmMsgHeader returnAuthMsg')?.textContent
        
        // API 키 관련 오류 체크
        if (resultCode && resultCode !== '00') {
          console.warn(`API 결과 코드 오류: ${resultCode} - ${resultMsg}`)
          if (resultCode === '30' || resultCode === '31' || resultMsg?.includes('SERVICE_KEY')) {
            throw new Error(`API 키 오류: ${resultMsg}`)
          }
          throw new Error(`API 오류: ${resultMsg || resultCode}`)
        }
        
        if (returnAuthMsg && returnAuthMsg !== 'NORMAL_SERVICE') {
          console.warn(`API 인증 오류: ${returnAuthMsg}`)
          throw new Error(`API 인증 오류: ${returnAuthMsg}`)
        }

        // 데이터 추출
        const items = xmlDoc.querySelectorAll('item')
        const parsedResults: SearchResult[] = []
        
        console.log(`${service.name}: ${items.length}개 항목 발견`)
        
        items.forEach((item) => {
          const result: SearchResult = {}
          const children = item.children
          
          for (let i = 0; i < children.length; i++) {
            const child = children[i]
            result[child.tagName] = child.textContent || ''
          }
          
          // 추가 정보 보강
          const sigunguName = Object.entries(SIGUNGU_DATA).find(([_, codes]) => 
            Object.keys(codes).includes(selectedSigungu)
          )?.[0] || '지역명 없음'
          const bjdongName = getAvailableBjdongs()[selectedBjdong] || '동명 없음'
          
          result['시군구명'] = sigunguName
          result['법정동명'] = bjdongName
          result['서비스명'] = service.name
          result['데이터출처'] = '공공데이터포털 실시간'
          result['조회시간'] = new Date().toLocaleString()
          
          parsedResults.push(result)
        })

        results[service.id] = parsedResults
        
        if (parsedResults.length > 0) {
          console.log(`✅ ${service.name}: ${parsedResults.length}건 실데이터 조회 성공`)
        } else {
          console.log(`⚠️ ${service.name}: 조회 결과 없음`)
        }
        
      } catch (error) {
        console.error(`${service.name} API 호출 오류:`, error)
        
        // API 키 관련 오류인 경우 시뮬레이션 데이터 사용
        if (!apiKey || (error instanceof Error && error.message.includes('API 키'))) {
          console.log(`${service.name}: API 키 없음으로 시뮬레이션 데이터 사용`)
          const simulationData = generateSimulationData(service.id, 8)
          if (simulationData && simulationData.length > 0) {
            const sigunguName = Object.entries(SIGUNGU_DATA).find(([_, codes]) => 
              Object.keys(codes).includes(selectedSigungu)
            )?.[0] || '지역명 없음'
            const bjdongName = getAvailableBjdongs()[selectedBjdong] || '동명 없음'
            
            const enrichedData = simulationData.map(item => ({
              ...item,
              시군구명: sigunguName,
              법정동명: bjdongName,
              서비스명: service.name,
              데이터출처: '시뮬레이션 데이터',
              조회시간: new Date().toLocaleString()
            }))
            results[service.id] = enrichedData
          }
        } else {
          // 기타 오류의 경우 빈 결과
          console.log(`${service.name}: API 오류로 빈 결과 반환`)
          results[service.id] = []
        }
      }
    }

    setSearchResults(results)
    const totalCount = Object.values(results).reduce((sum, arr) => sum + arr.length, 0)
    setTotalResults(totalCount)
    
    if (totalCount > 0) {
      const realDataCount = Object.values(results).reduce((sum, arr) => 
        sum + arr.filter(item => item.데이터출처 === '공공데이터포털 실시간').length, 0
      )
      const simulationDataCount = Object.values(results).reduce((sum, arr) => 
        sum + arr.filter(item => item.데이터출처 === '시뮬레이션 데이터').length, 0
      )
      
      if (realDataCount > 0 && simulationDataCount > 0) {
        toast.success(`✅ 실시간 데이터 ${realDataCount}건, 시뮬레이션 데이터 ${simulationDataCount}건을 조회했습니다`)
      } else if (realDataCount > 0) {
        toast.success(`✅ 실시간 데이터 ${realDataCount}건을 조회했습니다`)
      } else if (simulationDataCount > 0) {
        toast.info(`🔍 시뮬레이션 데이터 ${simulationDataCount}건을 표시합니다`)
      }
    } else {
      toast.warning("⚠️ 조회 결과가 없습니다. API 키를 확인하거나 다른 지역을 선택해보세요.")
    }
    
    setLoading(false)
  }

  // CSV 다운로드
  const handleDownloadCSV = () => {
    const allData = Object.values(searchResults).flat()
    if (allData.length === 0) {
      toast.error("다운로드할 데이터가 없습니다")
      return
    }

    const headers = Object.keys(allData[0])
    const koreanHeaders = headers.map(header => FIELD_MAPPINGS[header] || header)
    
    const csvContent = [
      koreanHeaders.join(','),
      ...allData.map((row: SearchResult) => 
        headers.map(header => `"${row[header] || ''}"`).join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `건축허가착공_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success("CSV 파일이 다운로드되었습니다")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            전국 건축허가/착공 조회 시스템
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            전국 모든 시군구의 건축 허가, 착공, 시공정보를 종합적으로 제공합니다
          </p>
          
          {/* Phase 1 기능 안내 */}
          <div className="flex justify-center gap-4 mb-6">
            <Badge variant="secondary" className="px-3 py-1">
              <BarChart3 className="w-4 h-4 mr-1" />
              대시보드 분석
            </Badge>
            <Badge variant="secondary" className="px-3 py-1">
              <Building className="w-4 h-4 mr-1" />
              시공업체 정보
            </Badge>
            <Badge variant="secondary" className="px-3 py-1">
              <Database className="w-4 h-4 mr-1" />
              상세 허가정보
            </Badge>
          </div>

          <div className="flex justify-center gap-4">
            <Link href="/">
              <Button variant="outline">
                <ArrowRight className="w-4 h-4 mr-2" />
                메인 페이지
              </Button>
            </Link>
            <Button 
              onClick={() => setShowApiKeyDialog(true)}
              variant="outline"
            >
              <Key className="w-4 h-4 mr-2" />
              API 키 설정
            </Button>
          </div>
        </div>

        {/* 메인 탭 */}
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              대시보드
            </TabsTrigger>
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              건축허가 조회
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center gap-2">
              <Building className="w-4 h-4" />
              업체 분석
            </TabsTrigger>
          </TabsList>

          {/* 대시보드 탭 */}
          <TabsContent value="dashboard" className="mt-6">
            <DashboardOverview />
          </TabsContent>

          {/* 상세 조회 탭 */}
          <TabsContent value="search" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  전국 건축허가/착공 정보 조회
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* 조회 설정 */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="space-y-2">
                      <Label htmlFor="sigungu-select" className="text-xs font-medium text-gray-700">
                        시군구 선택
                      </Label>
                      <Select value={selectedSigungu} onValueChange={handleSigunguChange}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="시군구를 선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(SIGUNGU_DATA).map(([sido, sigunguList]) => (
                            <div key={sido}>
                              <div className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100">
                                {sido}
                              </div>
                              {Object.entries(sigunguList).map(([code, name]) => (
                                <SelectItem key={code} value={code}>
                                  <div className="flex flex-col">
                                    <span className="font-medium">{name}</span>
                                    <span className="text-xs text-gray-500">{code}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </div>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bjdong-select" className="text-xs font-medium text-gray-700">
                        법정동 선택
                      </Label>
                      <Select value={selectedBjdong} onValueChange={setSelectedBjdong} disabled={!selectedSigungu}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="법정동을 선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(getAvailableBjdongs()).map(([code, name]) => (
                            <SelectItem key={code} value={code}>
                              <div className="flex flex-col">
                                <span className="font-medium">{name}</span>
                                <span className="text-xs text-gray-500">{code}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-gray-700">
                        선택된 정보
                      </Label>
                      <div className="h-9 px-3 py-2 bg-gray-50 rounded-md border text-sm">
                        {selectedSigungu && selectedBjdong ? (
                          <span className="text-gray-900">
                            {Object.entries(SIGUNGU_DATA).find(([_, codes]) => 
                              Object.keys(codes).includes(selectedSigungu)
                            )?.[0]} / {getAvailableBjdongs()[selectedBjdong]}
                          </span>
                        ) : (
                          <span className="text-gray-500">시군구와 법정동을 선택하세요</span>
                        )}
                      </div>
                    </div>

                    <Button 
                      onClick={handleSearch}
                      disabled={!selectedSigungu || !selectedBjdong || loading}
                      className="h-9"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          조회중...
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4 mr-2" />
                          조회하기
                        </>
                      )}
                    </Button>
                  </div>

                  {/* 조회 결과 */}
                  {Object.keys(searchResults).length > 0 && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold">조회 결과</h3>
                          {(() => {
                            const realDataCount = Object.values(searchResults).reduce((sum, arr) => 
                              sum + arr.filter(item => item.데이터출처 === '공공데이터포털 실시간').length, 0
                            )
                            const simulationDataCount = Object.values(searchResults).reduce((sum, arr) => 
                              sum + arr.filter(item => item.데이터출처 === '시뮬레이션 데이터').length, 0
                            )
                            
                            if (realDataCount > 0 && simulationDataCount > 0) {
                              return (
                                <>
                                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                                    실시간 데이터 {realDataCount}건
                                  </Badge>
                                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                    시뮬레이션 데이터 {simulationDataCount}건
                                  </Badge>
                                </>
                              )
                            } else if (realDataCount > 0) {
                              return (
                                <Badge variant="secondary" className="bg-green-100 text-green-800">
                                  실시간 데이터 {realDataCount}건
                                </Badge>
                              )
                            } else {
                              return (
                                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                  시뮬레이션 데이터 {simulationDataCount}건
                                </Badge>
                              )
                            }
                          })()}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">
                            총 {totalResults}건
                          </span>
                          <Button size="sm" variant="outline" onClick={handleDownloadCSV}>
                            <Download className="w-4 h-4 mr-2" />
                            CSV 다운로드
                          </Button>
                        </div>
                      </div>

                      {/* 결과 테이블들 */}
                      {Object.entries(searchResults).map(([serviceId, results]) => {
                        const service = BUILDING_HUB_SERVICES.find(s => s.id === serviceId)
                        return (
                          <Card key={serviceId}>
                            <CardHeader>
                              <CardTitle className="text-base flex items-center justify-between">
                                <span>{service?.name} ({results.length}건)</span>
                                {(() => {
                                  const realCount = results.filter(item => item.데이터출처 === '공공데이터포털 실시간').length
                                  const simCount = results.filter(item => item.데이터출처 === '시뮬레이션 데이터').length
                                  
                                  if (realCount > 0 && simCount > 0) {
                                    return (
                                      <div className="flex gap-1">
                                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                          실시간 {realCount}건
                                        </Badge>
                                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                          시뮬레이션 {simCount}건
                                        </Badge>
                                      </div>
                                    )
                                  } else if (realCount > 0) {
                                    return (
                                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                        실시간 데이터 {realCount}건
                                      </Badge>
                                    )
                                  } else {
                                    return (
                                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                        시뮬레이션 데이터 {simCount}건
                                      </Badge>
                                    )
                                  }
                                })()}
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="border-b bg-gray-50">
                                      {SERVICE_MAIN_FIELDS[serviceId as keyof typeof SERVICE_MAIN_FIELDS]?.map((field) => (
                                        <th key={field.key} className="text-left p-3 font-medium text-gray-700">
                                          {field.label}
                                        </th>
                                      ))}
                                      <th className="text-left p-3 font-medium text-gray-700">상세정보</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {results.map((result, index) => (
                                      <tr key={index} className="border-b hover:bg-gray-50">
                                        {SERVICE_MAIN_FIELDS[serviceId as keyof typeof SERVICE_MAIN_FIELDS]?.map((field) => (
                                          <td key={field.key} className="p-3 text-sm">
                                            {field.key === 'pmsDay' || field.key === 'stcnsDay' || field.key === 'useAprDay' 
                                              ? (result[field.key] ? 
                                                  `${String(result[field.key]).slice(0, 4)}-${String(result[field.key]).slice(4, 6)}-${String(result[field.key]).slice(6, 8)}` 
                                                  : '-')
                                              : field.key === 'reprYn'
                                              ? (result[field.key] === 'Y' ? '대표' : '일반')
                                              : (result[field.key] ? String(result[field.key]).toLocaleString() : '-')
                                            }
                                          </td>
                                        ))}
                                        <td className="p-3">
                                          <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => {
                                              setSelectedDetailInfo(result)
                                              setShowDetailDialog(true)
                                            }}
                                          >
                                            상세보기
                                          </Button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 업체 분석 탭 */}
          <TabsContent value="analysis" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    시공업체 분석
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    시뮬레이션 데이터
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <p className="text-gray-600">
                    신도시/택지개발지구 주요 시공업체들의 상세 정보를 확인할 수 있습니다.
                  </p>
                  
                  {/* 주요 시공업체 목록 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {['대우건설', '현대건설', '삼성물산', 'GS건설', '포스코건설', '롯데건설'].map((company) => (
                      <CompanyInfoDialog key={company} companyName={company}>
                        <Card className="cursor-pointer hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Building className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <h3 className="font-medium">{company}</h3>
                                <p className="text-sm text-gray-600">상세정보 보기</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </CompanyInfoDialog>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* API 키 설정 다이얼로그 */}
        {showApiKeyDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle>API 키 설정</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="api-key">공공데이터포털 API 키</Label>
                  <Input
                    id="api-key"
                    type="password"
                    value={apiKey}
                    onChange={(e) => handleApiKeyChange(e.target.value)}
                    placeholder="API 키를 입력하세요"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowApiKeyDialog(false)}>
                    취소
                  </Button>
                  <Button onClick={() => setShowApiKeyDialog(false)}>
                    저장
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 상세정보 다이얼로그 */}
        {showDetailDialog && selectedDetailInfo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    상세정보
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => setShowDetailDialog(false)}>
                    ✕
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(selectedDetailInfo).map(([key, value]) => (
                    <div key={key} className="border-b pb-2">
                      <div className="text-sm font-medium text-gray-600 mb-1">
                        {FIELD_MAPPINGS[key] || key}
                      </div>
                      <div className="text-sm">
                        {key === 'pmsDay' || key === 'stcnsDay' || key === 'useAprDay' || key === 'crtnDay'
                          ? (value ? 
                              `${String(value).slice(0, 4)}-${String(value).slice(4, 6)}-${String(value).slice(6, 8)}` 
                              : '-')
                          : key === 'reprYn'
                          ? (value === 'Y' ? '대표' : '일반')
                          : (value ? String(value) : '-')
                        }
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex justify-end">
                  <Button onClick={() => setShowDetailDialog(false)}>
                    닫기
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
