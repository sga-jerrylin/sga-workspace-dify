"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FileUpload } from "@/components/ui/file-upload"
import { Building } from "lucide-react"
import type { Company } from "@/lib/types/database"
import { createClient } from "@/lib/supabase/client"
import { getCompanyInfo } from "@/lib/database/queries"

interface CompanySettingsProps {
  companyId?: string
}

export default function CompanySettings({ companyId }: CompanySettingsProps) {
  const [company, setCompany] = useState<Company | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    logoUrl: "",
  })

  useEffect(() => {
    loadCompanyInfo()
  }, [companyId])

  const loadCompanyInfo = async () => {
    if (!companyId) return

    setIsLoading(true)
    const { data } = await getCompanyInfo(companyId)
    if (data) {
      setCompany(data)
      setFormData({
        name: data.name,
        description: data.description || "",
        logoUrl: data.logo_url || "",
      })
    }
    setIsLoading(false)
  }

  const handleSave = async () => {
    if (!companyId) return

    setIsSaving(true)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from("companies")
        .update({
          name: formData.name,
          description: formData.description,
          logo_url: formData.logoUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", companyId)

      if (error) throw error

      loadCompanyInfo()
    } catch (error) {
      console.error("保存企业信息失败:", error)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">加载中...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">企业设置</h2>
        <p className="text-gray-500">管理企业基本信息和配置</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>基本信息</CardTitle>
          <CardDescription>配置企业的基本信息和品牌标识</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 企业Logo */}
          <div className="space-y-4">
            <Label>企业Logo</Label>
            <div className="flex items-center space-x-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={formData.logoUrl || "/placeholder.svg"} />
                <AvatarFallback>
                  <Building className="w-8 h-8" />
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <FileUpload
                  type="company_logo"
                  currentUrl={formData.logoUrl}
                  onUpload={(url) => setFormData({ ...formData, logoUrl: url })}
                  accept="image/*"
                />
                <p className="text-xs text-gray-500">支持 JPG、PNG 格式，建议尺寸 200x200px</p>
              </div>
            </div>
          </div>

          {/* 企业名称 */}
          <div className="space-y-2">
            <Label htmlFor="companyName">企业名称</Label>
            <Input
              id="companyName"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="请输入企业名称"
            />
          </div>

          {/* 企业描述 */}
          <div className="space-y-2">
            <Label htmlFor="companyDescription">企业描述</Label>
            <Textarea
              id="companyDescription"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="请输入企业描述"
              rows={4}
            />
          </div>

          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "保存中..." : "保存设置"}
          </Button>
        </CardContent>
      </Card>

      {/* 系统信息 */}
      <Card>
        <CardHeader>
          <CardTitle>系统信息</CardTitle>
          <CardDescription>查看系统相关信息</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">企业ID</Label>
              <p className="text-sm font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded">{companyId}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">创建时间</Label>
              <p className="text-sm">{company ? new Date(company.created_at).toLocaleString() : "-"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
