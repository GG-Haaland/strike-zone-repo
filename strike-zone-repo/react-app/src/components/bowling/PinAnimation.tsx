'use client';
import { useRef, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';

const PIN_COLS = [[0], [1, 2], [3, 4, 5], [6, 7, 8, 9]];

export interface PinAnimationHandle {
  animate: (pins: number, rolls: number[], frameIdx: number) => void;
}

export const PinAnimation = forwardRef<PinAnimationHandle>((_, ref) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const ballRef  = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const figRef   = useRef<HTMLDivElement>(null);
  const pinsRef  = useRef<HTMLDivElement>(null);
  const standingRef = useRef<number[]>([0,1,2,3,4,5,6,7,8,9]);

  const buildPins = useCallback((standing: number[]) => {
    standingRef.current = standing;
    const container = pinsRef.current;
    if (!container) return;
    container.innerHTML = '';
    PIN_COLS.forEach(col => {
      const colDiv = document.createElement('div');
      colDiv.className = 'pin-col';
      col.forEach(idx => {
        const pin = document.createElement('div');
        pin.className = 'pin' + (standing.includes(idx) ? '' : ' down');
        colDiv.appendChild(pin);
      });
      container.appendChild(colDiv);
    });
  }, []);

  // Init pins on mount
  useEffect(() => { buildPins([0,1,2,3,4,5,6,7,8,9]); }, [buildPins]);

  const spawnBurst = useCallback((container: HTMLDivElement, cx: number, cy: number, type: string, count: number, delayMs: number) => {
    setTimeout(() => {
      for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        const angle = Math.random() * 360;
        const maxDist = type === 'strike' ? 28 + Math.random() * 20
                      : type === 'spare'  ? 16 + Math.random() * 14
                      :                      8 + Math.random() * 8;
        const dx = Math.cos(angle * Math.PI / 180) * maxDist;
        const dy = Math.sin(angle * Math.PI / 180) * maxDist;
        const sz = type === 'strike' ? 4 + Math.random() * 5
                 : type === 'spare'  ? 3 + Math.random() * 3
                 :                     2 + Math.random() * 2;
        const dur = 0.38 + Math.random() * 0.32;
        p.className = `impact-particle impact-${type}`;
        p.style.cssText = `left:${cx}px;top:${cy}px;width:${sz}px;height:${sz}px;--dx:${dx}px;--dy:${dy}px;--dur:${dur}s;animation-duration:${dur}s;`;
        container.appendChild(p);
        setTimeout(() => p.remove(), dur * 1000 + 100);
      }
    }, delayMs);
  }, []);

  const triggerImpact = useCallback((type: string) => {
    const laneTrack = trackRef.current;
    const pinDisp   = pinsRef.current;
    const flashEl   = flashRef.current;
    if (!laneTrack || !pinDisp) return;

    const trackRect = laneTrack.getBoundingClientRect();
    const pinRect   = pinDisp.getBoundingClientRect();
    const cx = pinRect.left - trackRect.left + pinRect.width * 0.5;
    const cy = pinRect.top  - trackRect.top  + pinRect.height * 0.5;

    if (type === 'gutter') {
      laneTrack.classList.add('shaking');
      setTimeout(() => laneTrack.classList.remove('shaking'), 600);
      return;
    }
    if (type === 'strike') {
      if (flashEl) {
        flashEl.className = 'strike-flash active';
        setTimeout(() => { flashEl.className = 'strike-flash'; }, 1100);
      }
      spawnBurst(laneTrack, cx, cy, 'strike', 10, 0);
      spawnBurst(laneTrack, cx, cy, 'strike', 7, 80);
      spawnBurst(laneTrack, cx, cy, 'strike', 5, 160);
    } else if (type === 'spare') {
      spawnBurst(laneTrack, cx, cy, 'spare', 7, 0);
      spawnBurst(laneTrack, cx, cy, 'spare', 4, 100);
    } else {
      spawnBurst(laneTrack, cx, cy, 'hit', 3, 0);
    }
  }, [spawnBurst]);

  useImperativeHandle(ref, () => ({
    animate(pins: number, rolls: number[], frameIdx: number) {
      const ball = ballRef.current;
      const fig  = figRef.current;

      // Standing before this roll
      let standing = [0,1,2,3,4,5,6,7,8,9];
      if (rolls.length > 1) standing = standing.slice(rolls[0]);
      buildPins(standing);

      // Bowler figure throw
      if (fig) {
        fig.classList.remove('throwing');
        void (fig as HTMLElement).offsetWidth;
        fig.classList.add('throwing');
        setTimeout(() => fig.classList.remove('throwing'), 600);
      }

      // Ball roll
      if (ball) {
        ball.className = 'ball';
        void (ball as HTMLElement).offsetWidth;
        ball.className = 'ball rolling';
      }

      // Determine impact type
      let impactType: string;
      if (pins === 0) impactType = 'gutter';
      else if (pins === 10 && standing.length === 10) impactType = 'strike';
      else if (standing.length > 0 && pins >= standing.length) impactType = 'spare';
      else impactType = 'hit';

      setTimeout(() => {
        if (pins >= standing.length) buildPins([]);
        else buildPins(standing.slice(pins));
        triggerImpact(impactType);
      }, 1260);
    }
  }), [buildPins, triggerImpact]);

  return (
    <div className="lane-container" id="lane-container">
      <div className="lane-track" id="lane-track" ref={trackRef}>
        <div className="bowler-zone">
          <div className="bowler-figure" id="bowler-figure" ref={figRef}>
            <div className="bf-head"></div>
            <div className="bf-body"></div>
            <div className="bf-arm"></div>
          </div>
        </div>
        <div className="lane-surface">
          <div className="lane-dot-row">
            {Array.from({ length: 7 }, (_, i) => <div key={i} className="lane-dot"></div>)}
          </div>
          <div className="lane-arrow-row">
            {Array.from({ length: 5 }, (_, i) => <div key={i} className="lane-arrow"></div>)}
          </div>
        </div>
        <div className="ball" id="bowling-ball" ref={ballRef}></div>
        <div className="pin-zone">
          <div className="pin-display" id="pin-display" ref={pinsRef}></div>
        </div>
        <div className="strike-flash" id="strike-flash" ref={flashRef}></div>
      </div>
    </div>
  );
});

PinAnimation.displayName = 'PinAnimation';
