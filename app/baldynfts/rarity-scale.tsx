"use client"

import { Badge } from "@/components/ui/badge"

interface RarityScaleProps {
  rarityScore: number
  className?: string
}

export function RarityScale({ rarityScore, className = "" }: RarityScaleProps) {
  const getRarityLevel = (score: number) => {
    if (score >= 200) return { level: "Legendary", color: "bg-purple-600", textColor: "text-purple-600" }
    if (score >= 100) return { level: "Epic", color: "bg-red-600", textColor: "text-red-600" }
    if (score >= 50) return { level: "Rare", color: "bg-blue-600", textColor: "text-blue-600" }
    if (score >= 20) return { level: "Uncommon", color: "bg-green-600", textColor: "text-green-600" }
    return { level: "Common", color: "bg-gray-600", textColor: "text-gray-600" }
  }

  const rarity = getRarityLevel(rarityScore)

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Badge 
        variant="outline" 
        className={`${rarity.color} text-white border-0 font-semibold`}
      >
        {rarity.level}
      </Badge>
      <span className={`text-xs font-medium ${rarity.textColor}`}>
        Score: {rarityScore}
      </span>
    </div>
  )
}

export const RARITY_LEVELS = {
  LEGENDARY: { min: 200, max: 1000, color: "purple", label: "Legendary" },
  EPIC: { min: 100, max: 199, color: "red", label: "Epic" },
  RARE: { min: 50, max: 99, color: "blue", label: "Rare" },
  UNCOMMON: { min: 20, max: 49, color: "green", label: "Uncommon" },
  COMMON: { min: 0, max: 19, color: "gray", label: "Common" }
}

export function RarityScaleInfo() {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h3 className="text-lg font-bold mb-4">Rarity Scale</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {Object.entries(RARITY_LEVELS).map(([key, level]) => (
          <div key={key} className="text-center">
            <Badge 
              variant="outline" 
              className={`bg-${level.color}-600 text-white border-0 font-semibold mb-2`}
            >
              {level.label}
            </Badge>
            <p className="text-xs text-gray-600">
              Score: {level.min}+
            </p>
          </div>
        ))}
      </div>
      <p className="text-sm text-gray-500 mt-4">
        Rarity is calculated based on trait frequency. Lower frequency traits contribute more to the rarity score.
      </p>
    </div>
  )
}
