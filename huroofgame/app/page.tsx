"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type TeamId = "ORANGE" | "GREEN";
type Owner = TeamId | null;

type Cell = {
  id: string;
  r: number;
  c: number;
  letter: string;
  owner: Owner;
};

const AR_LETTERS = [
  "ا","ب","ت","ث","ج","ح","خ","د","ذ","ر","ز","س","ش","ص","ض","ط","ظ","ع","غ","ف","ق","ك","ل","م","ن","هـ","و","ي",
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// جيران شبكة Hex بأسلوب even-r
function getNeighbors(r: number, c: number, size: number) {
  const even = r % 2 === 0;
  const deltas = even
    ? [
        [-1, -1], [-1, 0],
        [0, -1],          [0, 1],
        [1, -1],  [1, 0],
      ]
    : [
        [-1, 0],  [-1, 1],
        [0, -1],          [0, 1],
        [1, 0],   [1, 1],
      ];

  const out: Array<[number, number]> = [];
  for (const [dr, dc] of deltas) {
    const nr = r + dr;
    const nc = c + dc;
    if (nr >= 0 && nr < size && nc >= 0 && nc < size) out.push([nr, nc]);
  }
  return out;
}

// فحص الفوز
function checkWin(cells: Cell[], size: number, team: TeamId) {
  const byPos = new Map<string, Cell>();
  for (const cell of cells) byPos.set(`${cell.r},${cell.c}`, cell);

  const queue: Array<[number, number]> = [];
  const visited = new Set<string>();

  const isOwned = (r: number, c: number) =>
    byPos.get(`${r},${c}`)?.owner === team;

  if (team === "ORANGE") {
    // ORANGE: من فوق لتحت
    for (let c = 0; c < size; c++) {
      if (isOwned(0, c)) {
        queue.push([0, c]);
        visited.add(`0,${c}`);
      }
    }
    while (queue.length) {
      const [r, c] = queue.shift()!;
      if (r === size - 1) return true;

      for (const [nr, nc] of getNeighbors(r, c, size)) {
        const key = `${nr},${nc}`;
        if (!visited.has(key) && isOwned(nr, nc)) {
          visited.add(key);
          queue.push([nr, nc]);
        }
      }
    }
    return false;
  } else {
    // GREEN: من اليمين لليسار
    for (let r = 0; r < size; r++) {
      if (isOwned(r, size - 1)) {
        queue.push([r, size - 1]);
        visited.add(`${r},${size - 1}`);
      }
    }
    while (queue.length) {
      const [r, c] = queue.shift()!;
      if (c === 0) return true;

      for (const [nr, nc] of getNeighbors(r, c, size)) {
        const key = `${nr},${nc}`;
        if (!visited.has(key) && isOwned(nr, nc)) {
          visited.add(key);
          queue.push([nr, nc]);
        }
      }
    }
    return false;
  }
}

// إنشاء الشبكة
function makeBoard(size: number): Cell[] {
  const total = size * size;
  let letters = shuffle(AR_LETTERS);

  while (letters.length < total) letters = letters.concat(shuffle(AR_LETTERS));
  letters = letters.slice(0, total);

  const cells: Cell[] = [];
  let idx = 0;

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      cells.push({
        id: `${r}-${c}`,
        r,
        c,
        letter: letters[idx++],
        owner: null,
      });
    }
  }

  return cells;
}

type Screen = "MENU" | "SETTINGS" | "GAME" | "ROUND_WIN" | "MATCH_WIN";

/** ✅ SideCard خارج Page لحل مشكلة الكتابة */
function SideCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-3xl p-5 h-full"
      style={{
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.10)",
        backdropFilter: "blur(10px)",
        boxShadow: "0 18px 60px rgba(0,0,0,0.35)",
      }}
    >
      <div className="text-lg font-extrabold mb-4">{title}</div>
      {children}
    </div>
  );
}

