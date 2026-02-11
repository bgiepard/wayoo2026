interface Props {
  className?: string;
}

export default function DraftChildSeatIcon({ className }: Props) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M12.5 15.8334C12.5 13.9924 10.2614 12.5 7.5 12.5C4.73858 12.5 2.5 13.9924 2.5 15.8334M15.8333 13.3334V10.8334M15.8333 10.8334V8.33337M15.8333 10.8334H13.3333M15.8333 10.8334H18.3333M7.5 10C5.65905 10 4.16667 8.50766 4.16667 6.66671C4.16667 4.82576 5.65905 3.33337 7.5 3.33337C9.34095 3.33337 10.8333 4.82576 10.8333 6.66671C10.8333 8.50766 9.34095 10 7.5 10Z" stroke="#C0C1C5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
