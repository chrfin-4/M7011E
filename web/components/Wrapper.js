import React from "react";
import { Box } from "@material-ui/core";

export const Wrapper = ({
  children,
  variant = "regular",
}) => {
  return (
    <Box
      mt={8}
      mx="auto"
      maxWidth={variant === "regular" ? "800px" : "400px"}
      width="100%"
    >
      {children}
    </Box>
  );
};