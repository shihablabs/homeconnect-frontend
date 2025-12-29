"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Step {
  id: number;
  name: string;
}

interface FormStepperProps {
  steps: Step[];
  currentStep: number;
  setCurrentStep: (step: number) => void;
}

export function FormStepper({
  steps,
  currentStep,
  setCurrentStep,
}: FormStepperProps) {
  return (
    <nav aria-label="Progress">
      <ol role="list" className="flex items-center w-full">
        {steps.map((step, stepIdx) => {
          
          
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          const isLastStep = stepIdx === steps.length - 1;

          return (
            <li
              key={step.name}
              className="relative flex flex-col items-center flex-1"
            >
              {}
              {!isLastStep && (
                <div
                  className={cn(
                    "absolute top-3 left-1/2 h-2 w-full z-0",
                    isCompleted
                      ? "bg-gradient-to-r from-primary to-emerald-400"
                      : "bg-gray-200"
                  )}
                />
              )}

              {}
              <button
                type="button"
                onClick={() => isCompleted && setCurrentStep(step.id)}
                className={cn(
                  "relative w-8 h-8 flex items-center justify-center rounded-full border-2 transition-colors duration-200 z-10",
                  isCompleted
                    ? "bg-primary border-primary text-white hover:bg-primary/90"
                    : isCurrent
                      ? "bg-white border-primary"
                      : "bg-white border-gray-300"
                )}
                aria-current={isCurrent ? "step" : undefined}
                disabled={!isCompleted && !isCurrent} 
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : isCurrent ? (
                  <span className="h-2.5 w-2.5 bg-primary rounded-full" />
                ) : (
                  <span className="h-2.5 w-2.5 rounded-full bg-transparent" />
                )}
                <span className="sr-only">{step.name}</span>
              </button>

              {}
              <span
                className={cn(
                  "mt-2 text-xs font-medium text-center",
                  isCompleted || isCurrent ? "text-primary" : "text-gray-500"
                )}
              >
                {step.name}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
