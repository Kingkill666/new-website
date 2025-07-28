"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const SimpleTest = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-900">Simple Test Component</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-green-100 p-4 rounded-lg">
          <p className="text-green-800">This is a simple test component to verify rendering works.</p>
          <p className="text-green-800">If you can see this, the component system is working.</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default SimpleTest 