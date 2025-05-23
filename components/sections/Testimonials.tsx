import Pill from "../Pill";
import ToolCard from "../ToolCard";

const Testimonials = () => {
  return (
    <section className="tools-wrapper">
      <div className="tools-wrapper-inside">
        <div className="tools-top">
          <Pill />
          <h2 className="text-[38px] leading-[46px] font-bold text-center">
            Don&apos;t believe me - hear it <br />
            from the others
          </h2>
        </div>
        <div className="tools-down">
          <div className="tools-down-items"></div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
