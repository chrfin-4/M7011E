import React from "react";
import { Wrapper, WrapperVariant } from "./Wrapper";
import { NavBar } from "./NavBar";

export const Layout = ({ children, variant }) => {
  return (
    <>
      <NavBar />
      {children}
    </>
  );
};