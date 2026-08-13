const LineChart = ({ data, xKey, yKey, color = '#6366f1', height = 300 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        No data available
      </div>
    )
  }

  const padding = { top: 20, right: 20, bottom: 40, left: 50 }
  const width = 800
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  const values = data.map((d) => d[yKey])
  const minVal = Math.min(...values)
  const maxVal = Math.max(...values)
  const range = maxVal - minVal || 1

  const points = data.map((d, i) => ({
    x: padding.left + (i / (data.length - 1)) * chartWidth,
    y: padding.top + chartHeight - ((d[yKey] - minVal) / range) * chartHeight,
  }))

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

  const yTicks = 5
  const yStep = chartHeight / yTicks
  const yLabels = Array.from({ length: yTicks + 1 }, (_, i) => {
    const val = minVal + (range * (yTicks - i)) / yTicks
    return {
      y: padding.top + i * yStep,
      label: val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val.toFixed(0),
    }
  })

  const xLabelStep = Math.ceil(data.length / 6)
  const xLabels = data
    .map((d, i) => ({ x: padding.left + (i / (data.length - 1)) * chartWidth, label: d[xKey] }))
    .filter((_, i) => i % xLabelStep === 0 || i === data.length - 1)

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ minWidth: 600 }}>
        {yLabels.map((tick, i) => (
          <g key={i}>
            <line
              x1={padding.left}
              y1={tick.y}
              x2={width - padding.right}
              y2={tick.y}
              stroke="#e5e7eb"
              strokeDasharray="4 4"
              className="dark:stroke-gray-700"
            />
            <text x={padding.left - 8} y={tick.y + 4} textAnchor="end" className="text-xs fill-gray-500 dark:fill-gray-400">
              {tick.label}
            </text>
          </g>
        ))}
        <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="4" fill={color} stroke="white" strokeWidth="2" />
        ))}
        {xLabels.map((label, i) => (
          <text
            key={i}
            x={label.x}
            y={height - 8}
            textAnchor="middle"
            className="text-xs fill-gray-500 dark:fill-gray-400"
          >
            {label.label.slice(5)}
          </text>
        ))}
      </svg>
    </div>
  )
}

export default LineChart
