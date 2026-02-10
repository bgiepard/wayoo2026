interface Props {
  className?: string;
}

export default function FacebookIcon({ className }: Props) {
  return (
    <svg className={className} width="12" height="21" viewBox="0 0 12 21" fill="none">
      <path fillRule="evenodd" clipRule="evenodd" d="M7.37577 11.6739H10.4156L10.9865 7.91609H7.37577V5.48274C7.37577 4.45088 7.88498 3.44981 9.50518 3.44981H11.1408V0.246415C11.1408 0.246415 9.64405 0 8.22445 0C5.24636 0 3.30212 1.80191 3.30212 5.05151V7.91609H0V11.6739H3.30212V20.5603C3.96563 20.6681 4.64458 20.7143 5.33895 20.7143C6.03332 20.7143 6.71226 20.6527 7.37577 20.5603V11.6739Z" fill="currentColor"/>
    </svg>
  );
}
