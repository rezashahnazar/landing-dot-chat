import { ComponentProps } from "react";

export default function AnimatedLogo(props: ComponentProps<"svg">) {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {/* Chat bubble base */}
      <path
        d="M8 4C8 2.89543 8.89543 2 10 2H30C31.1046 2 32 2.89543 32 4V22C32 23.1046 31.1046 24 30 24H22L16 30L10 24H10C8.89543 24 8 23.1046 8 22V4Z"
        fill="white"
      >
        <animate
          attributeName="d"
          dur="2s"
          repeatCount="indefinite"
          values="
            M8 4C8 2.89543 8.89543 2 10 2H30C31.1046 2 32 2.89543 32 4V22C32 23.1046 31.1046 24 30 24H22L16 30L10 24H10C8.89543 24 8 23.1046 8 22V4Z;
            M6 6C6 4.89543 6.89543 4 8 4H32C33.1046 4 34 4.89543 34 6V24C34 25.1046 33.1046 26 32 26H24L18 32L12 26H8C6.89543 26 6 25.1046 6 24V6Z;
            M8 4C8 2.89543 8.89543 2 10 2H30C31.1046 2 32 2.89543 32 4V22C32 23.1046 31.1046 24 30 24H22L16 30L10 24H10C8.89543 24 8 23.1046 8 22V4Z"
        />
      </path>

      {/* AI Core Circle */}
      <circle cx="20" cy="13" r="4" fill="black">
        <animate
          attributeName="r"
          values="3;4;3"
          dur="2s"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx="20" cy="13" r="2" fill="white">
        <animate
          attributeName="r"
          values="1.5;2;1.5"
          dur="2s"
          repeatCount="indefinite"
        />
      </circle>

      {/* Building blocks */}
      <rect
        x="14"
        y="18"
        width="12"
        height="4"
        rx="1"
        fill="white"
        opacity="0.8"
      >
        <animate
          attributeName="width"
          values="0;12;12;0"
          dur="2s"
          repeatCount="indefinite"
        />
      </rect>

      <rect
        x="14"
        y="24"
        width="8"
        height="4"
        rx="1"
        fill="white"
        opacity="0.6"
      >
        <animate
          attributeName="width"
          values="0;8;8;0"
          dur="2s"
          begin="0.3s"
          repeatCount="indefinite"
        />
      </rect>
    </svg>
  );
}
