import Image from "next/image";
import "./connection-visual.css";

const illustrations = ["sos", "location", "audio", "contacts"] as const;

export default function ConnectionVisual({ feature }: { feature: 0 | 1 | 2 | 3 }) {
  return <div className="heros-feature-art" aria-hidden="true">
    {illustrations.map((name, index) => <Image
      key={name}
      src={`/images/heros-feature-${name}.png`}
      alt=""
      width={1254}
      height={1254}
      sizes="(max-width: 760px) 300px, 400px"
      loading="eager"
      hidden={index !== feature}
    />)}
  </div>;
}
