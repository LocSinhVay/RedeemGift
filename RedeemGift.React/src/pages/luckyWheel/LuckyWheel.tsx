import React, { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import confetti from "canvas-confetti";

interface PrizeItem {
  PrizeID: number;
  PrizeName: string;
}

interface CanvasWheelProps {
  prizes: PrizeItem[];
  spinCount: number;
  resultPrizeId: number | null;
  onSpinEnd: (prizeName: string) => void;
  onSpinStart?: () => void;
  onRequestSpin: () => void;
}

const generateDistinctColors = (count: number) => {
  return Array.from({ length: count }, (_, i) => {
    const hue = Math.floor((360 / count) * i);
    return `hsl(${hue}, 80%, 50%)`;
  });
};

const LuckyWheel: React.FC<CanvasWheelProps> = ({
  prizes,
  spinCount,
  resultPrizeId,
  onSpinEnd,
  onSpinStart,
  onRequestSpin,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedColor, setSelectedColor] = useState("#9CA3AF");
  const lastTickAngle = useRef<number>(0);
  const [colors] = useState<string[]>(() => generateDistinctColors(prizes.length));

  const tickSound = useRef<HTMLAudioElement | null>(null);
  const winSound = useRef<HTMLAudioElement | null>(null);
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  // 🎵 Preload âm thanh khi component mount
  useEffect(() => {
    tickSound.current = new Audio("/tick.mp3");
    tickSound.current.volume = 0.8;
    tickSound.current.preload = "auto";

    winSound.current = new Audio("/win.mp3");
    winSound.current.volume = 0.8;
    winSound.current.preload = "auto";
  }, []);

  // 🎵 Unlock audio trên mobile khi user click lần đầu
  const unlockAudio = () => {
    if (audioUnlocked) return;

    const playAndPause = (audio: HTMLAudioElement | null) => {
      if (!audio) return;
      audio.play().then(() => {
        audio.pause();
        audio.currentTime = 0;
      }).catch(() => { });
    };

    playAndPause(tickSound.current);
    playAndPause(winSound.current);

    setAudioUnlocked(true);
  };

  const angle = (2 * Math.PI) / prizes.length;

  const drawWheel = (ctx: CanvasRenderingContext2D, rot: number) => {
    const size = ctx.canvas.width;
    const radius = size / 2;
    ctx.clearRect(0, 0, size, size);

    ctx.save();
    ctx.translate(radius, radius);
    ctx.rotate(rot);
    ctx.translate(-radius, -radius);

    prizes.forEach((prizeItem, i) => {
      const start = i * angle;
      const end = start + angle;

      ctx.beginPath();
      ctx.moveTo(radius, radius);
      ctx.arc(radius, radius, radius - 10, start, end);
      ctx.closePath();
      ctx.fillStyle = colors[i];
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();

      // ✍️ Vẽ chữ
      ctx.save();
      ctx.translate(radius, radius);
      ctx.rotate(start + angle / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = "white";
      ctx.font = "bold 14px sans-serif";

      const wrapText = (text: string, maxWidth: number) => {
        const words = text.split(" ");
        const lines: string[] = [];
        let currentLine = words[0];
        for (let i = 1; i < words.length; i++) {
          const word = words[i];
          const width = ctx.measureText(currentLine + " " + word).width;
          if (width < maxWidth) currentLine += " " + word;
          else {
            lines.push(currentLine);
            currentLine = word;
          }
        }
        lines.push(currentLine);
        return lines;
      };

      const lines = wrapText(prizeItem.PrizeName, 100);
      lines.forEach((line, index) => {
        ctx.fillText(line, radius - 25, -(lines.length - 1) * 8 + index * 16);
      });

      ctx.restore();
    });

    ctx.restore();
  };

  useEffect(() => {
    if (prizes.length > 0) {
      const ctx = canvasRef.current?.getContext("2d");
      if (ctx) drawWheel(ctx, rotation);
    }
  }, [prizes, rotation, colors]);

  const fireCelebration = () => {
    const duration = 4000;
    const end = Date.now() + duration;
    const frame = () => {
      confetti({ particleCount: 5, angle: 60, spread: 70, origin: { x: 0 } });
      confetti({ particleCount: 5, angle: 120, spread: 70, origin: { x: 1 } });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  };

  const showCongratulation = (prizeName: string) => {
    fireCelebration();
    winSound.current!.currentTime = 0;
    winSound.current?.play().catch(() => { });

    Swal.fire({
      html: `
        <div style="
          display:flex;align-items:center;justify-content:center;gap:8px;
          font-size:2em;font-weight:900;color:#ff0000;
          text-shadow:0 0 10px #ff0000,0 0 20px #ff4d4d,0 0 40px #fff;
          animation:glow 1.5s ease-in-out infinite alternate,bounce 1.8s ease-in-out infinite;
        ">
          <img src="https://www.emojiall.com/images/animations/joypixels/64px/party_popper.gif" width="50" height="80" /> 
          CHÚC MỪNG! 
          <img src="https://www.emojiall.com/images/animations/joypixels/64px/party_popper.gif" width="50" height="80" />
        </div>      
        <div style="font-size:1.4em;font-weight:600;margin-top:10px;color:#fff;">
          Bạn đã trúng thưởng:
        </div>
        <div style="
          font-size:2em;font-weight:700;margin-top:10px;color:#ffe259;
          text-shadow:0 0 15px #ff6a00,0 0 30px #ffe259;
          animation:prize-glow 1.2s ease-in-out infinite alternate;
        ">
          ${prizeName} 🎁
        </div>
      `,
      background: "radial-gradient(circle at top, #2c2c2c, #ca7321ff)",
      color: "#fff",
      showConfirmButton: false,
      timer: 5000,
      width: 460,
      padding: "2em",
      backdrop: `rgba(0,0,0,0.7)`,
    });
  };

  useEffect(() => {
    if (resultPrizeId === null || spinning || prizes.length === 0) return;

    const prizeIndex = prizes.findIndex((p) => p.PrizeID === resultPrizeId);
    if (prizeIndex === -1) {
      console.warn(`PrizeID ${resultPrizeId} not found in prizes array.`);
      return;
    }

    setSpinning(true);
    onSpinStart?.();

    const segmentAngle = (2 * Math.PI) / prizes.length;
    const targetAngle =
      1.5 * Math.PI - (prizeIndex * segmentAngle + segmentAngle / 2);
    const randomSpins = (15 + Math.floor(Math.random() * 6)) * 2 * Math.PI;
    const totalRotation = randomSpins + targetAngle;
    const duration = 4500 + Math.random() * 800;
    const start = performance.now();
    const initialRotation = rotation;
    lastTickAngle.current = initialRotation;

    const animate = (time: number) => {
      const elapsed = time - start;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const newRotation =
        initialRotation + (totalRotation - initialRotation) * easeOut;
      setRotation(newRotation);

      const normalizedRotation = newRotation % (2 * Math.PI);
      const prevNormalized = lastTickAngle.current % (2 * Math.PI);
      const passed =
        Math.floor(normalizedRotation / segmentAngle) !==
        Math.floor(prevNormalized / segmentAngle);
      if (passed) tickSound.current?.play().catch(() => { });
      lastTickAngle.current = newRotation;

      if (progress < 1) requestAnimationFrame(animate);
      else {
        setSpinning(false);
        setSelectedColor(colors[prizeIndex]);
        setRotation((prev) => prev % (2 * Math.PI));

        setTimeout(() => {
          onSpinEnd(prizes[prizeIndex].PrizeName);
          showCongratulation(prizes[prizeIndex].PrizeName);
        }, 200);
      }
    };

    requestAnimationFrame(animate);
  }, [resultPrizeId, prizes]);

  const bulbCount = 36;
  const bulbs = Array.from({ length: bulbCount });

  const wheelSize = Math.min(320, window.innerWidth - 40);

  return (
    <div
      style={{
        position: "relative",
        width: wheelSize,
        height: wheelSize,
        borderRadius: "50%",
        border: "8px solid gold",
        boxShadow: "0 4px 15px rgba(0,0,0,0.4), inset 0 0 8px rgba(255,215,0,0.7)",
        margin: "0 auto",
      }}
    >
      {bulbs.map((_, i) => {
        const a = (i / bulbCount) * 2 * Math.PI;
        const r = wheelSize / 2;
        const x = r * Math.cos(a);
        const y = r * Math.sin(a);
        const bulbSize = Math.max(10, wheelSize / 26);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: bulbSize,
              height: bulbSize,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${spinning ? "#ffea00" : "#fff8b0"} 40%, rgba(255,255,255,0.1) 90%)`,
              boxShadow: spinning
                ? "0 0 15px 5px rgba(255,255,0,0.9)"
                : "0 0 8px 2px rgba(255,255,200,0.6)",
              transform: `translate(${x - bulbSize / 2}px, ${y - bulbSize / 2}px)`,
              animation: `blink ${spinning ? 0.3 : 0.8}s ease-in-out infinite`,
              animationDelay: `${i * 0.05}s`,
              zIndex: 1,
            }}
          />
        );
      })}

      {/* Mũi tên */}
      <div
        style={{
          position: "absolute",
          top: -8,
          left: "50%",
          transform: "translateX(-50%) rotate(180deg)",
          width: Math.max(20, wheelSize * 0.07),
          height: Math.max(22, wheelSize * 0.08),
          background: "#ccc",
          clipPath: "polygon(50% 0%, 95% 35%, 65% 100%, 35% 100%, 5% 35%)",
          zIndex: 3,
        }}
      />

      <div style={{ position: "relative", zIndex: 2 }}>
        <canvas ref={canvasRef} width={wheelSize - 16} height={wheelSize - 16} />

        {/* Nút quay */}
        <div
          onClick={() => {
            unlockAudio(); // 🔓 Unlock audio trên mobile
            if (!spinning && spinCount > 0) onRequestSpin();
          }}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: wheelSize * 0.25,
            height: wheelSize * 0.25,
            borderRadius: "50%",
            background: spinCount > 0 ? selectedColor : "#9CA3AF",
            color: "white",
            fontWeight: "bold",
            fontSize: Math.max(14, wheelSize * 0.05),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: spinCount > 0 ? "pointer" : "not-allowed",
            boxShadow:
              "0 4px 10px rgba(0,0,0,0.5), inset 0 0 6px rgba(255,255,255,0.3)",
            zIndex: 4,
          }}
        >
          {spinCount > 0 ? "Quay" : "Hết lượt"}
        </div>
      </div>

      <style>
        {`
          @keyframes blink {
            0%, 100% { opacity: 1; filter: brightness(1.3); }
            50% { opacity: 0.4; filter: brightness(0.6); }
          }
        `}
      </style>
    </div>
  );
};

export default LuckyWheel;
