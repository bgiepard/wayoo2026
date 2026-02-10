interface Props {
  className?: string;
}

export default function RouteIcon({ className }: Props) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M3.33325 17.5V13.0726M3.33325 13.0726C8.18174 9.28143 11.8181 16.8636 16.6666 13.0724V3.59456C11.8181 7.3857 8.18174 -0.196753 3.33325 3.59439V13.0726Z"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
