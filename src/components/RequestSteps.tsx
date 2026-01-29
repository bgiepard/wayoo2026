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
        className={`w-8 h-8 rounded-full flex items-center justify-center border ${
          accessible
            ? "bg-gray-800 text-white border-gray-800"
            : "border-gray-300"
        } ${activeStep === step.id ? "ring-2 ring-offset-2 ring-gray-800" : ""}`}
      >
        {step.id}
      </div>
      <span
        className={`text-sm mt-2 ${
          accessible ? "font-medium" : "text-gray-400"
        }`}
      >
        {step.label}
      </span>
    </>
  );

  return (
    <div className="flex justify-between mb-8 border border-gray-300 p-4">
      {steps.map((step, index) => {
        const accessible = isStepAccessible(step.id);

        return (
          <div key={step.id} className="flex items-center">
            {accessible ? (
              <Link
                href={`/request/${requestId}/${step.path}`}
                className="flex flex-col items-center cursor-pointer"
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
                className={`w-24 h-0.5 mx-4 ${
                  isStepAccessible(step.id + 1) ? "bg-gray-800" : "bg-gray-300"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
