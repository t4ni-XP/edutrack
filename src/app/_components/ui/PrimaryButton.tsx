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
  ...rest
}: PrimaryButtonProps) {
  const hover = hoverBgColor ?? darken(bgColor, 0.08);
  const { type, ...restWithoutType } = rest;
  const styles = {
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
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    px: 2,
    ...sx,
  } satisfies SxProps<Theme>;

  if (href) {
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
        sx={styles}
        {...restWithoutType}
      >
        {label}
      </Button>
    );
  }
  return (
    <Button
      variant="contained"
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
