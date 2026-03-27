import logo from "../assets/logo1.png";

export default function NomNomLogo({ size = "md" }) {
  const big = size === "lg";
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <img
        src={logo}
        alt="NomNom Logo"
        style={{
          width: big ? 240 : 168,
          height: big ? 240 : 168,
          objectFit: "contain",
        }}
      />
    </div>
  );
}