/** خلفية اللوحة */
function BoardFrame({
  orange,
  green,
  children,
}: {
  orange: string;
  green: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="relative w-full h-full rounded-[22px] p-3 md:p-5 shadow-xl"
      style={{
        background: "#0b1020",
        border: "2px solid rgba(255,255,255,0.12)",
      }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-[30%]"
        style={{
          background: orange,
          clipPath: "polygon(0 0, 100% 0, 70% 100%, 30% 100%)",
          opacity: 0.95,
        }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-[30%]"
        style={{
          background: orange,
          clipPath: "polygon(30% 0, 70% 0, 100% 100%, 0 100%)",
          opacity: 0.95,
        }}
      />
      <div
        className="absolute top-0 bottom-0 left-0 w-[28%]"
        style={{
          background: green,
          clipPath: "polygon(0 0, 100% 30%, 100% 70%, 0 100%)",
          opacity: 0.95,
        }}
      />
      <div
        className="absolute top-0 bottom-0 right-0 w-[28%]"
        style={{
          background: green,
          clipPath: "polygon(0 30%, 100% 0, 100% 100%, 0 70%)",
          opacity: 0.95,
        }}
      />

      <div
        className="relative z-10 rounded-[18px] h-full w-full p-3 md:p-5 flex items-center justify-center"
        style={{
          background: "rgba(0,0,0,0.20)",
          border: "1px solid rgba(255,255,255,0.12)",
          backdropFilter: "blur(6px)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

/** شبكة الحروف */
function HexBoard({
  gridSize,
  cells,
  onCellClick,
  team1Color,
  team2Color,
}: {
  gridSize: number;
  cells: Cell[];
  onCellClick: (cell: Cell) => void;
  team1Color: string;
  team2Color: string;
}) {
  const hexSize = useMemo(() => {
    if (gridSize === 5) return 92;
    if (gridSize === 6) return 82;
    return 72;
  }, [gridSize]);

  return (
    <div className="mx-auto w-fit select-none">
      {Array.from({ length: gridSize }).map((_, r) => (
        <div
          key={r}
          className="flex items-center justify-center"
          style={{
            marginRight: r % 2 === 0 ? 0 : hexSize * 0.52,
            marginTop: -hexSize * 0.20,
          }}
        >
          {cells
            .filter((c) => c.r === r)
            .map((cell) => {
              const ownerColor =
                cell.owner === "ORANGE"
                  ? team1Color
                  : cell.owner === "GREEN"
                  ? team2Color
                  : null;

              return (
                <button
                  key={cell.id}
                  onClick={() => onCellClick(cell)}
                  className="mx-[2px] grid place-items-center font-extrabold transition active:scale-[0.97]"
                  style={{
                    width: hexSize,
                    height: hexSize,
                    clipPath:
                      "polygon(25% 6%, 75% 6%, 100% 50%, 75% 94%, 25% 94%, 0% 50%)",
                    background: ownerColor ? ownerColor : "white",
                    border: "3px solid rgba(0,0,0,0.35)",
                    color: "#111827",
                    boxShadow:
                      "0px 10px 26px rgba(0,0,0,0.38), inset 0px 2px 0px rgba(255,255,255,0.7)",
                  }}
                >
                  <span style={{ fontSize: Math.max(20, hexSize * 0.32) }}>
                    {cell.letter}
                  </span>
                </button>
              );
            })}
        </div>
      ))}
    </div>
  );
}

/** أصوات */
function useSfx() {
  const ctxRef = useRef<AudioContext | null>(null);

  const ensure = async () => {
    if (typeof window === "undefined") return null;
    if (!ctxRef.current)
      ctxRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    if (ctxRef.current.state === "suspended") await ctxRef.current.resume();
    return ctxRef.current;
  };

  const beep = async (
    freq: number,
    ms: number,
    type: OscillatorType = "sine",
    gainVal = 0.06
  ) => {
    const ctx = await ensure();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.value = freq;

    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(gainVal, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      ctx.currentTime + ms / 1000
    );

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + ms / 1000 + 0.02);
  };

  return {
    click: () => beep(520, 60, "triangle", 0.05),
    click2: () => beep(740, 55, "sine", 0.05),
    placeOrange: () => beep(520, 80, "square", 0.05),
    placeGreen: () => beep(380, 80, "square", 0.05),
    win: async () => {
      await beep(523.25, 120, "sine", 0.06);
      await beep(659.25, 120, "sine", 0.06);
      await beep(783.99, 160, "sine", 0.07);
    },
    error: () => beep(180, 110, "sawtooth", 0.06),
  };
}

/** خلفية سينمائية + حروف طائرة */
function CinematicBackground({ count = 34 }: { count?: number }) {
  const letters = useMemo(() => {
    const colors = [
      "#60a5fa",
      "#f59e0b",
      "#34d399",
      "#f472b6",
      "#a78bfa",
      "#22c55e",
      "#eab308",
      "#38bdf8",
    ];
    return Array.from({ length: count }).map((_, i) => {
      const l = AR_LETTERS[Math.floor(Math.random() * AR_LETTERS.length)];
      const c = colors[Math.floor(Math.random() * colors.length)];
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      const size = 34 + Math.random() * 52;
      const blur = Math.random() < 0.25 ? 1.6 : 0;
      const dur = 8 + Math.random() * 10;
      const delay = Math.random() * 6;
      const rot = -20 + Math.random() * 40;
      return { id: i, l, c, left, top, size, blur, dur, delay, rot };
    });
  }, [count]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full blur-3xl opacity-30"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, #7c3aed, transparent 65%)",
        }}
      />
      <div
        className="absolute bottom-[-260px] left-[-220px] w-[720px] h-[720px] rounded-full blur-3xl opacity-25"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, #22c55e, transparent 60%)",
        }}
      />
      <div
        className="absolute bottom-[-220px] right-[-240px] w-[760px] h-[760px] rounded-full blur-3xl opacity-20"
        style={{
          background:
            "radial-gradient(circle at 60% 40%, #f59e0b, transparent 62%)",
        }}
      />

      <div className="absolute inset-0 opacity-[0.08] mix-blend-overlay bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22200%22 height=%22200%22 filter=%22url(%23n)%22 opacity=%220.6%22/%3E%3C/svg%3E')]"/>

      {letters.map((x) => (
        <span
          key={x.id}
          className="absolute font-black select-none"
          style={{
            left: `${x.left}%`,
            top: `${x.top}%`,
            fontSize: `${x.size}px`,
            color: x.c,
            textShadow: "0 12px 28px rgba(0,0,0,0.55)",
            filter: x.blur ? `blur(${x.blur}px)` : "none",
            transform: `rotate(${x.rot}deg)`,
            animation: `floaty ${x.dur}s ease-in-out ${x.delay}s infinite alternate`,
            opacity: 0.9,
          }}
        >
          {x.l}
        </span>
      ))}

      <style jsx global>{`
        @keyframes floaty {
          from {
            transform: translateY(0px) translateX(0px) rotate(0deg);
            opacity: 0.75;
          }
          to {
            transform: translateY(-22px) translateX(14px) rotate(6deg);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

/** Fullscreen */
async function requestFullscreen() {
  const el = document.documentElement;
  if (el.requestFullscreen) {
    try {
      await el.requestFullscreen();
    } catch {}
  }
}

export default function Page() {
  const sfx = useSfx();

  // ✅ كلمة مرور (تم تغييرها إلى A7901)
  const correctPassword = "A7901";
  const [allowed, setAllowed] = useState(false);
  const [password, setPassword] = useState("");
  const [pwError, setPwError] = useState<string | null>(null);

  const [gameName, setGameName] = useState("تحدي الحروف");
  const [roundsToWin, setRoundsToWin] = useState(3);
  const [gridSize, setGridSize] = useState(5);

  const [team1Name, setTeam1Name] = useState("البرتقالي");
  const [team2Name, setTeam2Name] = useState("الأخضر");

  const [team1Color, setTeam1Color] = useState("#E25822");
  const [team2Color, setTeam2Color] = useState("#2ECC71");

  const [screen, setScreen] = useState<Screen>("MENU");
  const [roundIndex, setRoundIndex] = useState(1);

  const [scoreOrange, setScoreOrange] = useState(0);
  const [scoreGreen, setScoreGreen] = useState(0);

  const [cells, setCells] = useState<Cell[]>(() => makeBoard(gridSize));

  const [manualTeam, setManualTeam] = useState<TeamId>("ORANGE");
  const [winner, setWinner] = useState<TeamId | null>(null);

  useEffect(() => {
    setCells(makeBoard(gridSize));
  }, [gridSize]);

  const startMatch = async () => {
    await sfx.click2();
    setScoreOrange(0);
    setScoreGreen(0);
    setRoundIndex(1);
    setWinner(null);
    setCells(makeBoard(gridSize));
    setScreen("GAME");
  };

  const nextRound = async () => {
    await sfx.click2();
    setRoundIndex((r) => r + 1);
    setCells(makeBoard(gridSize));
    setWinner(null);
    setScreen("GAME");
  };

  const resetToMenu = async () => {
    await sfx.click();
    setScreen("MENU");
    setWinner(null);
  };

  const onCellClick = async (cell: Cell) => {
    if (screen !== "GAME") return;
    if (cell.owner) return;

    const team = manualTeam;

    if (team === "ORANGE") await sfx.placeOrange();
    else await sfx.placeGreen();

    const updated = cells.map((c) =>
      c.id === cell.id ? { ...c, owner: team } : c
    );
    setCells(updated);

    const won = checkWin(updated, gridSize, team);

    if (won) {
      await sfx.win();

      if (team === "ORANGE") {
        const newScore = scoreOrange + 1;
        setScoreOrange(newScore);

        if (newScore >= roundsToWin) {
          setWinner("ORANGE");
          setScreen("MATCH_WIN");
        } else {
          setWinner("ORANGE");
          setScreen("ROUND_WIN");
        }
      } else {
        const newScore = scoreGreen + 1;
        setScoreGreen(newScore);

        if (newScore >= roundsToWin) {
          setWinner("GREEN");
          setScreen("MATCH_WIN");
        } else {
          setWinner("GREEN");
          setScreen("ROUND_WIN");
        }
      }
    }
  };

  // ✅ شاشة كلمة المرور الفخمة
  if (!allowed) {
    return (
      <div
        dir="rtl"
        className="w-screen h-screen overflow-hidden text-white relative"
        style={{
          background:
            "radial-gradient(1200px 700px at 50% 10%, #4c1d95, #050816)",
        }}
        onPointerDown={() => {
          sfx.click().catch(() => {});
        }}
      >
        <CinematicBackground count={40} />

        {/* Glow frame */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(700px 320px at 50% 30%, rgba(255,255,255,0.10), transparent 65%)",
          }}
        />

        <div className="relative z-10 h-full w-full grid place-items-center px-4">
          <div
            className="w-full max-w-lg rounded-[28px] p-6 md:p-8"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.14)",
              backdropFilter: "blur(14px)",
              boxShadow: "0 28px 120px rgba(0,0,0,0.55)",
            }}
          >
            <div className="text-center">
              <div
                className="font-black"
                style={{
                  fontSize: "clamp(34px, 4.4vw, 52px)",
                  background:
                    "linear-gradient(90deg, #ffffff, #c7d2fe, #ffffff)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  textShadow: "0 18px 60px rgba(0,0,0,0.55)",
                }}
              >
                🔒 دخول اللعبة
              </div>

              <div className="mt-2 text-sm opacity-80">
                أدخل كلمة المرور للمتابعة
              </div>
            </div>

            <div className="mt-6 grid gap-3">
              <div
                className="rounded-2xl p-[1px]"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(255,255,255,0.35), rgba(255,255,255,0.10))",
                }}
              >
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPwError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const ok = password === correctPassword;
                      if (ok) {
                        setAllowed(true);
                      } else {
                        sfx.error().catch(() => {});
                        setPwError("كلمة المرور غير صحيحة");
                      }
                    }
                  }}
                  className="w-full rounded-2xl px-4 py-4 text-black outline-none text-lg"
                  style={{
                    background: "rgba(255,255,255,0.92)",
                  }}
                />
              </div>

              {pwError && (
                <div
                  className="rounded-2xl px-4 py-3 text-sm font-bold"
                  style={{
                    background: "rgba(239,68,68,0.15)",
                    border: "1px solid rgba(239,68,68,0.35)",
                    color: "#fecaca",
                  }}
                >
                  ❌ {pwError}
                </div>
              )}

              <button
                className="rounded-2xl px-6 py-4 text-lg font-extrabold transition active:scale-[0.98]"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.95), rgba(255,255,255,0.75))",
                  color: "#111827",
                  boxShadow: "0 18px 60px rgba(0,0,0,0.35)",
                }}
                onClick={async () => {
                  await sfx.click2();
                  if (password === correctPassword) {
                    setAllowed(true);
                  } else {
                    await sfx.error();
                    setPwError("كلمة المرور غير صحيحة");
                  }
                }}
              >
                دخول
              </button>

              <div className="text-center text-xs opacity-60 mt-1">
                تلميح: تقدر تضغط Enter بعد كتابة كلمة المرور
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ اللعبة
  return (
    <div
      dir="rtl"
      className="w-screen h-screen overflow-hidden text-white relative"
      style={{
        background:
          "radial-gradient(1200px 700px at 50% 10%, #4c1d95, #050816)",
      }}
      onPointerDown={() => {
        sfx.click().catch(() => {});
      }}
    >
      <CinematicBackground count={34} />

      <div className="relative z-10 w-screen h-screen px-4 py-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="text-2xl font-extrabold tracking-wide">{gameName}</div>

          <div className="flex gap-2">
            {screen === "GAME" && (
              <button
                className="rounded-full px-4 py-2 text-sm font-bold"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
                onClick={() => {
                  if (document.fullscreenElement)
                    document.exitFullscreen().catch(() => {});
                }}
              >
                خروج من ملء الشاشة
              </button>
            )}

            <button
              className="rounded-full px-4 py-2 text-sm font-bold"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
              onClick={async () => {
                await sfx.click();
                setScreen("SETTINGS");
              }}
            >
              الإعدادات
            </button>

            <button
              className="rounded-full px-4 py-2 text-sm font-bold"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
              onClick={resetToMenu}
            >
              الرئيسية
            </button>
          </div>
        </div>

        {/* MENU */}
        {screen === "MENU" && (
          <div className="h-[calc(100vh-90px)] grid place-items-center">
            <div
              className="w-full max-w-xl rounded-3xl p-8 text-center"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.10)",
                backdropFilter: "blur(12px)",
                boxShadow: "0 24px 90px rgba(0,0,0,0.45)",
              }}
            >
              <div
                className="font-black leading-tight"
                style={{
                  fontSize: "clamp(42px, 6vw, 70px)",
                  background:
                    "linear-gradient(90deg, #ffffff, #c7d2fe, #ffffff)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  textShadow: "0 18px 60px rgba(0,0,0,0.55)",
                  letterSpacing: "0.5px",
                }}
              >
                {gameName}
              </div>

              <div className="mt-10 grid gap-3">
                <button
                  className="rounded-2xl px-6 py-3 text-lg font-extrabold transition active:scale-[0.98]"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.95), rgba(255,255,255,0.75))",
                    color: "#111827",
                    boxShadow: "0 18px 60px rgba(0,0,0,0.35)",
                  }}
                  onClick={async () => {
                    await requestFullscreen();
                    await startMatch();
                  }}
                >
                  بدء اللعبة (ملء الشاشة)
                </button>

                <button
                  className="rounded-2xl px-6 py-3 text-lg font-extrabold transition active:scale-[0.98]"
                  style={{
                    background: "rgba(255,255,255,0.10)",
                    border: "1px solid rgba(255,255,255,0.14)",
                  }}
                  onClick={async () => {
                    await sfx.click();
                    setScreen("SETTINGS");
                  }}
                >
                  إعدادات
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS */}
        {screen === "SETTINGS" && (
          <div className="h-[calc(100vh-90px)] mt-4 grid gap-5 md:grid-cols-2">
            <SideCard title="إعدادات اللعبة">
              <div className="grid gap-3">
                <label className="text-sm opacity-80">اسم اللعبة</label>
                <input
                  dir="rtl"
                  inputMode="text"
                  autoComplete="off"
                  className="w-full rounded-2xl px-4 py-3 text-black outline-none"
                  value={gameName}
                  onFocus={(e) => e.currentTarget.select()}
                  onChange={(e) => setGameName(e.target.value)}
                />

                <label className="text-sm opacity-80">حجم الشبكة</label>
                <div className="flex gap-2">
                  {[5, 6, 7].map((n) => (
                    <button
                      key={n}
                      className="flex-1 rounded-2xl px-4 py-3 font-bold transition active:scale-[0.98]"
                      style={{
                        background:
                          gridSize === n ? "white" : "rgba(255,255,255,0.08)",
                        color: gridSize === n ? "#111827" : "white",
                        border: "1px solid rgba(255,255,255,0.14)",
                      }}
                      onClick={async () => {
                        await sfx.click();
                        setGridSize(n);
                      }}
                    >
                      {n}×{n}
                    </button>
                  ))}
                </div>

                <label className="text-sm opacity-80">عدد الجولات للفوز</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      className="flex-1 rounded-2xl px-4 py-3 font-bold transition active:scale-[0.98]"
                      style={{
                        background:
                          roundsToWin === n ? "white" : "rgba(255,255,255,0.08)",
                        color: roundsToWin === n ? "#111827" : "white",
                        border: "1px solid rgba(255,255,255,0.14)",
                      }}
                      onClick={async () => {
                        await sfx.click();
                        setRoundsToWin(n);
                      }}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </SideCard>

            <SideCard title="إعدادات الفرق">
              <div className="grid gap-4">
                <div>
                  <div className="font-bold mb-2">البرتقالي</div>
                  <input
                    dir="rtl"
                    autoComplete="off"
                    className="w-full rounded-2xl px-4 py-3 text-black outline-none"
                    value={team1Name}
                    onFocus={(e) => e.currentTarget.select()}
                    onChange={(e) => setTeam1Name(e.target.value)}
                  />
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-sm opacity-80">لون</span>
                    <input
                      type="color"
                      value={team1Color}
                      onChange={(e) => setTeam1Color(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <div className="font-bold mb-2">الأخضر</div>
                  <input
                    dir="rtl"
                    autoComplete="off"
                    className="w-full rounded-2xl px-4 py-3 text-black outline-none"
                    value={team2Name}
                    onFocus={(e) => e.currentTarget.select()}
                    onChange={(e) => setTeam2Name(e.target.value)}
                  />
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-sm opacity-80">لون</span>
                    <input
                      type="color"
                      value={team2Color}
                      onChange={(e) => setTeam2Color(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  className="rounded-2xl px-6 py-3 font-extrabold transition active:scale-[0.98]"
                  style={{ background: "white", color: "#111827" }}
                  onClick={async () => {
                    await sfx.click2();
                    setScreen("MENU");
                  }}
                >
                  حفظ
                </button>
              </div>
            </SideCard>
          </div>
        )}

        {/* GAME */}
        {screen === "GAME" && (
          <div className="h-[calc(100vh-90px)] mt-4 grid gap-4 lg:grid-cols-[1fr_2.4fr_1fr]">
            <SideCard title="معلومات">
              <div className="grid gap-3 text-sm opacity-90">
                <div>
                  الجولة: <b>{roundIndex}</b>
                </div>
                <div>
                  الفوز بالمباراة: <b>{roundsToWin}</b> جولات
                </div>

                <div className="mt-2">
                  <div style={{ color: team1Color, fontWeight: 900 }}>
                    {team1Name}: {scoreOrange}
                  </div>
                  <div style={{ color: team2Color, fontWeight: 900 }}>
                    {team2Name}: {scoreGreen}
                  </div>
                </div>

                <div className="mt-4">
                  <div className="font-bold mb-2">اختر من يجاوب:</div>
                  <div className="flex gap-2">
                    <button
                      className="flex-1 rounded-2xl px-4 py-3 font-extrabold transition active:scale-[0.98]"
                      style={{
                        background:
                          manualTeam === "ORANGE"
                            ? team1Color
                            : "rgba(255,255,255,0.08)",
                        border: "1px solid rgba(255,255,255,0.12)",
                      }}
                      onClick={async () => {
                        await sfx.click();
                        setManualTeam("ORANGE");
                      }}
                    >
                      {team1Name}
                    </button>

                    <button
                      className="flex-1 rounded-2xl px-4 py-3 font-extrabold transition active:scale-[0.98]"
                      style={{
                        background:
                          manualTeam === "GREEN"
                            ? team2Color
                            : "rgba(255,255,255,0.08)",
                        border: "1px solid rgba(255,255,255,0.12)",
                      }}
                      onClick={async () => {
                        await sfx.click();
                        setManualTeam("GREEN");
                      }}
                    >
                      {team2Name}
                    </button>
                  </div>
                </div>

                <div className="mt-4 text-xs opacity-70 leading-relaxed">
                  * البرتقالي لازم يوصل من فوق لتحت
                  <br />
                  * الأخضر لازم يوصل من اليمين لليسار
                </div>
              </div>
            </SideCard>

            <div className="h-full flex flex-col">
              <div className="mb-2 flex items-center justify-between text-sm opacity-90">
                <div>
                  البرتقالي: <b>فوق → تحت</b> | الأخضر: <b>يمين → يسار</b>
                </div>
                <div>
                  حجم الشبكة: <b>{gridSize}×{gridSize}</b>
                </div>
              </div>

              <div className="flex-1 flex items-center justify-center">
                <BoardFrame orange={team1Color} green={team2Color}>
                  <HexBoard
                    gridSize={gridSize}
                    cells={cells}
                    onCellClick={onCellClick}
                    team1Color={team1Color}
                    team2Color={team2Color}
                  />
                </BoardFrame>
              </div>
            </div>

            <SideCard title="أوامر">
              <div className="grid gap-3">
                <button
                  className="rounded-2xl px-6 py-3 font-extrabold transition active:scale-[0.98]"
                  style={{ background: "white", color: "#111827" }}
                  onClick={async () => {
                    await sfx.click2();
                    setCells(makeBoard(gridSize));
                  }}
                >
                  إعادة خلط الحروف
                </button>

                <button
                  className="rounded-2xl px-6 py-3 font-extrabold transition active:scale-[0.98]"
                  style={{
                    background: "rgba(255,255,255,0.10)",
                    border: "1px solid rgba(255,255,255,0.14)",
                  }}
                  onClick={startMatch}
                >
                  مباراة جديدة
                </button>

                <button
                  className="rounded-2xl px-6 py-3 font-extrabold transition active:scale-[0.98]"
                  style={{
                    background: "rgba(255,255,255,0.10)",
                    border: "1px solid rgba(255,255,255,0.14)",
                  }}
                  onClick={resetToMenu}
                >
                  الرئيسية
                </button>
              </div>
            </SideCard>
          </div>
        )}

        {/* ROUND WIN */}
        {screen === "ROUND_WIN" && winner && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
            <div
              className="w-full max-w-xl rounded-3xl p-8 text-center"
              style={{
                background: "#0b1020",
                border: "1px solid rgba(255,255,255,0.14)",
              }}
            >
              <div className="text-5xl font-extrabold">🎉 مبروك!</div>
              <div className="mt-3 text-lg opacity-90">
                الفائز في الجولة {roundIndex} هو:
              </div>

              <div
                className="mt-4 text-3xl font-extrabold"
                style={{
                  color: winner === "ORANGE" ? team1Color : team2Color,
                }}
              >
                {winner === "ORANGE" ? team1Name : team2Name}
              </div>

              <div className="mt-8 flex gap-3 justify-center">
                <button
                  className="rounded-2xl px-6 py-3 text-lg font-extrabold transition active:scale-[0.98]"
                  style={{ background: "white", color: "#111827" }}
                  onClick={nextRound}
                >
                  الجولة التالية
                </button>

                <button
                  className="rounded-2xl px-6 py-3 text-lg font-extrabold transition active:scale-[0.98]"
                  style={{
                    background: "rgba(255,255,255,0.10)",
                    border: "1px solid rgba(255,255,255,0.14)",
                  }}
                  onClick={resetToMenu}
                >
                  الرئيسية
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MATCH WIN */}
        {screen === "MATCH_WIN" && winner && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
            <div
              className="w-full max-w-xl rounded-3xl p-8 text-center"
              style={{
                background: "#0b1020",
                border: "1px solid rgba(255,255,255,0.14)",
              }}
            >
              <div className="text-5xl font-extrabold">🏆 مبروك!</div>
              <div className="mt-3 text-lg opacity-90">
                انتهت المباراة والفائز هو:
              </div>

              <div
                className="mt-4 text-3xl font-extrabold"
                style={{
                  color: winner === "ORANGE" ? team1Color : team2Color,
                }}
              >
                {winner === "ORANGE" ? team1Name : team2Name}
              </div>

              <div className="mt-8 flex gap-3 justify-center">
                <button
                  className="rounded-2xl px-6 py-3 text-lg font-extrabold transition active:scale-[0.98]"
                  style={{ background: "white", color: "#111827" }}
                  onClick={startMatch}
                >
                  مباراة جديدة
                </button>

                <button
                  className="rounded-2xl px-6 py-3 text-lg font-extrabold transition active:scale-[0.98]"
                  style={{
                    background: "rgba(255,255,255,0.10)",
                    border: "1px solid rgba(255,255,255,0.14)",
                  }}
                  onClick={resetToMenu}
                >
                  الرئيسية
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}