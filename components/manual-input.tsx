"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"

interface FormData {
  address: string
  contractor: string
  completionDate: string
  contact: string
  email: string
  note: string
}

interface ManualInputProps {
  form: FormData
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  onAdd: () => void
}

export function ManualInput({ form, onFormChange, onAdd }: ManualInputProps) {
  return (
    <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-800">수동 입력</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="address" className="text-sm font-medium text-gray-700">
              주소 *
            </Label>
            <Input
              id="address"
              name="address"
              value={form.address}
              onChange={onFormChange}
              placeholder="예: 서울시 강남구 테헤란로 123"
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="contractor" className="text-sm font-medium text-gray-700">
              시공사 *
            </Label>
            <Input
              id="contractor"
              name="contractor"
              value={form.contractor}
              onChange={onFormChange}
              placeholder="예: 대우건설"
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="completionDate" className="text-sm font-medium text-gray-700">
              준공예정일 *
            </Label>
            <Input
              id="completionDate"
              name="completionDate"
              type="date"
              value={form.completionDate}
              onChange={onFormChange}
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="contact" className="text-sm font-medium text-gray-700">
              담당자 *
            </Label>
            <Input
              id="contact"
              name="contact"
              value={form.contact}
              onChange={onFormChange}
              placeholder="예: 김현장"
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              이메일 *
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={onFormChange}
              placeholder="예: contact@company.co.kr"
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="note" className="text-sm font-medium text-gray-700">
              메모
            </Label>
            <Textarea
              id="note"
              name="note"
              value={form.note}
              onChange={onFormChange}
              placeholder="추가 정보나 메모를 입력하세요"
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 min-h-[100px]"
            />
          </div>
        </div>
        
        <div className="flex justify-end pt-4">
          <Button 
            onClick={onAdd}
            className="bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all px-8"
          >
            <Plus className="w-4 h-4 mr-2" />
            타겟 현장 추가
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 