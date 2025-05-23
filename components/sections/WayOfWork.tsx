import Pill from "../Pill";
import ToolCard from "../ToolCard";

const WayOfWork = () => {
  return (
    <section className="tools-wrapper">
      <div className="tools-wrapper-inside">
        <div className="tools-top">
          <Pill />
          <h2 className="text-[38px] leading-[46px] font-bold text-center">
            Skills that I use to create
            <br />
            world-class products
          </h2>
        </div>
        <div className="tools-down">
          <div className="tools-down-items">
            <ToolCard />
            <ToolCard />
            <ToolCard />
            <ToolCard />
            <ToolCard />
            <ToolCard />
          </div>
        </div>
      </div>
    </section>
  );
};

export default WayOfWork;
