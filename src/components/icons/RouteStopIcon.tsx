interface Props {
  className?: string;
}

export default function RouteStopIcon({ className }: Props) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M3.3335 17.5V13.0726M3.3335 13.0726C8.18198 9.28143 11.8183 16.8636 16.6668 13.0724V3.59456C11.8183 7.3857 8.18198 -0.196753 3.3335 3.59439V13.0726Z"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
