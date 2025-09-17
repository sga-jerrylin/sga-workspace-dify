import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get('url')
    const apiKey = searchParams.get('apiKey')

    if (!imageUrl) {
      return NextResponse.json({ error: 'Missing image URL' }, { status: 400 })
    }

    console.log('[ImageProxy] 代理图片请求:', {
      originalUrl: imageUrl,
      hasApiKey: !!apiKey,
      apiKeyPreview: apiKey ? `${apiKey.substring(0, 8)}...` : 'none',
      requestUrl: request.url
    })

    // 获取图片，处理DIFY格式的URL
    let response: Response
    let finalUrl = imageUrl

    // 如果是相对路径，转换为完整的DIFY URL
    if (imageUrl.startsWith('/files/')) {
      // 从请求头或查询参数中获取DIFY基础URL
      const difyBaseUrl = request.headers.get('x-dify-base-url') || 'http://43.139.167.250:9005'
      finalUrl = `${difyBaseUrl}${imageUrl}`
      console.log('[ImageProxy] 转换相对路径为完整URL:', finalUrl)
    }
    // 如果URL包含错误的域名，替换为正确的Dify服务器地址
    else if (imageUrl.includes('localhost:8100') || imageUrl.includes('127.0.0.1')) {
      finalUrl = imageUrl.replace(/https?:\/\/[^\/]+/, 'http://43.139.167.250:9005')
      console.log('[ImageProxy] 修正错误域名:', {
        original: imageUrl,
        corrected: finalUrl
      })
    }

    try {
      // 构建请求头
      const fetchHeaders: Record<string, string> = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'image/*,*/*'
      }

      // 如果是Dify API的图片，添加认证头
      if (finalUrl.includes('/files/tools/') || finalUrl.includes('sandbox-api.dify.ai') || finalUrl.includes('api.dify.ai')) {
        // 优先使用查询参数中的API Key，然后是请求头，最后是默认值
        const difyApiKey = apiKey || request.headers.get('x-dify-api-key') || process.env.DIFY_API_KEY || 'app-P0zICVDnPuLSteB4iM7SClQi'
        fetchHeaders['Authorization'] = `Bearer ${difyApiKey}`
        console.log('[ImageProxy] 添加Dify认证头:', {
          url: finalUrl,
          hasApiKey: !!difyApiKey,
          apiKeySource: apiKey ? 'query' : (request.headers.get('x-dify-api-key') ? 'header' : 'default'),
          apiKeyPreview: difyApiKey ? `${difyApiKey.substring(0, 8)}...` : 'none'
        })
      }

      console.log('[ImageProxy] 发起请求:', {
        url: finalUrl,
        headers: fetchHeaders
      })

      response = await fetch(finalUrl, {
        headers: fetchHeaders
      })

      console.log('[ImageProxy] 图片请求状态:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      })
    } catch (error) {
      console.error('[ImageProxy] 图片请求异常:', error)
      throw error
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unable to read error response')
      console.error('[ImageProxy] 图片获取失败:', {
        status: response.status,
        statusText: response.statusText,
        url: finalUrl,
        errorBody: errorText,
        headers: Object.fromEntries(response.headers.entries())
      })
      return NextResponse.json({
        error: 'Failed to fetch image',
        status: response.status,
        statusText: response.statusText,
        url: finalUrl,
        errorBody: errorText
      }, { status: response.status })
    }

    const imageBuffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'image/png'

    console.log('[ImageProxy] 图片代理成功:', {
      url: imageUrl,
      contentType,
      size: imageBuffer.byteLength
    })

    // 返回图片
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600', // 缓存1小时
        'Access-Control-Allow-Origin': '*'
      }
    })

  } catch (error) {
    console.error('[ImageProxy] 代理图片时发生错误:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
