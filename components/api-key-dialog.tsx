"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Key, ExternalLink, CheckCircle, AlertCircle } from "lucide-react"

interface ApiKeyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onApiKeySet?: (apiKey: string) => void
}

export function ApiKeyDialog({ open, onOpenChange, onApiKeySet }: ApiKeyDialogProps) {
  const [apiKey, setApiKey] = useState("")
  const [isValidating, setIsValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean
    message: string
  } | null>(null)

  useEffect(() => {
    // 저장된 API 키 불러오기
    const savedApiKey = localStorage.getItem('PUBLIC_DATA_API_KEY')
    if (savedApiKey) {
      setApiKey(savedApiKey)
    }
  }, [open])

  const validateApiKey = async (key: string) => {
    if (!key || key.length < 10) {
      return { isValid: false, message: "API 키가 너무 짧습니다." }
    }

    setIsValidating(true)
    
    try {
      // 간단한 API 호출로 키 유효성 검증
      const testUrl = `https://apis.data.go.kr/1613000/ArchPmsHubService/getApBasisOulnInfo?serviceKey=${encodeURIComponent(key)}&numOfRows=1&pageNo=1&sigunguCd=11110`
      
      const response = await fetch(testUrl)
      const text = await response.text()
      
      if (text.includes('SERVICE_KEY_IS_NOT_REGISTERED_ERROR')) {
        return { isValid: false, message: "등록되지 않은 API 키입니다." }
      } else if (text.includes('NORMAL_SERVICE')) {
        return { isValid: true, message: "API 키가 유효합니다!" }
      } else if (text.includes('resultCode')) {
        return { isValid: true, message: "API 키가 설정되었습니다." }
      } else {
        return { isValid: false, message: "API 키 검증에 실패했습니다." }
      }
    } catch (error) {
      console.error('API 키 검증 오류:', error)
      return { isValid: false, message: "네트워크 오류로 검증에 실패했습니다." }
    } finally {
      setIsValidating(false)
    }
  }

  const handleSave = async () => {
    if (!apiKey.trim()) {
      setValidationResult({ isValid: false, message: "API 키를 입력해주세요." })
      return
    }

    const result = await validateApiKey(apiKey.trim())
    setValidationResult(result)

    if (result.isValid) {
      // localStorage에 저장
      localStorage.setItem('PUBLIC_DATA_API_KEY', apiKey.trim())
      
      // 부모 컴포넌트에 알림
      onApiKeySet?.(apiKey.trim())
      
      // 잠시 후 다이얼로그 닫기
      setTimeout(() => {
        onOpenChange(false)
        setValidationResult(null)
      }, 1500)
    }
  }

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      setValidationResult({ isValid: false, message: "API 키를 입력해주세요." })
      return
    }

    const result = await validateApiKey(apiKey.trim())
    setValidationResult(result)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            공공데이터포털 API 인증키 설정
          </DialogTitle>
          <DialogDescription>
            실제 건축인허가 데이터를 조회하려면 공공데이터포털에서 발급받은 API 인증키가 필요합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* API 키 입력 */}
          <div className="space-y-2">
            <Label htmlFor="apiKey">API 인증키</Label>
            <Textarea
              id="apiKey"
              placeholder="공공데이터포털에서 발급받은 API 인증키를 입력하세요"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="min-h-[80px] font-mono text-sm"
            />
          </div>

          {/* 검증 결과 */}
          {validationResult && (
            <Alert className={validationResult.isValid ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              {validationResult.isValid ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={validationResult.isValid ? "text-green-700" : "text-red-700"}>
                {validationResult.message}
              </AlertDescription>
            </Alert>
          )}

          {/* 안내 사항 */}
          <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900">API 키 발급 방법:</h4>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>
                <Button
                  variant="link"
                  className="h-auto p-0 text-blue-600 hover:text-blue-800"
                  onClick={() => window.open('https://www.data.go.kr', '_blank')}
                >
                  공공데이터포털 <ExternalLink className="h-3 w-3 ml-1 inline" />
                </Button>
                에 회원가입 및 로그인
              </li>
                             <li>&quot;건축인허가 정보 서비스&quot; 검색 후 활용신청</li>
              <li>승인 완료 후 (1-2일 소요) 마이페이지에서 인증키 확인</li>
              <li>발급받은 인증키를 위 입력란에 붙여넣기</li>
            </ol>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleTestConnection}
            disabled={isValidating || !apiKey.trim()}
          >
            {isValidating ? "검증 중..." : "연결 테스트"}
          </Button>
          <Button onClick={handleSave} disabled={isValidating}>
            {isValidating ? "저장 중..." : "저장"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 