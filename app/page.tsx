"use client";
import Three from "@/components/Three";
import UI from "@/components/UI";
import { useState } from "react";

export default function Home() {
  const [type, setType] = useState<number>(119);

  return (
    <main>
      <UI setType={setType} type={type} />
      <Three type={type} />
    </main>
  );
}
