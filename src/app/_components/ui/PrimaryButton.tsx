// components/PrimaryButton.tsx
import * as React from "react";
import { darken } from "@mui/material/styles";
import { Button, ButtonProps } from "@mui/material";
import { SxProps, Theme } from "@mui/material/styles";
import NextLink from "next/link";

type PrimaryButtonProps = Omit<ButtonProps, "variant" | "color" | "size" | "href"> & {
  label: string;
  href?: string;
  width?: number | string;
  height?: number | string;
  rounded?: number;
  bgColor?: string;
  textColor?: string;
  hoverBgColor?: string;
  external?: boolean;
  variant?: "text" | "outlined" | "contained";
  // 追加：縁取り（ボーダー）
  borderColor?: string;
  borderWidth?: number | string; // 例: 2 or "2px"
  borderStyle?: React.CSSProperties["borderStyle"]; // "solid" | "dashed" など
  hoverBorderColor?: string;

  sx?: SxProps<Theme>;
};

export default function PrimaryButton({
  href,
  label,
  width = "150px",
  height = "50px",
  rounded = 3,
  bgColor = "#3A606E",
  textColor = "#ffffff",
  hoverBgColor,
  external = false,
  startIcon,
  endIcon,
  variant,
  // 追加props
  borderColor,
  borderWidth,
  borderStyle = "solid",
  hoverBorderColor,
  sx,
  ...rest
}: PrimaryButtonProps) {
  const hover = hoverBgColor ?? darken(bgColor, 0.08);
  const { type, ...restWithoutType } = rest;

  const styles: SxProps<Theme> = {
    width,
    height,
    minWidth: width,
    minHeight: height,
    borderRadius: rounded,
    bgcolor: bgColor,
    color: textColor,
    textTransform: "none",
    fontWeight: 700,
    fontSize: 20,
    lineHeight: 1.2,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    px: 2,

    // ▼ ここで枠線を制御（指定があるときだけ反映）
    ...(borderColor ? { borderColor } : {}),
    ...(borderWidth ? { borderWidth } : {}),
    ...(borderStyle ? { borderStyle } : {}),

    "&:hover": {
      bgcolor: hover,
      ...(hoverBorderColor ? { borderColor: hoverBorderColor } : {}),
    },

    ...sx,
  };

  if (href) {
    return (
      <Button
        component={NextLink}
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        variant={variant ?? "contained"}
        disableElevation
        startIcon={startIcon}
        endIcon={endIcon}
        sx={styles}
        {...restWithoutType}
      >
        {label}
      </Button>
    );
  }

  return (
    <Button
      variant={variant ?? "contained"}
      disableElevation
      startIcon={startIcon}
      endIcon={endIcon}
      type={type ?? "button"}
      sx={styles}
      {...restWithoutType}
    >
      {label}
    </Button>
  );
}
