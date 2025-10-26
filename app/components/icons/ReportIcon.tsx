export default function ReportIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      {/* Document outline */}
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 3.75h11.25L19.5 8.25v12a1.5 1.5 0 01-1.5 1.5H6a1.5 1.5 0 01-1.5-1.5V5.25a1.5 1.5 0 011.5-1.5z"
      />
      {/* Chart bars */}
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 17.25v-4.5M12.75 17.25v-7.5M16.5 17.25v-3"
      />
    </svg>
  );
}
