"use client";

import { generateComparisonPDF } from "@/lib/pdf/generate-comparison-pdf";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Check, Download, Sparkles, Trophy } from "lucide-react";
import { useMemo } from "react";

export interface AIComparisonData {
  title: string;
  properties: string[];
  features: {
    featureName: string;
    values: string[];
    winnerIndex?: number;
  }[];
  summary: string;
  recommendation: string;
}

interface AIComparisonTableProps {
  data: AIComparisonData | null;
  isLoading: boolean;
}

export function AIComparisonTable({ data, isLoading }: AIComparisonTableProps) {
  const columns = useMemo<ColumnDef<any>[]>(() => {
    if (!data) return [];

    const baseCols: ColumnDef<any>[] = [
      {
        accessorKey: "featureName",
        header: "Feature",
        cell: (info) => (
          <span className="font-bold text-gray-700">{info.getValue() as string}</span>
        ),
      },
    ];

    data.properties.forEach((propName, index) => {
      baseCols.push({
        accessorKey: `value_${index}`, // We will map data to this key
        header: () => <span className="text-violet-700 font-extrabold">{propName}</span>,
        cell: (info) => {
          const row = info.row.original;
          const isWinner = row.winnerIndex === index;
          return (
            <div className={`relative p-2 rounded-lg ${isWinner ? "bg-emerald-50 border border-emerald-100" : ""}`}>
              {isWinner && (
                <div className="absolute -top-3 -right-2">
                  <Trophy className="h-5 w-5 text-emerald-500 fill-emerald-100" />
                </div>
              )}
              <span className={`text-sm ${isWinner ? "font-bold text-emerald-800" : "text-gray-600"}`}>
                {info.getValue() as string}
              </span>
            </div>
          );
        },
      });
    });

    return baseCols;
  }, [data]);

  const tableData = useMemo(() => {
    if (!data) return [];
    return data.features.map((feature) => {
      const row: any = {
        featureName: feature.featureName,
        winnerIndex: feature.winnerIndex,
      };
      feature.values.forEach((val, idx) => {
        row[`value_${idx}`] = val;
      });
      return row;
    });
  }, [data]);

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const tableId = "ai-comparison-result-table";

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-xl space-y-8 animate-pulse">
        <div className="h-8 bg-gray-100 w-1/3 rounded-lg mx-auto" />
        <div className="grid grid-cols-3 gap-4">
          <div className="h-64 bg-gray-50 rounded-2xl col-span-3" />
        </div>
        <div className="h-24 bg-gray-50 rounded-2xl" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div id={tableId} className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden relative">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[rgba(255,255,255,0.1)] rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

        {/* Download Button */}
        {data && (
          <button
            data-html2canvas-ignore="true"
            onClick={() => generateComparisonPDF(data, tableId)}
            className="absolute top-6 right-6 p-2 bg-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.3)] backdrop-blur-md rounded-xl text-white transition-all z-20 group"
            title="Download PDF Report"
          >
            <Download className="h-6 w-6 group-hover:scale-110 transition-transform" />
          </button>
        )}

        <div className="relative z-10 text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-[rgba(255,255,255,0.2)] backdrop-blur-md rounded-2xl mb-4 shadow-inner">
            <Sparkles className="h-8 w-8 text-yellow-300" />
          </div>
          <h2 className="text-3xl font-black tracking-tight">{data.title}</h2>
          <p className="text-indigo-100 font-medium max-w-2xl mx-auto">
            AI-powered balanced analysis based on your criteria.
          </p>
        </div>
      </div>

      <div className="p-8 space-y-10">
        {/* Table */}
        <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="p-4 text-left text-sm font-bold text-gray-500 uppercase tracking-wider">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-100">
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-4 align-top">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary & Recommendation */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-violet-50 rounded-2xl p-6 border border-violet-100">
            <h3 className="text-violet-800 font-black flex items-center gap-2 mb-3">
              <Check className="h-5 w-5" /> Summary
            </h3>
            <p className="text-gray-700 leading-relaxed font-medium">
              {data.summary}
            </p>
          </div>

          <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
            <h3 className="text-emerald-800 font-black flex items-center gap-2 mb-3">
              <Trophy className="h-5 w-5" /> Final Recommendation
            </h3>
            <p className="text-gray-700 leading-relaxed font-medium">
              {data.recommendation}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
