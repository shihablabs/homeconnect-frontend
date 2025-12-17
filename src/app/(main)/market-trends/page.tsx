"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowDownRight,
  ArrowUpRight,
  Building2,
  DollarSign,
  Home,
  Info,
  MapPin,
  TrendingUp
} from "lucide-react";

interface TrendData {
  area: string;
  avgPrice: string;
  change: number;
  trend: "up" | "down" | "stable";
  propertyType: string;
}

const marketTrends: TrendData[] = [
  { area: "Gulshan", avgPrice: "৳ 25,000/sqft", change: 8.5, trend: "up", propertyType: "Residential" },
  { area: "Banani", avgPrice: "৳ 22,000/sqft", change: 6.2, trend: "up", propertyType: "Residential" },
  { area: "Dhanmondi", avgPrice: "৳ 18,000/sqft", change: 5.8, trend: "up", propertyType: "Residential" },
  { area: "Uttara", avgPrice: "৳ 15,000/sqft", change: 4.3, trend: "up", propertyType: "Residential" },
  { area: "Mirpur", avgPrice: "৳ 12,000/sqft", change: -2.1, trend: "down", propertyType: "Residential" },
  { area: "Motijheel", avgPrice: "৳ 30,000/sqft", change: 3.5, trend: "up", propertyType: "Commercial" },
];

const propertyTypes = [
  { type: "Apartments", avgPrice: "৳ 15,000/sqft", growth: 7.2, icon: Building2 },
  { type: "Houses", avgPrice: "৳ 20,000/sqft", growth: 5.8, icon: Home },
  { type: "Commercial", avgPrice: "৳ 28,000/sqft", growth: 9.1, icon: Building2 },
];

const marketInsights = [
  {
    title: "Rising Demand in Premium Areas",
    description: "Gulshan and Banani continue to see strong demand with prices increasing by 6-8% annually. The premium residential market remains robust.",
    impact: "positive",
  },
  {
    title: "Affordable Housing Growth",
    description: "Areas like Uttara and Mirpur are becoming popular for first-time buyers, with government initiatives supporting affordable housing.",
    impact: "positive",
  },
  {
    title: "Commercial Real Estate Boom",
    description: "Commercial properties in Motijheel and surrounding business districts are experiencing steady growth, driven by business expansion.",
    impact: "positive",
  },
  {
    title: "Rental Market Stability",
    description: "Rental yields remain stable at 4-6% across major areas, making property investment attractive for long-term returns.",
    impact: "neutral",
  },
];

export default function MarketTrendsPage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 pb-16 pt-5">
      {/* Hero Section */}
      {/* Hero Section */}
      <PageHeader
        title="Market Trends"
        description="Stay informed with the latest real estate market trends, property prices, and investment insights across Bangladesh."
        badge="Analytics"
        className="pt-0 pb-12 bg-transparent"
      />
      <div className="-mt-8 mb-8 flex justify-center text-sm text-muted-foreground">
        <div className="flex items-center gap-2 bg-background px-4 py-1 rounded-full border shadow-sm">
          <Info className="h-4 w-4" />
          <span>Data updated monthly • Last updated: {new Date().toLocaleDateString("en-BD", { month: "long", year: "numeric" })}</span>
        </div>
      </div>

      {/* Market Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              Market Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 mb-1">+6.8%</div>
            <p className="text-xs text-muted-foreground">Average annual growth rate</p>
            <div className="mt-2 flex items-center gap-1 text-green-600 text-sm">
              <ArrowUpRight className="h-3 w-3" />
              <span>Up from last quarter</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-purple-600" />
              Average Price
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600 mb-1">৳ 18,500</div>
            <p className="text-xs text-muted-foreground">Per square foot (avg)</p>
            <div className="mt-2 flex items-center gap-1 text-blue-600 text-sm">
              <Info className="h-3 w-3" />
              <span>Across all areas</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Home className="h-4 w-4 text-green-600" />
              Active Listings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 mb-1">2,450+</div>
            <p className="text-xs text-muted-foreground">Properties available</p>
            <div className="mt-2 flex items-center gap-1 text-green-600 text-sm">
              <ArrowUpRight className="h-3 w-3" />
              <span>Growing inventory</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Area-wise Trends */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                Area-wise Price Trends
              </CardTitle>
              <CardDescription>Property prices and trends across major areas in Dhaka</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {marketTrends.map((trend, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{trend.area}</h3>
                        <Badge variant="outline" className="text-xs">
                          {trend.propertyType}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{trend.avgPrice}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {trend.trend === "up" ? (
                        <div className="flex items-center gap-1 text-green-600">
                          <ArrowUpRight className="h-4 w-4" />
                          <span className="font-semibold">+{trend.change}%</span>
                        </div>
                      ) : trend.trend === "down" ? (
                        <div className="flex items-center gap-1 text-red-600">
                          <ArrowDownRight className="h-4 w-4" />
                          <span className="font-semibold">{trend.change}%</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-gray-600">
                          <span className="font-semibold">Stable</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Market Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-600" />
                Market Insights
              </CardTitle>
              <CardDescription>Key trends and analysis for property investors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {marketInsights.map((insight, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-l-4 ${insight.impact === "positive"
                      ? "border-green-500 bg-green-50/50"
                      : insight.impact === "negative"
                        ? "border-red-500 bg-red-50/50"
                        : "border-blue-500 bg-blue-50/50"
                      }`}
                  >
                    <h3 className="font-semibold mb-2">{insight.title}</h3>
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Property Types & Quick Stats */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                Property Types
              </CardTitle>
              <CardDescription>Average prices by property category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {propertyTypes.map((property, index) => {
                  const Icon = property.icon;
                  return (
                    <div
                      key={index}
                      className="p-4 rounded-lg border bg-gradient-to-br from-white to-gray-50 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-blue-100">
                          <Icon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{property.type}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{property.avgPrice}</p>
                          <div className="flex items-center gap-1 text-green-600 text-sm">
                            <TrendingUp className="h-3 w-3" />
                            <span>+{property.growth}% growth</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Investment Tips */}
          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-600" />
                Investment Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3 text-muted-foreground">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0"></div>
                <p>Premium areas like Gulshan offer stable long-term appreciation</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0"></div>
                <p>Consider rental yield (4-6%) for investment properties</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0"></div>
                <p>Commercial properties show strong growth potential</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0"></div>
                <p>Research infrastructure developments in emerging areas</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quick Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <span className="text-sm text-muted-foreground">Rental Yield</span>
                <span className="font-semibold text-blue-600">4-6%</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <span className="text-sm text-muted-foreground">Avg. ROI</span>
                <span className="font-semibold text-green-600">8-12%</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <span className="text-sm text-muted-foreground">Price per sqft</span>
                <span className="font-semibold text-purple-600">৳ 12K-30K</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <span className="text-sm text-muted-foreground">Market Activity</span>
                <Badge className="bg-green-500">High</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Disclaimer */}
      <Card className="mt-8 bg-yellow-50 border-yellow-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-semibold text-yellow-900 mb-1">Market Data Disclaimer</p>
              <p>
                The market trends and prices shown are estimates based on available data and market analysis. Actual property prices may vary based on location, condition, amenities, and other factors.
                Always consult with a real estate professional before making investment decisions. HomeConnect does not guarantee the accuracy of market trend data.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

