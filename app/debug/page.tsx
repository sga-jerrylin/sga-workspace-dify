'use client'

import React, { useState, useEffect } from 'react'

export default function DebugPage() {
  const [agents, setAgents] = useState([])
  const [debugInfo, setDebugInfo] = useState('')

  useEffect(() => {
    // 模拟获取agent数据
    fetch('/api/user/agents', {
      headers: {
        'Authorization': 'Bearer test-token'
      }
    })
    .then(res => res.json())
    .then(data => {
      console.log('API响应:', data)
      setDebugInfo(JSON.stringify(data, null, 2))
      if (data.agents) {
        setAgents(data.agents)
      }
    })
    .catch(err => {
      console.error('API错误:', err)
      setDebugInfo('API调用失败: ' + err.message)
    })
  }, [])

  return (
    <div className="p-8 bg-gray-900 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">调试页面</h1>
      
      <div className="mb-8">
        <h2 className="text-xl mb-2">Agent数据测试</h2>
        {agents.map((agent: any, index) => (
          <div key={index} className="mb-4 p-4 bg-gray-800 rounded">
            <h3 className="font-bold">Agent {index + 1}</h3>
            <p>ID: {agent.id}</p>
            <p>中文名: {agent.chineseName}</p>
            <p>中文名类型: {typeof agent.chineseName}</p>
            <p>中文名构造函数: {agent.chineseName?.constructor?.name}</p>
            <p>转字符串: {String(agent.chineseName)}</p>
            <p>JSON: {JSON.stringify(agent.chineseName)}</p>
            <p>toString(): {agent.chineseName?.toString?.()}</p>
            <p>是否为对象: {typeof agent.chineseName === 'object' ? 'YES' : 'NO'}</p>
            <p>是否为null: {agent.chineseName === null ? 'YES' : 'NO'}</p>
            <p>原始数据: {JSON.stringify(agent, null, 2)}</p>
          </div>
        ))}
      </div>

      <div className="mb-8">
        <h2 className="text-xl mb-2">API原始响应</h2>
        <pre className="bg-gray-800 p-4 rounded overflow-auto text-sm">
          {debugInfo}
        </pre>
      </div>

      <div className="mb-8">
        <h2 className="text-xl mb-2">React版本测试</h2>
        <p>React版本: {React.version}</p>
      </div>
    </div>
  )
}
