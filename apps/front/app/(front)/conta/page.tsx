"use client";

import { RequireAuth } from "@/components/auth/auth-guard";
import { AccountShell } from "@/components/account/account-shell";
import { AccountSidebar } from "@/components/account/account-sidebar";
import { AccountStats } from "@/components/account/account-stats";
import { AddressList } from "@/components/account/address-list";
import { ProfileForm } from "@/components/account/profile-form";
import { BlueprintSkeleton } from "@/components/ui/blueprint-skeleton";
import { useAddresses, useProfile } from "@/hooks/use-account";
import { useOrders } from "@/hooks/use-orders";
import { useWishlist } from "@/hooks/use-wishlist";

function AccountSkeleton() {
  return (
    <div className="mt-4 grid grid-cols-1 gap-8 lg:grid-cols-[264px_1fr]">
      <BlueprintSkeleton className="h-52" />
      <div className="space-y-5">
        <BlueprintSkeleton className="h-28" />
        <BlueprintSkeleton className="h-72" />
      </div>
    </div>
  );
}

function AccountContent() {
  const { data: profile, isLoading } = useProfile();
  const { data: addresses, isLoading: loadingAddresses } = useAddresses();
  const { data: orders } = useOrders();
  const { ids } = useWishlist();

  if (isLoading || !profile) {
    return (
      <AccountShell crumbs={[{ label: "Minha conta" }]}>
        <AccountSkeleton />
      </AccountShell>
    );
  }

  const name =
    [profile.firstName, profile.lastName].filter(Boolean).join(" ") || profile.email;

  return (
    <AccountShell crumbs={[{ label: "Minha conta" }]}>
      <h1 className="mt-3 font-heading text-[32px] uppercase leading-none md:text-[38px]">
        Minha conta
      </h1>

      <div className="mt-6 grid grid-cols-1 items-start gap-8 lg:grid-cols-[264px_1fr]">
        <AccountSidebar
          name={name}
          memberSince={
            profile.createdAt ? String(new Date(profile.createdAt).getFullYear()) : null
          }
          orderCount={orders?.length ?? 0}
          wishlistCount={ids.length}
        />

        <div>
          <AccountStats orders={orders ?? []} />
          <ProfileForm profile={profile} />
          <AddressList
            addresses={addresses ?? profile.addresses ?? []}
            isLoading={loadingAddresses}
          />
        </div>
      </div>
    </AccountShell>
  );
}

export default function ContaPage() {
  return (
    <RequireAuth>
      <AccountContent />
    </RequireAuth>
  );
}
