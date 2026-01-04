import type { ComponentPropsWithoutRef } from "react";

type LogoSvgProps = ComponentPropsWithoutRef<"svg"> & { size?: number };

export const LogoSvg = ({ size = 32, ...props }: LogoSvgProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect width="32" height="32" fill="#1a1a1a" rx="6" />
      <text
        x="16"
        y="22"
        fontFamily="Arial, sans-serif"
        fontSize="18"
        fontWeight="bold"
        textAnchor="middle"
        fill="white"
      >
        CH
      </text>
    </svg>
  );
};
