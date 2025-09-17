export function toText(value: any, fallback = ""): string {
  try {
    if (value === null || value === undefined) return fallback
    if (typeof value === "string") return value
    if (typeof value === "number" || typeof value === "boolean") return String(value)
    if (typeof value === "object") {
      // 记录对象转换的调试信息
      console.warn('[toText] 检测到对象，正在转换:', {
        value,
        type: typeof value,
        constructor: value?.constructor?.name,
        keys: Object.keys(value || {}),
        stackTrace: new Error().stack?.split('\n').slice(1, 4)
      })

      // 如果对象实现了自定义 toString 并且不是默认形式
      const maybe = value.toString?.()
      if (maybe && typeof maybe === "string" && maybe !== "[object Object]") return maybe
      // 退化为 JSON 字符串
      return JSON.stringify(value)
    }
    return String(value)
  } catch (error) {
    console.error('[toText] 转换失败:', error, 'value:', value)
    return fallback || ""
  }
}
