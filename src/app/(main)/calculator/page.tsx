"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Calculator, Calendar, DollarSign, HelpCircle, Info, Percent, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";

interface AmortizationEntry {
  month: number;
  principal: number;
  interest: number;
  balance: number;
  emi: number;
}

export default function EMICalculatorPage() {
  const [loanAmount, setLoanAmount] = useState<number>(5000000);
  const [interestRate, setInterestRate] = useState<number>(8.5);
  const [loanTenure, setLoanTenure] = useState<number>(20);
  const [showAmortization, setShowAmortization] = useState<boolean>(false);

  // Calculate EMI using the formula: EMI = [P x R x (1+R)^N] / [(1+R)^N - 1]
  const calculateEMI = useMemo(() => {
    const principal = loanAmount;
    const monthlyRate = interestRate / 12 / 100;
    const numberOfMonths = loanTenure * 12;

    if (monthlyRate === 0) {
      return principal / numberOfMonths;
    }

    const emi =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfMonths)) /
      (Math.pow(1 + monthlyRate, numberOfMonths) - 1);

    return emi;
  }, [loanAmount, interestRate, loanTenure]);

  const totalAmount = useMemo(() => {
    return calculateEMI * loanTenure * 12;
  }, [calculateEMI, loanTenure]);

  const totalInterest = useMemo(() => {
    return totalAmount - loanAmount;
  }, [totalAmount, loanAmount]);

  // Generate amortization schedule
  const amortizationSchedule = useMemo(() => {
    const schedule: AmortizationEntry[] = [];
    let balance = loanAmount;
    const monthlyRate = interestRate / 12 / 100;
    const numberOfMonths = loanTenure * 12;

    for (let month = 1; month <= numberOfMonths; month++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = calculateEMI - interestPayment;
      balance -= principalPayment;

      schedule.push({
        month,
        principal: principalPayment,
        interest: interestPayment,
        balance: Math.max(0, balance),
        emi: calculateEMI,
      });
    }

    return schedule;
  }, [loanAmount, interestRate, loanTenure, calculateEMI]);

  const principalPercentage = useMemo(() => {
    return (loanAmount / totalAmount) * 100;
  }, [loanAmount, totalAmount]);

  const interestPercentage = useMemo(() => {
    return (totalInterest / totalAmount) * 100;
  }, [totalInterest, totalAmount]);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 md:py-12">
      {/* Hero Section */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Calculator className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
            EMI Calculator
          </h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Calculate your Equated Monthly Installment (EMI) for home loans with detailed breakdown and amortization schedule.
          Plan your property purchase with confidence.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Input Form */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-blue-600" />
                Loan Details
              </CardTitle>
              <CardDescription>Enter your loan information to calculate EMI</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Loan Amount */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="loanAmount" className="flex items-center gap-2">
                    Loan Amount (BDT)
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>
                            The total amount you want to borrow from the bank or financial institution. This is the principal amount of your loan.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <Badge variant="outline" className="font-mono">
                    {loanAmount.toLocaleString("en-BD")} ৳
                  </Badge>
                </div>
                <Slider
                  value={[loanAmount]}
                  onValueChange={(value) => setLoanAmount(value[0])}
                  min={100000}
                  max={50000000}
                  step={50000}
                  className="w-full"
                />
                <div className="flex items-center gap-2">
                  <Input
                    id="loanAmount"
                    type="number"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                    min={100000}
                    max={50000000}
                    step={50000}
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground">৳</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1 Lakh</span>
                  <span>5 Crore</span>
                </div>
              </div>

              {/* Interest Rate */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="interestRate" className="flex items-center gap-2">
                    Interest Rate (% per annum)
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>
                            The annual interest rate charged by the lender. This rate determines how much interest you&apos;ll pay over the loan tenure.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <Badge variant="outline" className="font-mono">
                    {interestRate.toFixed(2)}%
                  </Badge>
                </div>
                <Slider
                  value={[interestRate]}
                  onValueChange={(value) => setInterestRate(value[0])}
                  min={5}
                  max={20}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex items-center gap-2">
                  <Input
                    id="interestRate"
                    type="number"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    min={5}
                    max={20}
                    step={0.1}
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>5%</span>
                  <span>20%</span>
                </div>
              </div>

              {/* Loan Tenure */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="loanTenure" className="flex items-center gap-2">
                    Loan Tenure (Years)
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>
                            The total duration of your loan in years. Longer tenures result in lower EMI but higher total interest paid.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <Badge variant="outline" className="font-mono">
                    {loanTenure} Years
                  </Badge>
                </div>
                <Slider
                  value={[loanTenure]}
                  onValueChange={(value) => setLoanTenure(value[0])}
                  min={1}
                  max={30}
                  step={1}
                  className="w-full"
                />
                <div className="flex items-center gap-2">
                  <Input
                    id="loanTenure"
                    type="number"
                    value={loanTenure}
                    onChange={(e) => setLoanTenure(Number(e.target.value))}
                    min={1}
                    max={30}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground">Years</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1 Year</span>
                  <span>30 Years</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Tips */}
          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-600" />
                Quick Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2 text-muted-foreground">
              <p>• Lower interest rates reduce your total payment</p>
              <p>• Shorter tenure = Higher EMI but less interest</p>
              <p>• EMI should not exceed 40% of your monthly income</p>
              <p>• Consider prepayment options to save interest</p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-2 space-y-6">
          {/* EMI Result Card */}
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-blue-600" />
                Your EMI
              </CardTitle>
              <CardDescription>Equated Monthly Installment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-2">
                  ৳ {calculateEMI.toLocaleString("en-BD", { maximumFractionDigits: 0 })}
                </div>
                <p className="text-muted-foreground">per month for {loanTenure} years</p>
              </div>
            </CardContent>
          </Card>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Total Amount
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  ৳ {totalAmount.toLocaleString("en-BD", { maximumFractionDigits: 0 })}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Principal + Interest
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Total Interest
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  ৳ {totalInterest.toLocaleString("en-BD", { maximumFractionDigits: 0 })}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Interest over {loanTenure} years
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Total Payments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {loanTenure * 12}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Monthly installments
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Breakdown Visualization */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="h-5 w-5 text-blue-600" />
                Payment Breakdown
              </CardTitle>
              <CardDescription>Principal vs Interest distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Visual Bar */}
                <div className="relative h-12 rounded-lg overflow-hidden border">
                  <div
                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-600 to-blue-500 flex items-center justify-center text-white font-semibold text-sm"
                    style={{ width: `${principalPercentage}%` }}
                  >
                    {principalPercentage > 15 && `${principalPercentage.toFixed(1)}%`}
                  </div>
                  <div
                    className="absolute right-0 top-0 h-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm"
                    style={{ width: `${interestPercentage}%` }}
                  >
                    {interestPercentage > 15 && `${interestPercentage.toFixed(1)}%`}
                  </div>
                </div>

                {/* Legend */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded bg-gradient-to-r from-blue-600 to-blue-500"></div>
                    <div>
                      <p className="text-sm font-medium">Principal Amount</p>
                      <p className="text-xs text-muted-foreground">
                        ৳ {loanAmount.toLocaleString("en-BD")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded bg-gradient-to-r from-cyan-500 to-blue-600"></div>
                    <div>
                      <p className="text-sm font-medium">Total Interest</p>
                      <p className="text-xs text-muted-foreground">
                        ৳ {totalInterest.toLocaleString("en-BD")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Amortization Schedule */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    Amortization Schedule
                  </CardTitle>
                  <CardDescription>
                    Year-by-year breakdown of principal and interest payments
                  </CardDescription>
                </div>
                <button
                  onClick={() => setShowAmortization(!showAmortization)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {showAmortization ? "Hide" : "Show"} Details
                </button>
              </div>
            </CardHeader>
            <CardContent>
              {showAmortization ? (
                <div className="overflow-x-auto">
                  <div className="max-h-96 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-gray-50 border-b">
                        <tr>
                          <th className="text-left p-2 font-semibold">Month</th>
                          <th className="text-right p-2 font-semibold">EMI</th>
                          <th className="text-right p-2 font-semibold">Principal</th>
                          <th className="text-right p-2 font-semibold">Interest</th>
                          <th className="text-right p-2 font-semibold">Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {amortizationSchedule.map((entry, index) => (
                          <tr
                            key={entry.month}
                            className={`border-b hover:bg-gray-50 ${index % 12 === 0 ? "bg-blue-50/50" : ""
                              }`}
                          >
                            <td className="p-2">{entry.month}</td>
                            <td className="p-2 text-right font-mono">
                              ৳ {entry.emi.toLocaleString("en-BD", { maximumFractionDigits: 0 })}
                            </td>
                            <td className="p-2 text-right font-mono text-blue-600">
                              ৳ {entry.principal.toLocaleString("en-BD", { maximumFractionDigits: 0 })}
                            </td>
                            <td className="p-2 text-right font-mono text-purple-600">
                              ৳ {entry.interest.toLocaleString("en-BD", { maximumFractionDigits: 0 })}
                            </td>
                            <td className="p-2 text-right font-mono text-muted-foreground">
                              ৳ {entry.balance.toLocaleString("en-BD", { maximumFractionDigits: 0 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Click &quot;Show Details&quot; to view the complete amortization schedule</p>
                  <p className="text-xs mt-2">
                    This shows how each payment is split between principal and interest over time
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

