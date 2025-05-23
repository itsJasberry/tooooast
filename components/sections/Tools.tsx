import Pill from "../Pill";
import ToolCard from "../ToolCard";

const Tools = () => {
  return (
    <section className="tools-wrapper">
      <div className="tools-wrapper-inside">
        <div className="tools-top">
          <Pill />
          <h2 className="text-[38px] leading-[46px] font-bold text-center">
            These are the tools <br />I use everyday
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

export default Tools;
