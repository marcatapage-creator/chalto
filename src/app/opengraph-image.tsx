import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "Chalto — La plateforme des pros du bâtiment"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        background: "#0a0a0a",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            background: "#2260E8",
            borderRadius: 16,
            width: 80,
            height: 80,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 48,
            fontWeight: 700,
            color: "white",
          }}
        >
          C
        </div>
        <span style={{ fontSize: 64, fontWeight: 700, color: "white" }}>Chalto</span>
      </div>

      <p style={{ fontSize: 28, color: "#888", margin: 0, textAlign: "center" }}>
        La plateforme des professionnels du bâtiment
      </p>

      <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
        {["Architectes", "Artisans", "Entrepreneurs"].map((label) => (
          <div
            key={label}
            style={{
              background: "#2260E820",
              border: "1px solid #2260E8",
              borderRadius: 100,
              padding: "8px 20px",
              color: "#2260E8",
              fontSize: 18,
            }}
          >
            {label}
          </div>
        ))}
      </div>
    </div>,
    { ...size }
  )
}
