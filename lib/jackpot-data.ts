// Jackpot calculation and data utilities

// Calculate community jackpot based on real player activity
export const calculateCommunityJackpot = (): number => {
  if (typeof window === "undefined") return 0 // Default for SSR

  // Count today's players (each player pays $1 worth of VMF)
  const today = new Date().toDateString()
  const keys = Object.keys(localStorage)
  let todaysPlayers = 0

  keys.forEach((key) => {
    if (key.startsWith("pizza_entry_") && key.includes(today) && localStorage.getItem(key) === "true") {
      todaysPlayers++
    }
  })

  // Each player pays $1 worth of VMF, so jackpot = number of players
  return todaysPlayers
}

// Get real weekly jackpot information with actual data
export const getWeeklyJackpotInfo = () => {
  // Calculate time until next Sunday at 12pm PST
  const now = new Date()
  const pstOffset = -8 * 60 // PST is UTC-8 (in minutes)
  const utc = now.getTime() + now.getTimezoneOffset() * 60000
  const pstTime = new Date(utc + pstOffset * 60000)

  // Find next Sunday at 12pm PST
  const nextSunday = new Date(pstTime)
  const daysUntilSunday = (7 - pstTime.getDay()) % 7
  if (daysUntilSunday === 0 && pstTime.getHours() >= 12) {
    // If it's Sunday and past 12pm, go to next Sunday
    nextSunday.setDate(nextSunday.getDate() + 7)
  } else {
    nextSunday.setDate(nextSunday.getDate() + daysUntilSunday)
  }
  nextSunday.setHours(12, 0, 0, 0)

  // Calculate time difference
  const difference = nextSunday.getTime() - pstTime.getTime()
  const days = Math.floor(difference / (1000 * 60 * 60 * 24))
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((difference % (1000 * 60)) / 1000)

  // Calculate real toppings and players from actual game data
  let totalToppings = 0
  let totalPlayers = 0
  const uniquePlayers = new Set()

  if (typeof window !== "undefined") {
    const keys = Object.keys(localStorage)
    const today = new Date().toDateString()

    // Count real data from all sources
    keys.forEach((key) => {
      // Daily play entries (1 topping per day played)
      if (key.startsWith("pizza_entry_")) {
        if (key.includes(today) && localStorage.getItem(key) === "true") {
          totalToppings += 1 // 1 topping for daily play
          const address = key.replace("pizza_entry_", "").replace(`_${today}`, "")
          uniquePlayers.add(address)
        }
      }

      // Referral success records (2 toppings per referral)
      if (key.startsWith("pizza_referral_success_")) {
        const address = key.replace("pizza_referral_success_", "")
        const successRecord = JSON.parse(localStorage.getItem(key) || "[]")
        const referralToppings = successRecord.length * 2 // 2 toppings per referral
        totalToppings += referralToppings
        uniquePlayers.add(address)
      }

      // VMF holdings (1 topping per 10 VMF - simulated for now)
      if (key.startsWith("pizza_vmf_holdings_")) {
        const address = key.replace("pizza_vmf_holdings_", "")
        const vmfAmount = Number.parseInt(localStorage.getItem(key) || "0")
        const vmfToppings = Math.floor(vmfAmount / 10) // 1 topping per 10 VMF
        totalToppings += vmfToppings
        uniquePlayers.add(address)
      }

      // Streak bonuses (3 toppings for 7-day streak)
      if (key.startsWith("pizza_streak_")) {
        const address = key.replace("pizza_streak_", "")
        const streakDays = Number.parseInt(localStorage.getItem(key) || "0")
        if (streakDays >= 7) {
          totalToppings += 3 // 3 toppings for 7-day streak
        }
        uniquePlayers.add(address)
      }

      // Legacy toppings storage (for backward compatibility)
      if (key.startsWith("pizza_toppings_")) {
        const toppings = Number.parseInt(localStorage.getItem(key) || "0")
        if (toppings > 0) {
          totalToppings += toppings
          const address = key.replace("pizza_toppings_", "")
          uniquePlayers.add(address)
        }
      }
    })

    totalPlayers = uniquePlayers.size
  }

  return {
    timeUntilDraw: { days, hours, minutes, seconds },
    totalToppings,
    totalPlayers,
  }
}

// Get player count for today
export const getTodayPlayerCount = (): number => {
  if (typeof window === "undefined") return 0

  const today = new Date().toDateString()
  const keys = Object.keys(localStorage)
  let count = 0

  keys.forEach((key) => {
    if (key.startsWith("pizza_entry_") && key.includes(today) && localStorage.getItem(key) === "true") {
      count++
    }
  })

  return count
}

// Check if player has already entered today
export const hasPlayerEnteredToday = (address: string): boolean => {
  if (typeof window === "undefined" || !address) return false

  const today = new Date().toDateString()
  const key = `pizza_entry_${address}_${today}`
  return localStorage.getItem(key) === "true"
}

// Record player entry for today
export const recordPlayerEntry = (address: string): void => {
  if (typeof window === "undefined" || !address) return

  const today = new Date().toDateString()
  const key = `pizza_entry_${address}_${today}`
  localStorage.setItem(key, "true")
}

// Get player's total toppings
export const getPlayerToppings = (address: string): number => {
  if (typeof window === "undefined" || !address) return 0

  let totalToppings = 0

  // Check daily play entries
  const keys = Object.keys(localStorage)
  keys.forEach((key) => {
    if (key.startsWith("pizza_entry_") && key.includes(address) && localStorage.getItem(key) === "true") {
      totalToppings += 1 // 1 topping per day played
    }
  })

  // Check referral success records
  const referralKey = `pizza_referral_success_${address}`
  const referralRecord = localStorage.getItem(referralKey)
  if (referralRecord) {
    const successRecord = JSON.parse(referralRecord)
    totalToppings += successRecord.length * 2 // 2 toppings per referral
  }

  // Check VMF holdings
  const vmfKey = `pizza_vmf_holdings_${address}`
  const vmfAmount = Number.parseInt(localStorage.getItem(vmfKey) || "0")
  totalToppings += Math.floor(vmfAmount / 10) // 1 topping per 10 VMF

  // Check streak bonuses
  const streakKey = `pizza_streak_${address}`
  const streakDays = Number.parseInt(localStorage.getItem(streakKey) || "0")
  if (streakDays >= 7) {
    totalToppings += 3 // 3 toppings for 7-day streak
  }

  // Check legacy toppings
  const legacyKey = `pizza_toppings_${address}`
  const legacyToppings = Number.parseInt(localStorage.getItem(legacyKey) || "0")
  totalToppings += legacyToppings

  return totalToppings
} 