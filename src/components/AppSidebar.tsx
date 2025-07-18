
'use client';

import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarContent,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel
} from "./ui/sidebar";
import {
  LayoutDashboard,
  Shirt,
  Library,
  Sparkles,
  Swords,
  Calendar,
  BarChart2,
  Settings,
  CircleUserRound,
  PersonStanding,
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "./ui/button";
import { useAuth } from '../context/AuthContext';
const menuItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/closet", label: "My Closet", icon: Shirt },
  { href: "/outfits", label: "Outfits", icon: Library },
];

const tools = [
  { href: "/generate", label: "AI Stylist", icon: Sparkles },
  { href: "/mix-and-match", label: "Mix & Match", icon: Swords },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/try-on", label: "AI Try-on", icon: PersonStanding },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/20">
                <Sparkles className="text-primary w-6 h-6"/>
            </div>
            <h1 className="text-2xl font-headline">Fitzy</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
            <SidebarMenu>
            {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
                    <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={item.label}
                    >
                    <item.icon />
                    <span>{item.label}</span>
                    </SidebarMenuButton>
                </Link>
                </SidebarMenuItem>
            ))}
            </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
            <SidebarGroupLabel>Tools</SidebarGroupLabel>
            <SidebarMenu>
            {tools.map((item) => (
                <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
                    <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={item.label}
                    >
                    <item.icon />
                    <span>{item.label}</span>
                    </SidebarMenuButton>
                </Link>
                </SidebarMenuItem>
            ))}
            </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
         <SidebarMenu>
             <SidebarMenuItem>
                <Link href="/login">
                    <SidebarMenuButton tooltip="User Profile">
                        <CircleUserRound/>
                        <span>{user?.name || 'Login'}</span>
                    </SidebarMenuButton>
                </Link>
             </SidebarMenuItem>
         </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
