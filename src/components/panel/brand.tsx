/** The Agro Zanjir mark: a sprout, drawn on the brand square. */
const BrandMark = ({ px }: { px?: number }) => (
  <div
    className="brand-mark"
    style={
      px
        ? {
            width: px,
            height: px,
            borderRadius: Math.round(px * 0.28),
            margin: "0 auto",
          }
        : undefined
    }
  >
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="#fff"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={
        px
          ? { width: Math.round(px * 0.54), height: Math.round(px * 0.54) }
          : undefined
      }
      aria-hidden="true"
    >
      <path d="M12 21V9" />
      <path d="M12 9C12 9 12 3 18 3C18 3 18 9 12 9Z" />
      <path d="M12 13C12 13 12 8 6 8C6 8 6 13 12 13Z" />
    </svg>
  </div>
);

export default BrandMark;
