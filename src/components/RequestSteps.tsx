import Link from "next/link";

interface Props {
  requestId?: string;
  activeStep: number;
  hasAcceptedOffer?: boolean;
}

const steps = [
  { id: 1, label: "Potwierdź swoje zamówienie", path: "details" },
  { id: 2, label: "Sprawdź oferty przewoźników", path: "offers" },
  { id: 3, label: "Wybierz ofertę i ruszaj w drogę", path: "payment" },
];

export default function RequestSteps({ requestId, activeStep, hasAcceptedOffer = false }: Props) {
  const isAccessible = (stepId: number) => requestId && (stepId < 3 || hasAcceptedOffer);

  return (
    <div className="flex justify-center items-center gap-6 mt-[64px] mb-[96px] w-full">
      {steps.map((step) => {
        const accessible = isAccessible(step.id);
        const isActive = activeStep === step.id;

        const content = (
          <div className="w-full flex-col">
            <div className="flex items-center justify-center gap-[10px]">
              <div className={`w-6 h-6 rounded-[8px] flex shrink-0 items-center justify-center text-[16px] transition-colors ${
                isActive ? "bg-[#0B298F] text-white" : accessible ? "bg-gray-100 text-gray-700" : "bg-gray-50 text-gray-400"
              }`}>
                {step.id}
              </div>
              <span className={`font-[13px] block w-full ${
                isActive ? "text-[#0B298F]" : accessible ? "text-gray-600" : "text-gray-400"
              }`}>
                {step.label}
              </span>
            </div>
            <div className={`w-full h-1 rounded mt-3 ${isActive ? "bg-[#0B298F]" : "bg-gray-200"}`} />
          </div>
        );

        return (
          <div key={step.id} className="flex items-center w-full">
            {accessible ? (
              <Link href={`/request/${requestId}/${step.path}`} className="flex flex-col items-center w-full hover:opacity-80 transition-opacity">
                {content}
              </Link>
            ) : (
              <div className="flex flex-col items-center w-full">{content}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
