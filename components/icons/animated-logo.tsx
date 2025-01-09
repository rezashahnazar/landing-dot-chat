import { ComponentProps } from "react";

export default function AnimatedLogo(props: ComponentProps<"svg">) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {/* Background with subtle gradient */}
      <defs>
        <linearGradient id="logoGradient" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0%" stopColor="#000000" />
          <stop offset="100%" stopColor="#1a1a1a" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#logoGradient)">
        <animate
          attributeName="opacity"
          values="0.95;1;0.95"
          dur="3s"
          repeatCount="indefinite"
        />
      </rect>

      {/* Left Rectangle (C-shape) with smooth animation */}
      <path
        d="M7.5 8C7.5 7.44772 7.94772 7 8.5 7H13.5C14.0523 7 14.5 7.44772 14.5 8V9.5C14.5 9.5 11 9.5 11 12V20C11 22.5 14.5 22.5 14.5 22.5V24C14.5 24.5523 14.0523 25 13.5 25H8.5C7.94772 25 7.5 24.5523 7.5 24V8Z"
        fill="#fff"
        opacity="0.95"
      >
        <animate
          attributeName="d"
          dur="2s"
          repeatCount="1"
          values="M7.5 16C7.5 16 7.5 16 8.5 16H13.5C14.5 16 14.5 16 14.5 16V16C14.5 16 11 16 11 16V16C11 16 14.5 16 14.5 16V16C14.5 16 14.5 16 13.5 16H8.5C7.5 16 7.5 16 7.5 16V16Z;
                 M7.5 8C7.5 7.44772 7.94772 7 8.5 7H13.5C14.0523 7 14.5 7.44772 14.5 8V9.5C14.5 9.5 11 9.5 11 12V20C11 22.5 14.5 22.5 14.5 22.5V24C14.5 24.5523 14.0523 25 13.5 25H8.5C7.94772 25 7.5 24.5523 7.5 24V8Z"
        />
      </path>

      {/* Right Rectangle with reveal animation */}
      <rect
        x="17.5"
        y="8"
        width="6"
        height="12"
        rx="1.5"
        stroke="#fff"
        strokeWidth="2"
        opacity="0.85"
      >
        <animate
          attributeName="height"
          values="0;12"
          dur="1s"
          begin="0.5s"
          fill="freeze"
        />
      </rect>

      {/* Cursor with improved blinking */}
      <rect x="17.5" y="23" width="6" height="2" rx="0.75" fill="#fff">
        <animate
          attributeName="opacity"
          values="1;0;1"
          dur="1.4s"
          repeatCount="indefinite"
          keyTimes="0;0.5;1"
          keySplines="0.4 0 0.6 1; 0.4 0 0.6 1"
        />
      </rect>
    </svg>
  );
}
