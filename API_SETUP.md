# API 키 설정 가이드 (2024년 최신)

## 공공데이터포털 건축HUB API 키 설정

현재 시뮬레이션 데이터가 표시되고 있다면, 실제 공공데이터를 조회하기 위해 API 키를 설정해야 합니다.

### 1. 공공데이터포털에서 API 키 발급

1. [공공데이터포털](https://www.data.go.kr) 접속
2. 회원가입 및 로그인
3. **2024년 최신 건축HUB API 신청**:
   - **국토교통부_건축HUB_건축인허가정보 서비스** (2024년 9월 업데이트)
   - **국토교통부_건축HUB_건축물대장정보 서비스** (2024년 11월 업데이트)
   - **국토교통부_건축HUB_주택인허가정보 서비스**
   - **국토교통부_건축HUB_건물에너지정보 서비스**

### 2. 2024년 최신 API 엔드포인트

현재 시스템에서 사용하는 최신 API 엔드포인트:

#### 건축인허가 정보 서비스 (ArchPmsHubService)
- **동별개요**: `/1613000/ArchPmsHubService/getApBasisOulnInfo`
- **층별개요**: `/1613000/ArchPmsHubService/getApFlrOulnInfo`
- **호별개요**: `/1613000/ArchPmsHubService/getApHoOulnInq`
- **대수선**: `/1613000/ArchPmsHubService/getApMjrpInq`
- **주차장**: `/1613000/ArchPmsHubService/getApPrkplcInq`
- **전유공용면적**: `/1613000/ArchPmsHubService/getApExcluUseAreaInq`

#### 건축물대장 정보 서비스 (BldRgstService_v2)
- **총괄표제부**: `/1613000/BldRgstService_v2/getBrRecapTitleInfo`
- **표제부**: `/1613000/BldRgstService_v2/getBrTitleInfo`
- **층별개요**: `/1613000/BldRgstService_v2/getBrFlrOulnInfo`

#### 주택인허가 정보 서비스 (HsPmsService_v2)
- **동별개요**: `/1613000/HsPmsService_v2/getHsPmsBasisOulnInq`

#### 건물에너지 정보 서비스
- **에너지정보**: `/1613000/BldEnergyService/getBldEnergyInfo`

### 3. 환경변수 설정

프로젝트 루트 디렉토리에 `.env.local` 파일을 생성하고 다음과 같이 설정:

```bash
# 2024년 최신 건축HUB API 키
NEXT_PUBLIC_DATA_GO_KR_API_KEY=여기에_발급받은_API_키_입력

# 기존 호환성 유지 (선택사항)
NEXT_PUBLIC_DATA_API_KEY=여기에_발급받은_API_키_입력
```

### 4. 필수 파라미터 (2024년 최신)

모든 건축HUB API는 다음 필수 파라미터를 요구합니다:

- **sigunguCd**: 시군구코드 (5자리) - 예: `41570` (김포시)
- **bjdongCd**: 법정동코드 (5자리) - 예: `10100`

선택적 파라미터 (더 세부적인 조회 시 사용):
- **platGbCd**: 대지구분코드 - `0`(대지), `1`(산), `2`(블록)
- **bun**: 번지 - 예: `1`
- **ji**: 지번 - 예: `0`

### 5. 주요 지역 코드 예시 (2024년 최신)

시스템에서 지원하는 주요 지역 코드:

```javascript
// 신도시 및 주요 개발지구
김포한강신도시: { sigunguCd: '41570', bjdongCd: '10100' }
하남교산신도시: { sigunguCd: '41450', bjdongCd: '25900' }
과천지구: { sigunguCd: '41290', bjdongCd: '10100' }
인천검단신도시: { sigunguCd: '28245', bjdongCd: '11100' }
분당신도시: { sigunguCd: '41135', bjdongCd: '10100' }
일산신도시: { sigunguCd: '41285', bjdongCd: '10100' }
동탄신도시: { sigunguCd: '41590', bjdongCd: '11000' }
송도국제도시: { sigunguCd: '28185', bjdongCd: '10700' }
세종시: { sigunguCd: '36110', bjdongCd: '11100' }
```

### 6. 서버 재시작

환경변수 설정 후 개발 서버를 재시작:

```bash
npm run dev
```

### 7. API 응답 형식 (2024년 최신)

2024년 최신 API는 다음과 같은 XML 응답 형식을 사용합니다:

```xml
<response>
  <header>
    <resultCode>00</resultCode>
    <resultMsg>NORMAL_SERVICE</resultMsg>
  </header>
  <body>
    <items>
      <item>
        <mgmBldrgstPk>...</mgmBldrgstPk>
        <platPlc>...</platPlc>
        <!-- 기타 필드들 -->
      </item>
    </items>
    <numOfRows>100</numOfRows>
    <pageNo>1</pageNo>
    <totalCount>1</totalCount>
  </body>
</response>
```

### 주의사항

- **API 키는 공개되지 않도록 주의하세요**
- **`.env.local` 파일은 Git에 커밋하지 마세요**
- **API 키 승인까지 1-2일 소요될 수 있습니다**
- **2024년 건축HUB API는 기존 API와 응답 형식이 다릅니다**
- **시군구코드와 법정동코드는 필수 파라미터입니다**

### 문제 해결

**"SERVICE_KEY_IS_NOT_REGISTERED_ERROR" 오류가 발생하는 경우:**
- API 키가 올바르게 설정되었는지 확인
- 공공데이터포털에서 API 승인 상태 확인
- 2024년 최신 건축HUB API를 신청했는지 확인

**"시군구코드와 법정동코드는 필수 파라미터입니다" 오류:**
- 신도시를 선택했는지 확인
- 신도시 코드 매핑이 올바른지 확인

**시뮬레이션 데이터만 표시되는 경우:**
- `.env.local` 파일이 올바른 위치에 있는지 확인
- 환경변수명이 정확한지 확인 (`NEXT_PUBLIC_DATA_GO_KR_API_KEY`)
- 서버 재시작 여부 확인
- 브라우저 개발자 도구에서 네트워크 탭 확인

### API 키 유효성 검증

시스템에서 자동으로 API 키 유효성을 검증합니다:
- 유효한 API 키: ✅ 실시간 데이터 표시
- 무효한 API 키: 🔍 시뮬레이션 데이터 표시

### 지원 문의

- **공공데이터포털 고객센터**: 1566-0025
- **건축HUB 문의**: 02-2187-4164
- **운영시간**: 09:00~18:00 (토, 일, 공휴일 제외) 