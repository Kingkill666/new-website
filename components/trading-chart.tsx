"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, DollarSign, Activity, BarChart3 } from "lucide-react"

interface TradingChartProps {
  tokenAddress: string
}

const TradingChart = ({ tokenAddress }: TradingChartProps) => {
  return (
    <Card className="w-full bg-gray-900 border-gray-700">
      <CardHeader className="bg-gray-800 border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-white">VMF/USDC on Uniswap</CardTitle>
            <p className="text-sm text-gray-400">Real-time data from DexScreener</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="bg-gray-900 p-0">
        {/* DexScreener Chart Embed */}
        <div className="w-full h-[600px]">
          <iframe
            src="https://dexscreener.com/base/0x2213414893259b0c48066acd1763e7fba97859e5?embed=1&theme=dark"
            className="w-full h-full border-0"
            title="VMF/USDC Trading Chart"
            allowFullScreen
          />
        </div>

        {/* Trading Links */}
        <div className="p-6">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="cursor-pointer bg-gray-700 hover:bg-gray-600 border-gray-600 text-white">
              <a 
                href="https://app.uniswap.org/#/swap?outputCurrency=0x2213414893259b0c48066acd1763e7fba97859e5" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-1"
              >
                <span>Trade on Uniswap</span>
                <TrendingUp className="w-3 h-3" />
              </a>
            </Badge>
            <Badge variant="outline" className="cursor-pointer bg-gray-700 hover:bg-gray-600 border-gray-600 text-white">
              <a 
                href="https://dexscreener.com/base/0x2213414893259b0c48066acd1763e7fba97859e5" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-1"
              >
                <span>View on DexScreener</span>
                <BarChart3 className="w-3 h-3" />
              </a>
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default TradingChart 