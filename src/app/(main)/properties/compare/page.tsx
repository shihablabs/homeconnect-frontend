"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { propertiesApi } from "@/lib/api/properties-api";
import { clearCompare, removeFromCompare } from "@/redux/features/property/compareSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { PropertyResponse, isRentalResponse } from "@/types/property.types";
import {
  ArrowLeft,
  Bath,
  Bed,
  Bot,
  Brain,
  Ruler,
  ShieldCheck,
  Sparkles,
  Trash2,
  X
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AIComparisonData, AIComparisonTable } from "@/components/properties/AIComparisonTable";

export default function ComparePage() {
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((state) => state.compare);
  const [fullProperties, setFullProperties] = useState<PropertyResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // AI State
  const [selectedPrompt, setSelectedPrompt] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [language, setLanguage] = useState<'english' | 'bangla'>('english');
  const [style, setStyle] = useState<'concise' | 'detailed' | 'professional'>('concise');
  const [aiInsight, setAiInsight] = useState<AIComparisonData | string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Define Preset Prompts
  const RENT_PROMPTS = [
    "Identify the best value for money (Price vs Amenities)",
    "Analyze suitability for a small family",
    "Compare location convenience and commute potential",
    "Highlight potential hidden costs or downsides"
  ];

  const SALE_PROMPTS = [
    "Analyze long-term investment potential & ROI",
    "Compare price per sqft vs market average",
    "Evaluate future growth potential of the location",
    "Assess listing quality and verification status"
  ];

  const currentPrompts = fullProperties.length > 0 && !isRentalResponse(fullProperties[0])
    ? SALE_PROMPTS
    : RENT_PROMPTS;

  const handleGenerateInsight = async () => {
    setAiLoading(true);
    setAiInsight("");

    let instruction = isCustom ? customPrompt : selectedPrompt;
    if (!instruction) instruction = "Provide a general comprehensive comparison.";

    try {
      const { aiService } = await import("@/services/ai-service");
      const insight = await aiService.generateComparisonInsight(fullProperties, instruction, language, style);
      setAiInsight(insight);
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate insights");
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    const fetchFullDetails = async () => {
      if (items.length === 0) {
        setFullProperties([]); // Clear properties if no items
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const ids = items.map((item) => item.id);
        const data = await propertiesApi.compareProperties(ids);

        // Robust check for array data
        const validProperties = Array.isArray(data) ? (data as PropertyResponse[]) : [];
        setFullProperties(validProperties);

        // Sync check: If we have fewer properties than requested, some might have been deleted
        if (validProperties.length < ids.length) {
          const returnedIds = new Set(validProperties.map(p => p.id));
          const missingIds = ids.filter(id => !returnedIds.has(id));

          if (missingIds.length > 0) {
            console.log("Removing stale properties from comparison:", missingIds);
            missingIds.forEach(id => dispatch(removeFromCompare(id)));
            // Toast removed items notification if needed, or just silently clean up
            if (missingIds.length > 0) {
              toast.info(`${missingIds.length} property(s) were no longer available and removed from comparison.`);
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch comparison details:", err);
        toast.error("Failed to load property details");
        // Optional: clear specific items if error implies 404, but API generalized error handling is tricky here
      } finally {
        setLoading(false);
      }
    };

    fetchFullDetails();
  }, [items, dispatch]);

  if (items.length === 0) {
    return (
      <div className="container mx-auto py-20 px-4 text-center">
        <div className="max-w-md mx-auto space-y-6">
          <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
            <ArrowLeft className="h-8 w-8 text-gray-300" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">No Properties to Compare</h1>
          <p className="text-gray-500">Add up to 3 properties from the listings to see them side-by-side.</p>
          <Link href="/properties">
            <Button size="lg" className="rounded-xl font-bold px-8 mt-4">
              Browse Properties
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const attributes = [
    { label: "Price", getValue: (p: PropertyResponse) => isRentalResponse(p) ? `৳${(p.rentPrice || 0).toLocaleString()}/mo` : `৳${(p.salePrice || 0).toLocaleString()} (Total)` },
    { label: "Location", getValue: (p: PropertyResponse) => `${p.neighborhood || 'N/A'}, ${p.city || 'N/A'}` },
    { label: "Type", getValue: (p: PropertyResponse) => (p.propertyType || '').charAt(0).toUpperCase() + (p.propertyType || '').slice(1) },
    { label: "Listing", getValue: (p: PropertyResponse) => (p.listingType || '').toUpperCase() },
    { label: "Bedrooms", getValue: (p: PropertyResponse) => p.bedrooms || 0, icon: <Bed className="h-4 w-4" /> },
    { label: "Bathrooms", getValue: (p: PropertyResponse) => p.bathrooms || 0, icon: <Bath className="h-4 w-4" /> },
    { label: "Area", getValue: (p: PropertyResponse) => `${p.areaSize || 0} ${p.areaUnit || ''}`, icon: <Ruler className="h-4 w-4" /> },
    { label: "Status", getValue: (p: PropertyResponse) => <Badge variant="outline" className="capitalize">{p.status || 'N/A'}</Badge> },
    { label: "Verified", getValue: (p: PropertyResponse) => p.isVerified ? <ShieldCheck className="h-5 w-5 text-emerald-500" /> : <X className="h-5 w-5 text-gray-300" /> },
  ];

  // Unique amenities across all properties
  const allAmenities = Array.from(new Set(fullProperties.flatMap(p => p.amenities || [])));

  return (
    <div className="container mx-auto py-12 px-4 space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <Link href="/properties" className="text-sm font-bold text-primary flex items-center gap-2 hover:underline mb-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Listings
          </Link>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Compare Properties</h1>
          <p className="text-gray-500 font-medium">Detailed side-by-side analysis of your top choices</p>
        </div>
        <Button
          variant="outline"
          onClick={() => dispatch(clearCompare())}
          className="rounded-xl border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200 gap-2 font-bold"
        >
          <Trash2 className="h-4 w-4" />
          Clear Comparison
        </Button>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto rounded-3xl border shadow-xl bg-card">
        <table className="w-full border-collapse min-w-[800px]">
          <thead>
            <tr>
              <th className="p-6 text-left bg-muted/30 w-[200px] border-b border-r align-top sticky left-0 z-20 bg-background/95 backdrop-blur">
                <span className="text-xs font-black uppercase text-gray-400 tracking-widest">Properties</span>
              </th>
              {loading
                ? Array.from({ length: items.length }).map((_, i) => (
                  <th key={i} className="p-6 border-b min-w-[300px] w-1/3">
                    <div className="h-[300px] animate-pulse bg-gray-100 rounded-2xl" />
                  </th>
                ))
                : fullProperties.map((property) => (
                  <th key={property.id} className="p-6 border-b text-left min-w-[300px] w-1/3 align-top relative group">
                    <div className="space-y-4">
                      <Button
                        size="icon"
                        variant="destructive"
                        className="absolute top-4 right-4 z-10 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        onClick={() => dispatch(removeFromCompare(property.id))}
                      >
                        <X className="h-4 w-4" />
                      </Button>

                      <div className="aspect-[4/3] relative rounded-2xl overflow-hidden shadow-sm">
                        <CompareCardImage property={property} />
                      </div>

                      <div className="space-y-2">
                        <h3 className="font-extrabold text-lg line-clamp-2 text-gray-900">
                          {property.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          <Badge className={isRentalResponse(property) ? "bg-orange-100 text-orange-700 hover:bg-orange-100" : "bg-blue-100 text-blue-700 hover:bg-blue-100"}>
                            {isRentalResponse(property) ? "For Rent" : "For Sale"}
                          </Badge>
                          {property.isVerified && (
                            <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50 gap-1">
                              <ShieldCheck className="h-3 w-3" /> Verified
                            </Badge>
                          )}
                        </div>
                        <p className="text-2xl font-black text-primary">
                          {isRentalResponse(property) ? `৳${(property.rentPrice || 0).toLocaleString()}/mo` : `৳${(property.salePrice || 0).toLocaleString()}`}
                        </p>
                        <Link href={`/properties/${property.id}`} className="block pt-2">
                          <Button className="w-full rounded-xl font-bold" variant="outline">View Full Details</Button>
                        </Link>
                      </div>
                    </div>
                  </th>
                ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {attributes.map((attr, idx) => (
              <tr key={attr.label} className={idx % 2 === 0 ? "bg-muted/10" : ""}>
                <td className="p-6 font-bold text-sm text-gray-500 bg-muted/30 border-r sticky left-0 bg-background/95 backdrop-blur z-10">
                  <div className="flex items-center gap-2">
                    {attr.icon && <span className="text-primary">{attr.icon}</span>}
                    {attr.label}
                  </div>
                </td>
                {loading
                  ? Array.from({ length: 3 }).map((_, i) => <td key={i} className="p-6"><div className="h-4 bg-gray-100 rounded w-24" /></td>)
                  : fullProperties.map(property => (
                    <td key={property.id} className="p-6 text-sm font-semibold text-gray-800">
                      {attr.getValue(property)}
                    </td>
                  ))
                }
              </tr>
            ))}

            {/* Amenities Row */}
            <tr>
              <td className="p-6 font-bold text-sm text-gray-500 bg-muted/30 border-r sticky left-0 bg-background/95 backdrop-blur z-10 align-top">
                Amenities
              </td>
              {loading
                ? Array.from({ length: 3 }).map((_, i) => <td key={i} className="p-6"><div className="h-20 bg-gray-100 rounded" /></td>)
                : fullProperties.map(property => (
                  <td key={property.id} className="p-6 align-top">
                    <div className="flex flex-wrap gap-2">
                      {allAmenities.map(amenity => (
                        <div
                          key={amenity}
                          className={`px-2 py-1 rounded text-[10px] font-bold border ${property.amenities?.includes(amenity)
                            ? "bg-emerald-50/50 border-emerald-100 text-emerald-700"
                            : "bg-gray-50 border-gray-100 text-gray-300 line-through"
                            }`}
                        >
                          {amenity}
                        </div>
                      ))}
                    </div>
                  </td>
                ))
              }
            </tr>
          </tbody>
        </table>
      </div>

      {/* AI Analysis Section - Bottom Placement */}
      <div className="rounded-3xl border shadow-2xl bg-white overflow-hidden">
        <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-3xl font-black flex items-center gap-3 mb-2">
              <Sparkles className="h-8 w-8 text-yellow-300" />
              AI Smart Comparison
            </h2>
            <p className="text-indigo-100 font-medium text-lg max-w-2xl">
              Use advanced AI to analyze these properties. Select a goal or write your own prompt for a personalized recommendation.
            </p>
          </div>
        </div>

        <div className="p-8 grid lg:grid-cols-12 gap-10">
          {/* Controls */}
          <div className="lg:col-span-4 space-y-6">
            <div className="space-y-4">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-widest">
                Select Analysis Goal
              </label>

              <div className="space-y-3">
                {currentPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => { setSelectedPrompt(prompt); setIsCustom(false); }}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all font-bold text-sm ${!isCustom && selectedPrompt === prompt
                      ? "border-violet-600 bg-violet-50 text-violet-700 shadow-sm"
                      : "border-gray-100 hover:border-violet-200 hover:bg-gray-50 text-gray-600"
                      }`}
                  >
                    {prompt}
                  </button>
                ))}

                <button
                  onClick={() => setIsCustom(true)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all font-bold text-sm flex items-center gap-2 ${isCustom
                    ? "border-violet-600 bg-violet-50 text-violet-700 shadow-sm"
                    : "border-gray-100 hover:border-violet-200 hover:bg-gray-50 text-gray-600"
                    }`}
                >
                  <span className="flex-1">Write Custom Prompt...</span>
                  {isCustom && <div className="h-2 w-2 rounded-full bg-violet-600" />}
                </button>
              </div>
            </div>

            {isCustom && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="E.g., Which property is closer to the best schools?"
                  className="w-full rounded-xl border-gray-200 text-sm focus:ring-violet-600 focus:border-violet-600 p-4 min-h-[120px] shadow-inner font-medium resize-none"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as any)}
                  className="w-full rounded-xl border-gray-200 text-sm font-bold p-3 bg-gray-50 hover:bg-white transition-colors border-2 focus:border-violet-600 focus:ring-0"
                >
                  <option value="english">English (US)</option>
                  <option value="bangla">Bangla (BD)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Style</label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value as any)}
                  className="w-full rounded-xl border-gray-200 text-sm font-bold p-3 bg-gray-50 hover:bg-white transition-colors border-2 focus:border-violet-600 focus:ring-0"
                >
                  <option value="concise">Concise</option>
                  <option value="detailed">Detailed</option>
                  <option value="professional">Professional</option>
                </select>
              </div>
            </div>

            <Button
              onClick={handleGenerateInsight}
              disabled={aiLoading || (isCustom && !customPrompt) || (!isCustom && !selectedPrompt)}
              className="w-full h-14 text-lg rounded-xl font-black bg-gray-900 hover:bg-black text-white shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {aiLoading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin"><Sparkles className="h-5 w-5" /></span> Analyzing...
                </span>
              ) : (
                <span className="flex items-center gap-2 justify-center">
                  <Brain className="h-5 w-5" /> Generate Analysis
                </span>
              )}
            </Button>
          </div>

          {/* Result Area */}
          <div className="lg:col-span-8">
            {aiInsight && !aiLoading && typeof aiInsight === 'string' && (
              <div className="p-8 text-center text-red-500 font-bold bg-red-50 rounded-2xl">
                {aiInsight}
              </div>
            )}

            {aiInsight && !aiLoading && typeof aiInsight !== 'string' && (
              <AIComparisonTable data={aiInsight as any} isLoading={false} />
            )}

            {/* Loading skeleton handled by table component or custom here if needed */}
            {aiLoading && <AIComparisonTable data={null} isLoading={true} />}

            {!aiInsight && !aiLoading && (
              <div className="h-full min-h-[400px] flex items-center justify-center text-center p-8 text-gray-400 bg-gray-50 border border-gray-100 rounded-3xl">
                <div className="space-y-4 flex flex-col items-center">
                  <Bot className="h-20 w-20 text-gray-200" />
                  <p className="font-medium">Select a goal and click generate to see AI insights here.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CompareCardImage({ property }: { property: PropertyResponse }) {
  // Use state but sync with property change or just rely on key/prop updates
  // Better approach here: use a simple effect or just standard handling
  // If property changes, we want src to reset to property.images[0]
  const [src, setSrc] = useState(property.images?.[0] || "/placeholder-property.jpg");

  // Reset src when property.id or images change
  useEffect(() => {
    setSrc(property.images?.[0] || "/placeholder-property.jpg");
  }, [property.id, property.images]);

  return (
    <Image
      src={src}
      alt={property.title}
      fill
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      className="object-cover"
      onError={() => setSrc("/placeholder-property.jpg")}
    />
  );
}
