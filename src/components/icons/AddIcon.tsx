interface Props {
  className?: string;
}

export default function AddIcon({ className }: Props) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M5 10H10M10 10H15M10 10V15M10 10V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
