"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import plainLogo from "@/public/web-toast-plain.png";
import burgerImage from "@/public/menu.svg";
import LocaleSwitcher from "./LocaleSwitcher";

const components: { title: string; href: string; description: string }[] = [
  {
    title: "Gaming",
    href: "/gaming",
    description:
      "Gaming News",
  },
  {
    title: "AI",
    href: "/ai",
    description:
      "AI News",
  },
];

export default function Navbar() {
  return (
    <div className="fixed w-full z-10">
      <NavigationMenu className="mx-auto z-10 pt-6 pb-4 px-4 w-full justify-center flex max-w-max">
        <NavigationMenuList
          className="pr-6 pl-8 lg:p-3 p-2 back backdrop-blur-lg rounded-full border-gray-300 border bg-gray-100/50 
">
          <NavigationMenuItem className="mr-5">
            <Link href="/" legacyBehavior passHref>
              <NavigationMenuLink
                className={`${navigationMenuTriggerStyle()} flex flex-row font-bold text-xl`}>
                <p className="hidden md:block">WebToast</p>{" "}
                <Image
                  src={plainLogo}
                  alt="Logo"
                  className="md:size-4 size-7 md:translate-x-[-2px]"
                />
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/#services" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Services
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/#pricing" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Pricing
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          {/* <NavigationMenuItem>
            <Link href="/news" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                AI News
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem> */}
          
          <NavigationMenuItem className="">
            <NavigationMenuTrigger>News</NavigationMenuTrigger>
            <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                {components.map((component) => (
                  <ListItem
                    key={component.title}
                    title={component.title}
                    href={component.href}>
                    {component.description}
                  </ListItem>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/login" legacyBehavior passHref>
              <NavigationMenuLink
                className={`${navigationMenuTriggerStyle()} bg-[#333] text-gray-100 rounded-full text-lg lg:px-[26px] lg:py-[18px] px-[18px] pt-[13px] pb-[15px] hover:bg-[#333]/90 hover:text-gray-100 hover:cursor-pointer`}>
                Log in
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem className="md:hidden">
            <NavigationMenuLink
              className={`${navigationMenuTriggerStyle()} hover:cursor-pointer hover:bg-transparent`}>
              <Image src={burgerImage} alt="Navigation Menu Mobile" />
            </NavigationMenuLink>
          </NavigationMenuItem>
          <LocaleSwitcher />
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}>
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
