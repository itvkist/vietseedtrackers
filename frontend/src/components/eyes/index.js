import { useState, useEffect, useRef } from "react";
import "./style.css";

function Eyes() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [fixedData, setFixedData] = useState({
    eye_size: 0,
    eye_left: { x: 0, y: 0, elX: 0, elY: 0 },
    eye_right: { x: 0, y: 0, elX: 0, elY: 0 },
  });
  const eyeLeft = useRef();
  const eyeRight = useRef();

  const handleMouseMove = (event) =>
    setMouse({ x: event.clientX, y: event.clientY });

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  useEffect(() => {
    setFixedData({
      eye_size: eyeLeft.current.clientWidth,
      eye_left: {
        x: eyeLeft.current.offsetLeft,
        y: eyeLeft.current.offsetTop,
        elX: eyeLeft.current.offsetLeft + eyeLeft.current.clientWidth / 2,
        elY: eyeLeft.current.offsetTop + eyeLeft.current.clientHeight / 2,
      },
      eye_right: {
        x: eyeRight.current.offsetLeft,
        y: eyeRight.current.offsetTop,
        elX: eyeRight.current.offsetLeft + eyeRight.current.clientWidth / 2,
        elY: eyeRight.current.offsetTop + eyeRight.current.clientHeight / 2,
      },
    });
  }, [eyeLeft, eyeRight]);

  function calcAngle(element, side) {
    if (!element.current) return;
    if (side === "left")
      return -(
        Math.atan2(
          mouse.x - fixedData.eye_left.elX,
          mouse.y - fixedData.eye_left.elY
        ) *
          (180 / Math.PI) +
        18
      );

    if (side === "right")
      return -(
        Math.atan2(
          mouse.x - fixedData.eye_right.elX,
          mouse.y - fixedData.eye_right.elY
        ) *
          (180 / Math.PI) +
        18
      );

    return 0;
  }
  return (
    <div className="eye_container">
      <div
        ref={eyeLeft}
        style={{
          transform: `rotate(${calcAngle(eyeLeft, "left")}deg)`,
        }}
        className="eye"
      ></div>
      <div
        ref={eyeRight}
        style={{
          transform: `rotate(${calcAngle(eyeRight, "right")}deg)`,
        }}
        className="eye"
      ></div>
    </div>
  );
}

export default Eyes;
