"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowUpRight,
  Building2,
  DollarSign,
  Home,
  Info,
  MapPin,
  TrendingUp,
  Wallet
} from "lucide-react";
import { useState } from "react";

interface TrendData {
  area: string;
  price: string;
  change: number;
  trend: "up" | "down" | "stable";
  propertyType: string;
  demand?: "High" | "Medium" | "Low";
}


const saleTrends: TrendData[] = [
  { area: "Gulshan", price: "৳ 25,000 - 35,000/sqft", change: 8.5, trend: "up", propertyType: "Luxury Apt", demand: "High" },
  { area: "Banani", price: "৳ 22,000 - 30,000/sqft", change: 6.2, trend: "up", propertyType: "Luxury Apt", demand: "High" },
  { area: "Dhanmondi", price: "৳ 14,000 - 20,000/sqft", change: 5.8, trend: "up", propertyType: "Apartment", demand: "High" },
  { area: "Bashundhara R/A", price: "৳ 10,000 - 18,000/sqft", change: 7.5, trend: "up", propertyType: "Apartment", demand: "High" },
  { area: "Uttara", price: "৳ 8,000 - 14,000/sqft", change: 4.3, trend: "up", propertyType: "Apartment", demand: "Medium" },
  { area: "Mirpur", price: "৳ 5,500 - 9,500/sqft", change: 3.1, trend: "stable", propertyType: "Apartment", demand: "High" },
];


const rentTrends: TrendData[] = [
  { area: "Gulshan", price: "৳ 80k - 300k+/mo", change: 5.5, trend: "up", propertyType: "3 Beds Furnished", demand: "High" },
  { area: "Banani", price: "৳ 60k - 200k/mo", change: 4.8, trend: "up", propertyType: "3 Beds Furnished", demand: "High" },
  { area: "Dhanmondi", price: "৳ 35k - 100k/mo", change: 3.2, trend: "stable", propertyType: "3 Beds Unfurnished", demand: "Medium" },
  { area: "Bashundhara R/A", price: "৳ 25k - 80k/mo", change: 6.0, trend: "up", propertyType: "3 Beds Unfurnished", demand: "High" },
  { area: "Uttara", price: "৳ 20k - 60k/mo", change: 2.5, trend: "stable", propertyType: "3 Beds Unfurnished", demand: "Medium" },
  { area: "Mirpur", price: "৳ 15k - 40k/mo", change: 1.8, trend: "up", propertyType: "2-3 Beds", demand: "High" },
];

const saleInsights = [
  {
    title: "Premium Sector Growth",
    description: "Gulshan and Banani prices have surged by ~8% due to scarcity of land and high demand for luxury condos.",
    impact: "positive",
  },
  {
    title: "Infrastructure Impact",
    description: "Metro Rail connectivity has boosted property values in Uttara and Mirpur, making them attractive for mid-range buyers.",
    impact: "positive",
  },
  {
    title: "Construction Costs",
    description: "Rising material costs (cement, steel) are pushing developer prices up by 15-20% for new projects.",
    impact: "negative",
  }
];

const rentInsights = [
  {
    title: "Expat Demand in Tri-State",
    description: "Gulshan, Banani, and Baridhara continue to command high rents driven by diplomats and MNC executives.",
    impact: "positive",
  },
  {
    title: "Student Housing",
    description: "Bashundhara R/A sees consistently high rental demand due to proximity to major universities (NSU, IUB).",
    impact: "positive",
  },
  {
    title: "Affordable Options",
    description: "Mirpur remains the go-to for budget-friendly family rentals, with good connectivity to central Dhaka.",
    impact: "neutral",
  }
];

