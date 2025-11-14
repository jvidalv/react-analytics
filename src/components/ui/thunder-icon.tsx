import * as React from "react";
import { SVGProps, Ref, forwardRef } from "react";

const ThunderIcon = (
  props: SVGProps<SVGSVGElement>,
  ref: Ref<SVGSVGElement>,
) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlSpace="preserve"
    width="1em"
    height="1em"
    viewBox="0 0 326.387 326.387"
    fill="currentColor"
    ref={ref}
    {...props}
  >
    <path d="m252.086 178.355-80.932-34.085L231.9 0 74.301 148.018l80.935 34.086-60.749 144.283z" />
  </svg>
);

const ForwardRef = forwardRef(ThunderIcon);

export default ForwardRef;
