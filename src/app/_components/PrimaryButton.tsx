// components/PrimaryButton.tsx
import * as React from "react";
import { darken } from "@mui/material/styles";
import { Button, ButtonProps } from "@mui/material";
import { SxProps, Theme } from "@mui/material/styles";
import NextLink from "next/link";

type PrimaryButtonProps = Omit<ButtonProps, "variant" | "color" | "size" | "href"> & {
  href: string;            
  label: string;
  width?: number | string;
  height?: number | string;
  rounded?: number;
  bgColor?: string;
  textColor?: string;
  hoverBgColor?: string;
  external?: boolean;
  // sx は ButtonProps 側に既に SxProps<Theme> で入ってるから追加不要
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
  sx,
}: PrimaryButtonProps) {
  const hover = hoverBgColor ?? darken(bgColor, 0.08);

  return (
    <Button
      component={NextLink}
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      variant="contained"
      disableElevation
      startIcon={startIcon}
      endIcon={endIcon}
      sx={{
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
        "&:hover": { bgcolor: hover },
        // 行高や文字の収まりを安定させる
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        ...sx,
      }}
    >
      {label}
    </Button>
  );
}
