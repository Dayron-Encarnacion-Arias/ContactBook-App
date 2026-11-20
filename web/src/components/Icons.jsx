// Íconos dibujados a mano: mismo trazo (1.75) y caja de 24
function Icon({ children, size = 18, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export const SearchIcon = (p) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4.5 4.5" />
  </Icon>
);

export const PhoneIcon = (p) => (
  <Icon {...p}>
    <path d="M5 4.5h3.2l1.6 4-2.1 1.3a11 11 0 0 0 6.5 6.5l1.3-2.1 4 1.6V19a1.5 1.5 0 0 1-1.6 1.5A16 16 0 0 1 3.5 6.1 1.5 1.5 0 0 1 5 4.5Z" />
  </Icon>
);

export const MailIcon = (p) => (
  <Icon {...p}>
    <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
    <path d="m4 7 8 6 8-6" />
  </Icon>
);

export const PencilIcon = (p) => (
  <Icon {...p}>
    <path d="M15.5 4.5 19.5 8.5 9 19H5v-4L15.5 4.5Z" />
    <path d="m13.5 6.5 4 4" />
  </Icon>
);

export const TrashIcon = (p) => (
  <Icon {...p}>
    <path d="M4.5 7h15" />
    <path d="M9.5 7V4.5h5V7" />
    <path d="M6.5 7 7.5 19.5h9L17.5 7" />
    <path d="M10.5 11v5M13.5 11v5" />
  </Icon>
);

export const PlusIcon = (p) => (
  <Icon {...p}>
    <path d="M12 5v14M5 12h14" />
  </Icon>
);

export const DropIcon = (p) => (
  <Icon {...p}>
    <path d="M12 3.5c3 3.6 6 7 6 10.2a6 6 0 0 1-12 0c0-3.2 3-6.6 6-10.2Z" />
    <path d="M9 14.5a3 3 0 0 0 3 3" />
  </Icon>
);
