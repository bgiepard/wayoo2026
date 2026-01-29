import Link from "next/link";

interface Step {
  id: number;
  label: string;
  path: string;
}

interface Props {
  requestId: string;
  activeStep: number;
  hasAcceptedOffer: boolean;
}

const steps: Step[] = [
  { id: 1, label: "Szczegoly", path: "details" },
  { id: 2, label: "Oferty", path: "offers" },
  { id: 3, label: "Platnosc", path: "payment" },
];

export default function RequestSteps({ requestId, activeStep, hasAcceptedOffer }: Props) {
  const isStepAccessible = (stepId: number) => {
    if (stepId === 1) return true;
    if (stepId === 2) return true;
    if (stepId === 3) return hasAcceptedOffer;
    return false;
  };

  const renderStepContent = (step: Step, accessible: boolean) => (
    <>
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
          activeStep === step.id
            ? "bg-blue-600 text-white"
            : accessible
            ? "bg-gray-100 text-gray-700"
            : "bg-gray-50 text-gray-400"
        }`}
      >
        {step.id}
      </div>
      <span
        className={`text-xs mt-2 ${
          activeStep === step.id
            ? "text-blue-600 font-medium"
            : accessible
            ? "text-gray-600"
            : "text-gray-400"
        }`}
      >
        {step.label}
      </span>
    </>
  );

  return (
    <div className="flex justify-center items-center gap-4 mb-8 py-6 bg-white rounded-lg shadow-sm">
      {steps.map((step, index) => {
        const accessible = isStepAccessible(step.id);

        return (
          <div key={step.id} className="flex items-center">
            {accessible ? (
              <Link
                href={`/request/${requestId}/${step.path}`}
                className="flex flex-col items-center hover:opacity-80 transition-opacity"
              >
                {renderStepContent(step, accessible)}
              </Link>
            ) : (
              <div className="flex flex-col items-center">
                {renderStepContent(step, accessible)}
              </div>
            )}
            {index < steps.length - 1 && (
              <div
                className={`w-16 h-0.5 mx-4 rounded ${
                  isStepAccessible(step.id + 1) ? "bg-blue-200" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
