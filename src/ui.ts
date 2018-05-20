window.onload = () => {
  const canvas: HTMLCanvasElement | null = document.getElementById("canvas") as HTMLCanvasElement | null;
  if (canvas == null) { throw new Error("Cannot find canvas element"); }
  start(canvas);
}

