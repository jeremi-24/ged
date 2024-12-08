import { ButtonAnimation } from "@/components/snippet/button-animation";
import { Link } from "lucide-react";

export function ButtonAnimationDemo() {
  return (
    <div className="z-10 min-h-[16rem] flex items-center justify-center">
      <ButtonAnimation  url="https://example.com" variant="expandIcon" Icon={Link} iconPlacement="right">
        Icon right
      </ButtonAnimation>
    </div>
  );
}
