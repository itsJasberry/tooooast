import React from "react";

const ToolCard = () => {
  return (
    <div
      styles="will-change: transform; opacity: 1; transform: none;"
      className="tool-item">
      <div className="tool-icon"></div>
      <div className="gap-2 flex-col flex">
        <p className="text-[20px] leading-[28px]">Figma</p>
        <p className="text-base text-[#505050]">UX/UI Design & Prototyping</p>
      </div>
    </div>
  );
};

export default ToolCard;
