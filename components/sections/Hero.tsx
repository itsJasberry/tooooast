import Image from "next/image";
import HeroImage from "@/public/hero.png";
import starImage from "@/public/star.svg";
import person from "@/public/dude.png";
import Opinion from "../Opinion";
import blossom from "@/public/blossom.png";
import arrow from "@/public/arrow-pointer.png";
import webToastLogo from "@/public/web-toast-logo.png";
import { useTranslations } from "next-intl";

const Hero = () => {
  const t = useTranslations("IndexPage");
  return (
    <section className="mx-auto flex justify-center text-[#333] overflow-x-hidden relative">
      <Image
        src={blossom}
        alt="blossom"
        className="absolute lg:right-[-140px] lg:top-[-100px] right-[-100px] top-[-50px] -z-10 lg:size-[500px] size-[300px]"
      />
      <Image
        src={blossom}
        alt="blossom"
        className="absolute lg:left-[-140px] lg:top-[-100px] left-[-100px] top-[-50px] rotate-180 -z-10 lg:size-[500px] size-[300px]"
      />

      <div className="flex-col lg:mb-20 lg:mt-35 lg:mx-16 max-w-[1200px] md:mb-15 md:mt-28 md:mx-12 mb-10 mt-20 mx-4 relative">
        <Image
          src={arrow}
          alt="arrow"
          className="absolute lg:left-[-200px] lg:top-[520px] -z-10 md:top-[280px] md:left-[-170px] top-[200px] left-[-120px] max-[620px]"
          height={100}
        />
        <div className="flex justify-center">
          <div className="flex lg:gap-[180px] md:gap-20 gap-10 items-center lg:flex-row flex-col">
            <div className="flex flex-col lg:gap-8 lg:max-w-[360px] max-w-[600px] w-full mt-20 lg:mt-0 gap-4 md:items-start items-center">
              <div className="flex flex-col gap-2 md:items-start items-center">
                <span className="text-sm md:text-base lg:text-lg font-[300] px-4 py-2 rounded-full bg-white/70 backdrop-blur-sm 2xl:backdrop-blur-none max-w-fit 2xl:p-0 2xl:bg-transparent">
                  ✦ {t("Travel")} . Discover
                </span>
                <h1 className="text-2xl md:text-[40px] lg:text-[56px] font-semibold md:leading-[50px] lg:leading-[68px] tracking-[0.56px] text-center md:text-left">
                  Find your perfect place to experience the city{" "}
                </h1>
              </div>
              <p className="text-base md:text-lg lg:text-2xl text-center md:text-left">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cursus
                imperdiet sed id elementum. Quam vel aliquam sit vulputate.
              </p>
              <button className="py-6 md:px-[56px] px-[38px] rounded-[40px] bg-[#333] text-base md:text-lg lg:text-[22px] text-white leading-[18px] font-medium flex  gap-2.5 md:max-w-[186px] max-w-[500px] text-center justify-center w-full">
                Explore
              </button>
            </div>
            <div className="relative">
              <Image
                src={HeroImage}
                alt="Web Toast Banner"
                className="lg:w-[500px] lg:h-[688px] w-[375px] h-[516px]"
              />
              <Image
                src={webToastLogo}
                alt="Web Toast Logo"
                className="absolute lg:top-[230px] lg:left-[110px] top-[170px] left-[90px] z-[1] hover:scale-110 transition-transform duration-300 lg:size-[270px] size-[200px]"
              />
              <Image
                src={starImage}
                alt="Star Icon"
                className="absolute lg:top-[20px] lg:left-[-140px] top-[-20px] left-[-20px] md:size-[139px] size-[100px]"
              />
              <Opinion
                image={person}
                alt="person"
                className="lg:top-[150px] lg:right-[-130px] top-[80px] right-[-30px]"
              />
              <Opinion
                image={person}
                alt="person"
                className="lg:top-[310px] lg:left-[-140px] top-[390px] left-[-30px]"
              />
            </div>
          </div>
        </div>
        <div className="mt-[50px] flex gap-8 lg:flex-row flex-col justify-center items-center">
          <div className="gap-4 items-center p-4 flex lg:w-[300px] max-w-[450px] w-full rounded-2xl border border-black shadow-custom bg-[#D2EAF4] max-h-[83px]">
            <div className="justify-end flex text-base md:text-lg lg:text-[22px] font-semibold w-[80px]">
              351K
            </div>
            <div className="text-xs md:text-sm max-w-[150px]">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </div>
          </div>
          <div className="gap-4 items-center p-4 flex lg:w-[300px] max-w-[450px] w-full rounded-2xl border border-black shadow-custom bg-[#EFC48F] max-h-[83px]">
            <div className="justify-end flex text-base md:text-lg lg:text-[22px] font-semibold w-[80px]">
              351K
            </div>
            <div className="text-xs md:text-sm max-w-[150px]">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </div>
          </div>
          <div className="gap-4 items-center p-4 flex lg:w-[300px] max-w-[450px] w-full rounded-2xl border border-black shadow-custom bg-[#EECFCD] max-h-[83px]">
            <div className="justify-end flex text-base md:text-lg lg:text-[22px] font-semibold w-[80px]">
              351K
            </div>
            <div className="text-xs md:text-sm max-w-[150px]">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
