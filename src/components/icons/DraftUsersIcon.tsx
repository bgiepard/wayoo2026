interface Props {
  className?: string;
}

export default function DraftUsersIcon({ className }: Props) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M17.5 16.6666C17.5 15.2152 16.1087 13.9805 14.1667 13.5229M12.5 16.6666C12.5 14.8257 10.2614 13.3333 7.5 13.3333C4.73858 13.3333 2.5 14.8257 2.5 16.6666M12.5 10.8333C14.3409 10.8333 15.8333 9.34091 15.8333 7.49996C15.8333 5.65901 14.3409 4.16663 12.5 4.16663M7.5 10.8333C5.65905 10.8333 4.16667 9.34091 4.16667 7.49996C4.16667 5.65901 5.65905 4.16663 7.5 4.16663C9.34095 4.16663 10.8333 5.65901 10.8333 7.49996C10.8333 9.34091 9.34095 10.8333 7.5 10.8333Z" stroke="#C0C1C5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
