"use client";

export default function Home() {

  function testClick() {
    alert("Button works!");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#111827",
        color: "white",
        padding: "40px",
      }}
    >
      <h1>IMTraderFX</h1>

      <h2>Mini App Test</h2>

      <p>Deployment Successful</p>

      <button
        onClick={testClick}
        style={{
          marginTop: "30px",
          padding: "15px 30px",
          background:"#2563eb",
          color:"white",
          border:"none",
          borderRadius:"8px",
          cursor:"pointer",
        }}
      >
        TEST BUTTON
      </button>

    </main>
  );
}
