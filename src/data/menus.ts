import type { MainMenuItem, MenuNavigation } from "~/types";

export const menuMain: MainMenuItem[] = [
  {
    id: "home",
    label: "Home",
    url: "/",
  },
  {
    id: "products",
    label: "Products",
    url: "/products",
  },
  {
    id: "about",
    label: "About",
    url: "/about-us",
  },
  {
    id: "services",
    label: "Services",
    url: "/services",
    submenu: [
      { id: "repairs", label: "Repairs", url: "/services/repairs" },
      { id: "maintenance", label: "Maintenance", url: "/services/maintenance" },
			{ id: "consulting", label: "Consulting", url: "/services/consulting" },
    ],
  }
];

export const menuNavigation: MenuNavigation = {
  prettyName: "Navigation",
  items: [
    { name: "Home", url: "/" },
    { name: "Products", url: "/products" },
    { name: "About Us", url: "/about-us" },
    { name: "Services", url: "/services" }
  ],
};