import type { Metadata } from "next";
import PageClient from "./page-client";

export const metadata: Metadata = {
  title: "Notifications",
  description: "Manage your notification preferences",
};

async function Page() {
  return <PageClient />;
}

export default Page;
