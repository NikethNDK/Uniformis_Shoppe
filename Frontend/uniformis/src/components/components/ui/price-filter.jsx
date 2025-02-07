"use client"
import { Slider } from "./slider"
import { Card, CardContent, CardHeader, CardTitle } from "./card"
import { Label } from "./label"
import { Input } from "./input"

export default function PriceFilter({ value, onChange, min, max }) {
  const handleSliderChange = (newValue) => {
    onChange(newValue)
  }

  const handleInputChange = (index, newValue) => {
    const parsed = Number.parseInt(newValue)
    if (isNaN(parsed)) return

    const newRange = [...value]
    newRange[index] = parsed
    onChange(newRange)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filter by Price</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Slider value={value} min={min} max={max} step={100} onValueChange={handleSliderChange} className="mt-6" />
        <div className="flex items-center gap-4">
          <div className="grid gap-2">
            <Label htmlFor="from">From</Label>
            <Input
              id="from"
              type="number"
              value={value[0]}
              onChange={(e) => handleInputChange(0, e.target.value)}
              min={min}
              max={value[1]}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="to">To</Label>
            <Input
              id="to"
              type="number"
              value={value[1]}
              onChange={(e) => handleInputChange(1, e.target.value)}
              min={value[0]}
              max={max}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

