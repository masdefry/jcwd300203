'use client';
import authStore from "@/zustand/authStore";

export const Header = () => {
  const role = authStore((state) => state.role);
  const token = authStore((state) => state.token);

  return (
  <main className="flex flex-row gap-5">
    <div>Header</div>
    <div>{role}</div>
    <div>{token}</div>
  </main>);
};
