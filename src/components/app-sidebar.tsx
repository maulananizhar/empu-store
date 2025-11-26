"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  LucideBox,
  LucideBoxes,
  LucideCalculator,
  LucideEdit,
  LucideEllipsisVertical,
  LucideGauge,
  LucideLogOut,
  LucideShoppingCart,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { Separator } from "./ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { Session } from "next-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createOrder } from "@/services/orderApi";
import { useOrder } from "@/store/orderStore";

export function AppSidebar({ children }: { children: React.ReactNode }) {
  // Get session and authentication status
  const { data: session, status }: { data: Session | null; status: string } =
    useSession({
      required: true,
      onUnauthenticated() {
        router.push("/auth/signin");
      },
    });

  // Get router and pathname
  const router = useRouter();
  const pathname = usePathname();

  // Handle state
  const { setOrderId } = useOrder();

  // Render loading state if authentication status is loading
  if (status === "loading") {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (status === "authenticated" && session)
    return (
      <>
        <Sidebar variant="inset">
          <SidebarHeader className="p-4">
            <p className="font-bold text-black">Empu Store</p>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === "/dashboard" ? true : false}>
                      <Link href="/dashboard">
                        <LucideGauge className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === "/cashier" ? true : false}>
                      <Link href="/cashier">
                        <LucideCalculator className="mr-2 h-4 w-4" />
                        <span>Kasir</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === "/transactions" ? true : false}>
                      <Link href="/transactions">
                        <LucideShoppingCart className="mr-2 h-4 w-4" />
                        <span>Transaksi</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === "/products" ? true : false}>
                      <Link href="/products">
                        <LucideBox className="mr-2 h-4 w-4" />
                        <span>Produk</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === "/categories" ? true : false}>
                      <Link href="/categories">
                        <LucideBoxes className="mr-2 h-4 w-4" />
                        <span>Kategori</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <div className="p-4 flex items-center">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={`https://api.dicebear.com/9.x/thumbs/svg?seed=${session.user.name}`}
                />
                <AvatarFallback>
                  {session.user.name?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-black ml-3">
                  {session.user.name}
                </p>
                <p className="text-xs text-gray-500 ml-3">
                  {session.user.role}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    className="ml-auto h-6 w-6"
                    variant="outline"
                    size="icon">
                    <LucideEllipsisVertical className="h-4 w-4 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                  <DropdownMenuItem className="">
                    <LucideEdit className="h-4 w-4" />
                    Edit Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LucideLogOut className="h-4 w-4" />
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <div className="flex flex-col h-[98vh]">
            <div className="flex items-center gap-4 border-b py-2 px-4">
              <SidebarTrigger />
              <Separator orientation="vertical" className="h-6" />
              <Breadcrumb>
                <BreadcrumbList>
                  {pathname &&
                    pathname
                      .split("/")
                      .filter(Boolean)
                      .map((segment, idx, arr) => {
                        const href = "/" + arr.slice(0, idx + 1).join("/");
                        const isLast = idx === arr.length - 1;
                        return (
                          <div key={href} className="flex items-center gap-2">
                            <BreadcrumbItem>
                              <BreadcrumbLink
                                href={href}
                                className={isLast ? "text-black" : undefined}>
                                {segment.charAt(0).toUpperCase() +
                                  segment.slice(1)}
                              </BreadcrumbLink>
                            </BreadcrumbItem>
                            {!isLast && <BreadcrumbSeparator />}
                          </div>
                        );
                      })}
                </BreadcrumbList>
              </Breadcrumb>
              <Button
                variant="default"
                className="ml-auto flex items-center justify-center active:scale-105 duration-200 transition-transform"
                onClick={() => {
                  createOrder(session.user.id).then(data => {
                    setOrderId(data.orderId);
                    router.push(`/cashier`);
                  });
                }}>
                <LucideCalculator className="h-5 w-5" />
                <p>Transaksi baru</p>
              </Button>
            </div>
            <div className="py-2 px-4 flex-1 overflow-y-auto">{children}</div>
          </div>
        </SidebarInset>
      </>
    );
}
