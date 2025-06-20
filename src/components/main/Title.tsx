"use client";
import * as React from "react";
import Typography from "@mui/material/Typography";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import Devider from "@mui/material/Divider";
interface TitleProps {
    title: string;
    breadCrumbs: Array<{
        label: string;
        href: string;
    }>
    active:string
}

export default function Title({ title, breadCrumbs, active }: TitleProps) {
  function handleClick(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    event.preventDefault();
    console.info("You clicked a breadcrumb.");
  }

  return (
    <div>
         <div role="presentation" onClick={handleClick} className="flex md:flex-row flex-col md:gap-6 gap-3">
        <div className=" ">
            <h1 className="text-[24px] font-medium">{title}</h1>
           

           
        </div>
        <div className="flex md:justify-center md:items-center ">
        <Breadcrumbs aria-label="breadcrumb">
    {breadCrumbs.map((crumb, index) => (
      <Link
        key={index}
        underline="hover"
        color="inherit"
        href={crumb.href}
        style={{ fontSize: "12px" }}
      >
        {crumb.label}
      </Link>
    ))}
    <Typography sx={{ color: "text.primary", fontSize: "12px" }}>
      {active}
    </Typography>
      
    </Breadcrumbs>
        </div>


    
   
    </div>
    <div className="mt-4">
    <Devider />

    </div>
    </div>
   
  );
}
