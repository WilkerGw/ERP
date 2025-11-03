// Caminho: ERP-FRONT-main/src/app/(app)/layout.tsx

'use client';

import Link from 'next/link';
import Sidebar from "@/components/layout/Sidebar";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import Image from 'next/image';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:z-10 lg:w-72">
        <Sidebar />
      </aside>
      
      <div className="flex flex-col lg:pl-72">
        <header className="flex h-16 items-center justify-between gap-4 border-b bg-sidebar px-6 lg:hidden sticky top-0 z-30">
          {/* --- ALTERAÇÃO AQUI --- */}
          <Link href="/dashboard" className="flex items-center gap-2">
            {/* --- CORREÇÃO AQUI --- */}
            <Image src="/images/logo-mind.png" alt="Logo" width={32} height={32} priority />
            <span className="font-bold">Mind ERP</span>
          </Link>
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Abrir ou fechar menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
              <Sidebar onLinkClick={() => setIsSheetOpen(false)} />
            </SheetContent>
          </Sheet>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}