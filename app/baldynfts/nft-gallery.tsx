"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Filter, X, Eye, Star } from "lucide-react"
import Image from "next/image"
import { RarityScale, RarityScaleInfo } from "./rarity-scale"

interface NFTMetadata {
  name: string
  description: string
  image: string
  dna: string
  edition: number
  date: number
  attributes: {
    trait_type: string
    value: string
  }[]
}

interface NFTItem {
  id: number
  metadata: NFTMetadata
  imageUrl: string
  rarityScore?: number
}

const ITEMS_PER_PAGE = 30

const TOTAL_NFTS =
  Number(process.env.NEXT_PUBLIC_BALDY_NFT_COUNT || process.env.NEXT_PUBLIC_NFT_TOTAL) || 30

const METADATA_BASE_URL =
  process.env.NEXT_PUBLIC_NFT_METADATA_BASE_URL ||
  "/images/nfts"

const IMAGE_BASE_URL =
  process.env.NEXT_PUBLIC_NFT_IMAGE_BASE_URL ||
  "/images/nfts"

export default function NFTGallery() {
  const [nfts, setNfts] = useState<NFTItem[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedNFT, setSelectedNFT] = useState<NFTItem | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [availableTraits, setAvailableTraits] = useState<Record<string, string[]>>({})
  const [sortBy, setSortBy] = useState<'edition' | 'rarity'>('edition')

  // Load NFT metadata and rarity data
  useEffect(() => {
    const loadNFTs = async () => {
      try {
        const nftItems: NFTItem[] = []
        const traitsMap: Record<string, Set<string>> = {}
        let rarityData: any = {}

        // Load rarity data if available
        try {
          const rarityResponse = await fetch('/nft-rarity-analysis.json')
          if (rarityResponse.ok) {
            const rarityJson = await rarityResponse.json()
            rarityData = rarityJson.rarityData
          }
        } catch (error) {
          console.warn("Rarity data not available:", error)
        }

        // Load available NFTs
        for (let i = 1; i <= TOTAL_NFTS; i++) {
          try {
            const response = await fetch(`${METADATA_BASE_URL}/${i}.json`)
            if (response.ok) {
              const metadata: NFTMetadata = await response.json()
              const rarityKey = String(i)
              const rarityInfo = rarityData?.[rarityKey]

              const nftItem: NFTItem = {
                id: i,
                metadata,
                imageUrl: `${IMAGE_BASE_URL}/${i}.png`,
                rarityScore: rarityInfo ? parseFloat(rarityInfo.rarityScore) : undefined
              }
              nftItems.push(nftItem)

              // Collect traits for filtering
              metadata.attributes.forEach(attr => {
                if (!traitsMap[attr.trait_type]) {
                  traitsMap[attr.trait_type] = new Set()
                }
                traitsMap[attr.trait_type].add(attr.value)
              })
            }
          } catch (error) {
            console.warn(`Failed to load NFT ${i}:`, error)
          }
        }

        setNfts(nftItems)
        
        // Convert sets to arrays for available traits
        const traitsArray: Record<string, string[]> = {}
        Object.keys(traitsMap).forEach(trait => {
          traitsArray[trait] = Array.from(traitsMap[trait]).sort()
        })
        setAvailableTraits(traitsArray)
        
        setLoading(false)
      } catch (error) {
        console.error("Failed to load NFTs:", error)
        setLoading(false)
      }
    }

    loadNFTs()
  }, [])

  // Filter and sort NFTs
  const filteredNFTs = useMemo(() => {
    let filtered = nfts.filter(nft => {
      return Object.entries(filters).every(([traitType, value]) => {
        if (!value) return true
        const attribute = nft.metadata.attributes.find(attr => attr.trait_type === traitType)
        return attribute?.value === value
      })
    })

    // Sort by rarity or edition
    if (sortBy === 'rarity') {
      filtered = filtered.sort((a, b) => {
        if (!a.rarityScore && !b.rarityScore) return a.id - b.id
        if (!a.rarityScore) return 1
        if (!b.rarityScore) return -1
        return b.rarityScore - a.rarityScore
      })
    } else {
      filtered = filtered.sort((a, b) => a.id - b.id)
    }

    return filtered
  }, [nfts, filters, sortBy])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredNFTs.length / ITEMS_PER_PAGE))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentNFTs = filteredNFTs.slice(startIndex, endIndex)

  useEffect(() => {
    if (currentPage !== safeCurrentPage) {
      setCurrentPage(safeCurrentPage)
    }
  }, [currentPage, safeCurrentPage])

  const handleFilterChange = (traitType: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [traitType]: prev[traitType] === value ? "" : value
    }))
    setCurrentPage(1) // Reset to first page when filtering
  }

  const clearFilters = () => {
    setFilters({})
    setCurrentPage(1)
  }

  const activeFiltersCount = Object.values(filters).filter(value => value !== "").length

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading Baldy NFTs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Rarity Scale Info */}
      <RarityScaleInfo />

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Filter NFTs</h2>
          <div className="flex items-center space-x-2">
            {activeFiltersCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                <X className="w-4 h-4 mr-1" />
                Clear ({activeFiltersCount})
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-1" />
              {showFilters ? "Hide" : "Show"} Filters
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(availableTraits).map(([traitType, values]) => (
              <div key={traitType} className="space-y-2">
                <h3 className="font-semibold text-gray-700">{traitType}</h3>
                <div className="flex flex-wrap gap-2">
                  {values.map(value => (
                    <Badge
                      key={value}
                      variant={filters[traitType] === value ? "default" : "outline"}
                      className={`cursor-pointer transition-colors ${
                        filters[traitType] === value 
                          ? "bg-red-600 text-white" 
                          : "hover:bg-red-50 hover:border-red-600"
                      }`}
                      onClick={() => handleFilterChange(traitType, value)}
                    >
                      {value}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Results Summary and Sort Controls */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          Showing {currentNFTs.length} of {filteredNFTs.length} NFTs
          {activeFiltersCount > 0 && ` (${activeFiltersCount} filter${activeFiltersCount > 1 ? 's' : ''} applied)`}
        </p>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'edition' | 'rarity')}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="edition">Edition #</option>
              <option value="rarity">Rarity</option>
            </select>
          </div>
          <div className="text-sm text-gray-500">
            Page {safeCurrentPage} of {totalPages}
          </div>
        </div>
      </div>

      {/* NFT Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {currentNFTs.map((nft) => (
          <Card key={nft.id} className="group hover:shadow-xl transition-all duration-300 cursor-pointer">
            <CardContent className="p-0">
              <div 
                className="relative overflow-hidden rounded-t-lg"
                onClick={() => setSelectedNFT(nft)}
              >
                <Image
                  src={nft.imageUrl}
                  alt={nft.metadata.name}
                  width={250}
                  height={250}
                  className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                  <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
              
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-sm truncate flex-1">{nft.metadata.name}</h3>
                  {nft.rarityScore && (
                    <Star className="w-3 h-3 text-yellow-500 flex-shrink-0 ml-1" />
                  )}
                </div>
                
                {nft.rarityScore && (
                  <div className="mb-2">
                    <RarityScale rarityScore={nft.rarityScore} className="text-xs" />
                  </div>
                )}
                
                <div className="space-y-1">
                  {nft.metadata.attributes.slice(0, 2).map((attr, index) => (
                    <div key={index} className="flex justify-between text-xs">
                      <span className="text-gray-500 truncate">{attr.trait_type}:</span>
                      <span className="font-medium truncate ml-1">{attr.value}</span>
                    </div>
                  ))}
                  {nft.metadata.attributes.length > 2 && (
                    <div className="text-xs text-gray-400">
                      +{nft.metadata.attributes.length - 2} more traits
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={safeCurrentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          
          <div className="flex space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(totalPages - 4, safeCurrentPage - 2)) + i
              if (pageNum > totalPages) return null
              
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === safeCurrentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                  className={pageNum === safeCurrentPage ? "bg-red-600 hover:bg-red-700" : ""}
                >
                  {pageNum}
                </Button>
              )
            })}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={safeCurrentPage === totalPages}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* NFT Detail Modal */}
      {selectedNFT && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">{selectedNFT.metadata.name}</h2>
                  {selectedNFT.rarityScore && (
                    <RarityScale rarityScore={selectedNFT.rarityScore} />
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedNFT(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Image
                    src={selectedNFT.imageUrl}
                    alt={selectedNFT.metadata.name}
                    width={400}
                    height={400}
                    className="w-full rounded-lg"
                  />
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Description</h3>
                    <p className="text-gray-600">{selectedNFT.metadata.description}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Attributes</h3>
                    <div className="space-y-2">
                      {selectedNFT.metadata.attributes.map((attr, index) => (
                        <div key={index} className="flex justify-between p-2 bg-gray-50 rounded">
                          <span className="text-gray-600">{attr.trait_type}</span>
                          <span className="font-medium">{attr.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <div className="flex justify-between text-sm text-gray-500 mb-2">
                      <span>Edition:</span>
                      <span>#{selectedNFT.metadata.edition}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>DNA:</span>
                      <span className="font-mono text-xs">{selectedNFT.metadata.dna}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
