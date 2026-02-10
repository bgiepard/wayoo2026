interface Props {
  className?: string;
}

export default function CloseIcon({ className }: Props) {
  return (
    <svg className={className} width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path
        d="M10.75 10.75L5.75001 5.75001M5.75001 5.75001L0.75 0.75M5.75001 5.75001L10.75 0.75M5.75001 5.75001L0.75 10.75"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
