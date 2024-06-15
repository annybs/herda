import { useConfig } from "@/hooks";
import { PropsWithChildren } from "react";

/** Wait for config to be ready before rendering children. */
export default function AwaitConfig({ children }: PropsWithChildren) {
  const { ready } = useConfig()

  return ready ? children : null
}
