import { HeadlessBundle } from "@/components/headless/HeadlessBundle"
import { BundlePageUI } from "@/pages/ui/BundlePageUI"

const Bundle = () => {
  return (
    <HeadlessBundle>
      {(logic) => <BundlePageUI logic={logic} />}
    </HeadlessBundle>
  )
}

export default Bundle