export default function MarketTrendsPage() {
  const [activeTab, setActiveTab] = useState("sale");

  return (
    <div className="container mx-auto max-w-7xl px-4 pb-16 pt-5">
      {}
      <PageHeader
        title="Market Trends"
        description="Stay informed with the latest real estate market trends, property prices, and investment insights across Dhaka."
        badge="Analytics"
        className="pt-0 pb-8 bg-transparent"
      />
      <div className="-mt-6 mb-8 flex justify-center text-sm text-muted-foreground">
        <div className="flex items-center gap-2 bg-background px-4 py-1 rounded-full border shadow-sm">
          <Info className="h-4 w-4" />
          <span>Data estimates for 2024-2025 • Updated: {new Date().toLocaleDateString("en-BD", { month: "long", year: "numeric" })}</span>
        </div>
      </div>

      <Tabs defaultValue="sale" onValueChange={setActiveTab} className="mb-8">
        <div className="flex justify-center mb-8">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="sale">For Buyers (Sale)</TabsTrigger>
            <TabsTrigger value="rent">For Renters (Rent)</TabsTrigger>
          </TabsList>
        </div>

        {}
        <TabsContent value="sale" className="space-y-6">
          {}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  Avg. Price Growth
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600 mb-1">+7.5%</div>
                <p className="text-xs text-muted-foreground">Year-over-Year</p>
                <div className="mt-2 flex items-center gap-1 text-green-600 text-sm">
                  <ArrowUpRight className="h-3 w-3" />
                  <span>Strong appreciation</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-purple-600" />
                  Avg. Price/Sqft
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600 mb-1">৳ 12k - 25k</div>
                <p className="text-xs text-muted-foreground">Prime Areas Dhaka</p>
                <div className="mt-2 flex items-center gap-1 text-blue-600 text-sm">
                  <Info className="h-3 w-3" />
                  <span>Varies by location</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Home className="h-4 w-4 text-green-600" />
                  Buyer Demand
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 mb-1">High</div>
                <p className="text-xs text-muted-foreground">Especially mid-range</p>
                <div className="mt-2 flex items-center gap-1 text-green-600 text-sm">
                  <ArrowUpRight className="h-3 w-3" />
                  <span>Search volume up 18%</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    Dhaka Property Prices (Buying)
                  </CardTitle>
                  <CardDescription>Estimated price per square foot in top locations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {saleTrends.map((trend, index) => (
                      <div key={index} className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-base">{trend.area}</h3>
                            <Badge variant="secondary" className="text-[10px] h-5">{trend.propertyType}</Badge>
                          </div>
                          <p className="text-sm font-medium text-blue-600">{trend.price}</p>
                        </div>
                        <div className="text-right">
                          <div className={`flex items-center justify-end gap-1 ${trend.trend === 'up' ? 'text-green-600' : 'text-gray-600'}`}>
                            {trend.trend === 'up' ? <ArrowUpRight className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
                            <span className="font-bold">{trend.change > 0 ? '+' : ''}{trend.change}%</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">Annual Growth</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-blue-600" />
                    Market Insights (Sale)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {saleInsights.map((insight, index) => (
                    <div key={index} className={`p-4 rounded-lg border-l-4 ${insight.impact === "positive" ? "border-green-500 bg-green-50/50" : "border-red-500 bg-red-50/50"}`}>
                      <h3 className="font-semibold mb-1 text-sm">{insight.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{insight.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {}
              <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200">
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <Wallet className="h-8 w-8 text-indigo-600 shrink-0" />
                    <div>
                      <h4 className="font-bold text-indigo-900 mb-1">Investment Tip</h4>
                      <p className="text-xs text-indigo-800/80">
                        Emerging areas like <strong>Purbachal</strong> and <strong>Bosila</strong> offer lower entry points with high appreciation potential over the next 5-10 years.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {}
        <TabsContent value="rent" className="space-y-6">
          {}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-emerald-600" />
                  Avg. Rental Yield
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-600 mb-1">4% - 6%</div>
                <p className="text-xs text-muted-foreground">Annual ROI on Property</p>
                <div className="mt-2 flex items-center gap-1 text-emerald-700 text-sm">
                  <Info className="h-3 w-3" />
                  <span>Stable returns</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-orange-600" />
                  Rent Increase
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600 mb-1">+6.2%</div>
                <p className="text-xs text-muted-foreground">Avg. rent hike in 2024</p>
                <div className="mt-2 flex items-center gap-1 text-orange-700 text-sm">
                  <ArrowUpRight className="h-3 w-3" />
                  <span>Driven by inflation</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-blue-600" />
                  Hot Locations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600 mb-1">Bashundhara</div>
                <p className="text-xs text-muted-foreground">Most searched for rent</p>
                <div className="mt-2 flex items-center gap-1 text-blue-700 text-sm">
                  <TrendingUp className="h-3 w-3" />
                  <span>High student demand</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-emerald-600" />
                    Dhaka Rental Rates
                  </CardTitle>
                  <CardDescription>Estimated monthly rent (standard listings)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {rentTrends.map((trend, index) => (
                      <div key={index} className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-base">{trend.area}</h3>
                            <Badge variant="outline" className="text-[10px] h-5 bg-gray-50">{trend.propertyType}</Badge>
                          </div>
                          <p className="text-sm font-medium text-emerald-600">{trend.price}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex flex-col items-end">
                            <Badge className={`${trend.demand === 'High' ? 'bg-orange-100 text-orange-700 hover:bg-orange-100' : 'bg-blue-100 text-blue-700 hover:bg-blue-100'}`}>
                              {trend.demand} Demand
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1.5 flex items-center justify-end gap-1">
                            <ArrowUpRight className="h-3 w-3" /> {trend.change}% YoY
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-emerald-600" />
                    Rental Market Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {rentInsights.map((insight, index) => (
                    <div key={index} className={`p-4 rounded-lg border-l-4 ${insight.impact === "positive" ? "border-green-500 bg-green-50/50" : "border-gray-500 bg-gray-50/50"}`}>
                      <h3 className="font-semibold mb-1 text-sm">{insight.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{insight.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {}
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <Home className="h-8 w-8 text-green-600 shrink-0" />
                    <div>
                      <h4 className="font-bold text-green-900 mb-1">Renter's Tip</h4>
                      <p className="text-xs text-green-800/80">
                        Negotiate lease terms in <strong>December-January</strong> when turnover is high. Look for unfurnished units in Dhanmondi for better long-term value.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {}
      <Card className="mt-8 bg-yellow-50 border-yellow-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-semibold text-yellow-900 mb-1">Market Data Disclaimer</p>
              <p>
                The market trends and prices shown are estimates based on collected data listings and market analysis for the 2024-2025 period.
                Actual property prices and rents may vary significantly based on specific location (road/sector), building condition, amenities, and negotiation.
                Always consult with a real estate professional before making financial decisions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


