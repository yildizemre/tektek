import {
  Bike,
  Camera,
  Car,
  Cpu,
  Droplets,
  Gamepad2,
  Gift,
  Headphones,
  Mic,
  Package,
  Projector,
  Speaker,
  Watch,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  watch: Watch,
  headphones: Headphones,
  projector: Projector,
  car: Car,
  gamepad: Gamepad2,
  camera: Camera,
  speaker: Speaker,
  bike: Bike,
  mic: Mic,
  droplets: Droplets,
  cpu: Cpu,
  gift: Gift,
  package: Package,
};

export const ICON_KEYS = Object.keys(ICONS);

export function CategoryIcon({
  name,
  className,
}: {
  name: string | null | undefined;
  className?: string;
}) {
  const Icon = ICONS[name ?? ""] ?? Package;
  return <Icon className={className} strokeWidth={1.5} aria-hidden />;
}
