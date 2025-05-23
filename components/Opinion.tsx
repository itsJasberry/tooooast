import { cn } from "@/lib/utils";
import Image, { StaticImageData } from "next/image";

const Opinion = ({
  image,
  alt,
  description = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  className,
}: {
  image: StaticImageData;
  alt: string;
  description?: string;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "flex lg:gap-4 gap-2 items-center lg:max-w-[271px] max-w-[200px] rounded-[16px] border border-gray-400 lg:p-6 p-3 bg-white/40 backdrop-blur-[12px] absolute lg:text-sm text-xs",
        className
      )}>
      <Image src={image} alt={alt ?? "person"} />
      <div className="max-w-[160px] w-full">{description}</div>
    </div>
  );
};

export default Opinion;
