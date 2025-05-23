import React from "react";

const Footer = () => {
  const currYear = new Date().getFullYear();
  return (
    <section className="w-full bg-white flex justify-center items-center flex-col gap-8 px-10 py-5">
      <div className="flex lg:px-10 lg:py-20 max-w-[1400px] gap-10 w-full">
        <div className="flex h-min gap-8 flex-col w-full lg:max-w-[620px]">
          <p className="text-lg font-medium text-[#0b0b0b]">
            Follow me on other channels
          </p>
          <div className="flex gap-3 h-[276px] flex-col w-full text-xl font-medium transition-transform">
            <a
              href=""
              className="social-pill w-full hover:scale-97 transition-transform">
              <div className="social-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 256 256"
                  focusable="false"
                  className="!w-[32px] !h-[30px]"
                  style={{
                    userSelect: "none",
                    width: "100%",
                    height: "100%",
                    display: "inline-block",
                    fill: "rgb(11, 11, 11)",
                    color: "rgb(11, 11, 11)",
                    flexShrink: 0,
                  }}
                  color="rgb(11, 11, 11)">
                  <g color="rgb(11, 11, 11)">
                    <path d="M164.44,121.34l-48-32A8,8,0,0,0,104,96v64a8,8,0,0,0,12.44,6.66l48-32a8,8,0,0,0,0-13.32ZM120,145.05V111l25.58,17ZM234.33,69.52a24,24,0,0,0-14.49-16.4C185.56,39.88,131,40,128,40s-57.56-.12-91.84,13.12a24,24,0,0,0-14.49,16.4C19.08,79.5,16,97.74,16,128s3.08,48.5,5.67,58.48a24,24,0,0,0,14.49,16.41C69,215.56,120.4,216,127.34,216h1.32c6.94,0,58.37-.44,91.18-13.11a24,24,0,0,0,14.49-16.41c2.59-10,5.67-28.22,5.67-58.48S236.92,79.5,234.33,69.52Zm-15.49,113a8,8,0,0,1-4.77,5.49c-31.65,12.22-85.48,12-86,12H128c-.54,0-54.33.2-86-12a8,8,0,0,1-4.77-5.49C34.8,173.39,32,156.57,32,128s2.8-45.39,5.16-54.47A8,8,0,0,1,41.93,68c30.52-11.79,81.66-12,85.85-12h.27c.54,0,54.38-.18,86,12a8,8,0,0,1,4.77,5.49C221.2,82.61,224,99.43,224,128S221.2,173.39,218.84,182.47Z"></path>
                  </g>
                </svg>
              </div>
              <div className="w-full justify-between flex items-center ">
                <p>Youtube</p>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 256 256"
                  focusable="false"
                  className="!size-[28px]"
                  style={{
                    userSelect: "none",
                    width: "100%",
                    height: "100%",
                    display: "inline-block",
                    fill: "rgb(11, 11, 11)",
                    color: "rgb(11, 11, 11)",
                    flexShrink: 0,
                  }}
                  color="rgb(11, 11, 11)">
                  <g>
                    <path d="M204,64V168a12,12,0,0,1-24,0V93L72.49,200.49a12,12,0,0,1-17-17L163,76H88a12,12,0,0,1,0-24H192A12,12,0,0,1,204,64Z"></path>
                  </g>
                </svg>
              </div>
            </a>
            <a
              href=""
              className="social-pill w-[90%] hover:scale-97 transition-transform">
              <div className="social-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 256 256"
                  focusable="false"
                  className="!w-[32px] !h-[30px]"
                  style={{
                    userSelect: "none",
                    width: "100%",
                    height: "100%",
                    display: "inline-block",
                    fill: "rgb(11, 11, 11)",
                    color: "rgb(11, 11, 11)",
                    flexShrink: 0,
                  }}
                  color="rgb(11, 11, 11)">
                  <g>
                    <path d="M247.39,68.94A8,8,0,0,0,240,64H209.57A48.66,48.66,0,0,0,168.1,40a46.91,46.91,0,0,0-33.75,13.7A47.9,47.9,0,0,0,120,88v6.09C79.74,83.47,46.81,50.72,46.46,50.37a8,8,0,0,0-13.65,4.92c-4.31,47.79,9.57,79.77,22,98.18a110.93,110.93,0,0,0,21.88,24.2c-15.23,17.53-39.21,26.74-39.47,26.84a8,8,0,0,0-3.85,11.93c.75,1.12,3.75,5.05,11.08,8.72C53.51,229.7,65.48,232,80,232c70.67,0,129.72-54.42,135.75-124.44l29.91-29.9A8,8,0,0,0,247.39,68.94Zm-45,29.41a8,8,0,0,0-2.32,5.14C196,166.58,143.28,216,80,216c-10.56,0-18-1.4-23.22-3.08,11.51-6.25,27.56-17,37.88-32.48A8,8,0,0,0,92,169.08c-.47-.27-43.91-26.34-44-96,16,13,45.25,33.17,78.67,38.79A8,8,0,0,0,136,104V88a32,32,0,0,1,9.6-22.92A30.94,30.94,0,0,1,167.9,56c12.66.16,24.49,7.88,29.44,19.21A8,8,0,0,0,204.67,80h16Z"></path>
                  </g>
                </svg>
              </div>
              <div className="w-full justify-between flex items-center">
                <p>Twitter/X</p>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 256 256"
                  focusable="false"
                  className="!size-[28px]"
                  style={{
                    userSelect: "none",
                    width: "100%",
                    height: "100%",
                    display: "inline-block",
                    fill: "rgb(11, 11, 11)",
                    color: "rgb(11, 11, 11)",
                    flexShrink: 0,
                  }}
                  color="rgb(11, 11, 11)">
                  <g>
                    <path d="M204,64V168a12,12,0,0,1-24,0V93L72.49,200.49a12,12,0,0,1-17-17L163,76H88a12,12,0,0,1,0-24H192A12,12,0,0,1,204,64Z"></path>
                  </g>
                </svg>
              </div>
            </a>
            <a
              href=""
              className="social-pill w-[80%] hover:scale-97 transition-transform">
              <div className="social-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 256 256"
                  className="!w-[32px] !h-[30px]"
                  focusable="false"
                  style={{
                    userSelect: "none",
                    width: "100%",
                    height: "100%",
                    display: "inline-block",
                    fill: "rgb(11, 11, 11)",
                    color: "rgb(11, 11, 11)",
                    flexShrink: 0,
                  }}
                  color="rgb(11, 11, 11)">
                  <g>
                    <path d="M216,24H40A16,16,0,0,0,24,40V216a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V40A16,16,0,0,0,216,24Zm0,192H40V40H216V216ZM96,112v64a8,8,0,0,1-16,0V112a8,8,0,0,1,16,0Zm88,28v36a8,8,0,0,1-16,0V140a20,20,0,0,0-40,0v36a8,8,0,0,1-16,0V112a8,8,0,0,1,15.79-1.78A36,36,0,0,1,184,140ZM100,84A12,12,0,1,1,88,72,12,12,0,0,1,100,84Z"></path>
                  </g>
                </svg>
              </div>
              <div className="w-full justify-between flex items-center">
                <p>LinkedIn</p>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 256 256"
                  focusable="false"
                  className="!size-[28px]"
                  style={{
                    userSelect: "none",
                    width: "100%",
                    height: "100%",
                    display: "inline-block",
                    fill: "rgb(11, 11, 11)",
                    color: "rgb(11, 11, 11)",
                    flexShrink: 0,
                  }}
                  color="rgb(11, 11, 11)">
                  <g>
                    <path d="M204,64V168a12,12,0,0,1-24,0V93L72.49,200.49a12,12,0,0,1-17-17L163,76H88a12,12,0,0,1,0-24H192A12,12,0,0,1,204,64Z"></path>
                  </g>
                </svg>
              </div>
            </a>
          </div>
        </div>
        <div className="bg-[#f5f7ff] w-[2px] flex-none" />
        <div className="max-w-[573px] w-full flex h-min">
          <div className="flex flex-col gap-8 w-1/2">
            <p>Navigation</p>
            <div className="flex flex-col gap-3">
              <p>Home</p>
              <p>Work</p>
              <p>Tools</p>
              <p>Skills</p>
              <p>Education</p>
              <p>About me</p>
            </div>
          </div>
          <div className="flex flex-col gap-8 w-1/2">
            <p>Navigation</p>
            <div className="flex flex-col gap-3">
              <p>App Project</p>
              <p>App Project 2</p>
              <p>App Project 3</p>
              <p>App Project 4</p>
              <p>App Project 5</p>
              <p>App Project 6</p>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-[1400px] mx-auto w-full flex justify-between px-10">
        <div>© {currYear} - <a href="https://hubertgrzesiak.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">Hubert Grzesiak</a></div>
        <div className="flex gap-5 text-sm font-medium text-[#0b0b0b]">
          <div>Privacy Policy</div>
          <div>Cookies</div>
          <div>Terms of Service</div>
          <div>Contact</div>
        </div>
      </div>
    </section>
  );
};

export default Footer;
