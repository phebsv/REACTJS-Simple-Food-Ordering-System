import bg1 from '../assets/bg1.png';
import bg2 from '../assets/bg2.png';
import bg3 from '../assets/bg3.png';
import bg4 from '../assets/bg4.png';

const items = [
  { img: bg1, top: "90px", left: "20px", rot: -10, size: 270 },
  { img: bg2, top: "85px", right: "20px", rot: 14, size: 240 },
  { img: bg3, bottom: "30px", left: "50px", rot: 8, size: 240 },
  { img: bg4, bottom: "20px", right: "70px", rot: -8, size: 216 },
];

export default function BgFood() {
  return (
    <>
      {items.map((it, i) => (
        <img key={i} src={it.img} alt="food" style={{
          position: "absolute", top: it.top, left: it.left,
          right: it.right, bottom: it.bottom,
          width: it.size, height: it.size, transform: `rotate(${it.rot}deg)`,
          opacity: 0.13, zIndex: 0, pointerEvents: "none",
          userSelect: "none",
        }} />
      ))}
    </>
  );
}