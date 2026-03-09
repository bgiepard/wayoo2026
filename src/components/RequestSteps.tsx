
interface Props {
  requestId?: string;
  activeStep: number;
  hasAcceptedOffer?: boolean;
}

const steps = [
  { id: 1, label: "Szczegóły zapytania", path: "details" },
  { id: 2, label: "Oferty przewoźników", path: "offers" },
  { id: 3, label: "Potwierdzenie zamówienia", path: "payment" },
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
              <div className={`w-6 h-6 rounded-[8px] flex shrink-0 items-center justify-center text-[16px] font-[600] transition-colors ${
                isActive ? "bg-[#0B298F] text-white" : accessible ? "bg-[#F0F0F1] md:bg-gray-100 text-[#8E8F96] md:text-gray-700" : "bg-[#F0F0F1] md:bg-gray-50 text-[#8E8F96] md:text-gray-400"
              }`}>
                {step.id}
              </div>
              <span className={`font-[13px] w-full ${
                isActive ? "text-[#0B298F] block" : accessible ? "text-gray-600 hidden md:block" : "text-gray-400 hidden md:block"
              }`}>
                {step.label}
              </span>
            </div>
            <div className={`h-1 rounded mt-3 ${isActive ? "w-full bg-[#0B298F]" : "w-6 md:w-full bg-[#F0F0F1] md:bg-gray-200"}`} />
          </div>
        );

        return (
          <div key={step.id} className={`flex items-center ${isActive ? "flex-1" : "w-auto shrink-0"} md:flex-1 md:w-full`}>
            <div className="flex flex-col items-center w-full">{content}</div>
          </div>
        );
      })}
    </div>
  );
}
