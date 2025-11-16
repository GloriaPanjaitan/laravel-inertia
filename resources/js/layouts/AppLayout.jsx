 import React from "react";
import { Link, usePage, router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";

export default function AppLayout({ children }) {
    const { url } = usePage(); // ambil url saat ini untuk highlight aktif

    const onLogout = () => {
        router.get("/auth/logout");
    };

    const navLinks = [
        { name: "Home", href: "/" },
        { name: "Todos", href: "/todos" },
    ];

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <nav className="border-b bg-card shadow-sm">
                <div className="container mx-auto px-4">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center space-x-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                        url === link.href
                                            ? "bg-primary text-white"
                                            : "text-muted-foreground hover:text-primary hover:bg-gray-100"
                                    }`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>

                        <Button variant="outline" size="sm" onClick={onLogout}>
                            Logout
                        </Button>
                    </div>
                </div>
            </nav>

            <main className="flex-1">{children}</main>

            <footer className="border-t bg-card py-6 mt-auto">
                <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
                    &copy; 2025 Delcom Labs. All rights reserved.
                </div>
            </footer>
        </div>
    );
}
