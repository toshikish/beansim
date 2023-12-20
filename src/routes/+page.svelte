<script>
  import { scaleLinear } from 'd3-scale';
  import { onMount, onDestroy } from 'svelte';
  import { fade } from 'svelte/transition';
  import { Transition, generatePath, pullHe, flipHorizontally, differentiate } from '$lib/polyline';
  import { Hysteresis } from '$lib/hysteresis';

  const xScale = scaleLinear().domain([-100, 100]).range([-1000, 1000]);
  const yScale = scaleLinear().domain([-200, 200]).range([2000, -2000]);
  const jyScale = scaleLinear().domain([-1, 1]).range([500, -500]);

  let trseq = [0.0, 1.5, -1.5, 1.0];

  onMount(() => {
    const hash = window.location.hash;
    // Check if the hash is a comma-separated sequence of multiples of 5.
    if (/^#((-?[05]|-?([1-9]\d*)[05]),)*(-?[05]|-?([1-9]\d*)[05])$/.test(hash)) {
      trseq = hash
        .substring(1)
        .split(',')
        .map((s) => s / 10);
    }

    baseURL = window.location.href.split('#')[0];
  });

  function handleClickPlus() {
    trseq = [...trseq, trseq[trseq.length - 1] === 0.0 ? 0.5 : 0.0]; // Continuation of the same value (0.0) will cause an error.
  }

  function handleClickMinus(i) {
    trseq.splice(i, 1);
    trseq = trseq;
  }

  let copied = false;
  function handleClickCopy() {
    navigator.clipboard.writeText(url);
    copied = true;
    setTimeout(() => {
      copied = false;
    }, 2000);
  }

  let tran, maxt, hyst, arrows, baseURL, url;
  $: {
    tran = new Transition(trseq.slice(1).map((x) => x * 100));
    maxt = trseq.reduce((ac, v, i) => ac + Math.abs(trseq[i] - trseq[i - 1])) * 100;
    hyst = new Hysteresis(tran, maxt);
    arrows = hyst.calcArrows();
    url = baseURL + `#${trseq.map((x) => x * 10)}`;
  }
  let t = 0;
  $: if (t > maxt) {
    t = maxt;
  }
  $: roundt = Math.round(t);
  $: points = tran.calcPoints(t);
  $: hx = flipHorizontally(pullHe(points));
  $: jx = differentiate(hx);

  let playing = false;
  let frame;
  let lastTime;

  function update() {
    const time = window.performance.now();
    t += (time - lastTime) / 10;
    lastTime = time;

    if (t > maxt) {
      playing = false;
      t = maxt;
      return;
    }
    frame = requestAnimationFrame(update);
  }

  function handleClickPlay() {
    if (playing) {
      playing = false;
      cancelAnimationFrame(frame);
    } else {
      playing = true;
      if (t === maxt) t = 0;
      lastTime = window.performance.now();
      requestAnimationFrame(update);
    }
  }

  onDestroy(() => {
    if (typeof window !== 'undefined') {
      cancelAnimationFrame(frame);
    }
  });
</script>

<svelte:head>
  <title>Type-II Superconductor Bean Model Simulator</title>
</svelte:head>

<h1>Type-II Superconductor Bean Model Simulator</h1>

<div id="graph">
  <figure>
    <svg viewBox="-1205 -2005 2410 4010">
      <defs>
        <pattern id="smallGrid" width="10" height="10" patternUnits="userSpaceOnUse">
          <rect width="10" height="10" fill="none" stroke="gray" stroke-width="1" />
        </pattern>
        <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
          <rect width="100" height="100" fill="url(#smallGrid)" stroke="gray" stroke-width="4" />
        </pattern>
      </defs>
      <rect
        x="-1202"
        y="-2002"
        width="2404"
        height="4004"
        fill="url(#grid)"
        style="opacity: 0.2;"
      />
      <line x1="-1000" y1="-2000" x2="-1000" y2="2000" stroke="black" stroke-width="2"></line>
      <line x1="0" y1="-2000" x2="0" y2="2000" stroke="black" stroke-width="2"></line>
      <line x1="1000" y1="-2000" x2="1000" y2="2000" stroke="black" stroke-width="2"></line>
      <line x1="-1000" y1="0" x2="1000" y2="0" stroke="black" stroke-width="2"></line>
      <text x="-1020" y="0" text-anchor="end" alignment-baseline="central">0</text>
      <text x="-1020" y="-1000" text-anchor="end" dominant-baseline="middle">
        <tspan class="italic">H</tspan>
        <tspan class="sub" baseline-shift="sub">p</tspan>
      </text>
      <line x1="-1000" y1="-1000" x2="-950" y2="-1000" stroke="black" stroke-width="2"></line>
      <line x1="1000" y1="-1000" x2="950" y2="-1000" stroke="black" stroke-width="2"></line>
      <text x="-1020" y="1000" text-anchor="end" dominant-baseline="middle">
        &minus;
        <tspan class="italic">H</tspan>
        <tspan class="sub" baseline-shift="sub">p</tspan>
      </text>
      <line x1="-1000" y1="1000" x2="-950" y2="1000" stroke="black" stroke-width="2"></line>
      <line x1="1000" y1="1000" x2="950" y2="1000" stroke="black" stroke-width="2"></line>

      <path d={generatePath(hx, xScale, yScale)} fill="none" stroke="red" stroke-width="5" />
    </svg>
    <figcaption>Fig. 1 Magnetic field distribution</figcaption>
  </figure>

  <figure>
    <svg viewBox="-1205 -1005 2410 2010">
      <defs>
        <pattern id="smallGrid" width="10" height="10" patternUnits="userSpaceOnUse">
          <rect width="10" height="10" fill="none" stroke="gray" stroke-width="1" />
        </pattern>
        <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
          <rect width="100" height="100" fill="url(#smallGrid)" stroke="gray" stroke-width="4" />
        </pattern>
      </defs>
      <rect
        x="-1202"
        y="-1002"
        width="2404"
        height="2004"
        fill="url(#grid)"
        style="opacity: 0.2;"
      />
      <line x1="-1000" y1="-1000" x2="-1000" y2="1000" stroke="black" stroke-width="2"></line>
      <line x1="0" y1="-1000" x2="0" y2="1000" stroke="black" stroke-width="2"></line>
      <line x1="1000" y1="-1000" x2="1000" y2="1000" stroke="black" stroke-width="2"></line>
      <line x1="-1000" y1="0" x2="1000" y2="0" stroke="black" stroke-width="2"></line>
      <text x="-1020" y="0" text-anchor="end" alignment-baseline="central">0</text>
      <text x="-1020" y="-500" text-anchor="end" dominant-baseline="middle">
        <tspan class="italic">J</tspan>
        <tspan class="sub" baseline-shift="sub">c</tspan>
      </text>
      <line x1="-1000" y1="-500" x2="-950" y2="-500" stroke="black" stroke-width="2"></line>
      <line x1="1000" y1="-500" x2="950" y2="-500" stroke="black" stroke-width="2"></line>
      <text x="-1020" y="500" text-anchor="end" dominant-baseline="middle">
        &minus;
        <tspan class="italic">J</tspan>
        <tspan class="sub" baseline-shift="sub">c</tspan>
      </text>
      <line x1="-1000" y1="500" x2="-950" y2="500" stroke="black" stroke-width="2"></line>
      <line x1="1000" y1="500" x2="950" y2="500" stroke="black" stroke-width="2"></line>

      <path d={generatePath(jx, xScale, jyScale)} fill="none" stroke="red" stroke-width="4" />
    </svg>
    <figcaption>Fig. 2 Current distribution</figcaption>
  </figure>
</div>

<div id="transition">
  <figure>
    <svg viewBox="-2005 -705 4010 1410">
      <defs>
        <pattern id="smallGrid" width="10" height="10" patternUnits="userSpaceOnUse">
          <rect width="10" height="10" fill="none" stroke="gray" stroke-width="1" />
        </pattern>
        <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
          <rect width="100" height="100" fill="url(#smallGrid)" stroke="gray" stroke-width="4" />
        </pattern>
        <path
          id="arrowhead"
          d="M -25 25 l 50 -25 l -50 -25"
          fill="none"
          stroke="red"
          stroke-width="4"
        />
      </defs>
      <rect x="-2002" y="-702" width="4004" height="1404" fill="url(#grid)" style="opacity: 0.2;" />
      <text x="0" y="0" text-anchor="end" dominant-baseline="hanging">0</text>
      <!-- x-axis -->
      <line x1="-2000" y1="0" x2="2000" y2="0" stroke="black" stroke-width="2"></line>
      <text x="2000" y="0" text-anchor="end" dominant-baseline="hanging">
        <tspan class="italic">H</tspan>
        <tspan class="sub" baseline-shift="sub">e</tspan>
      </text>
      <text x="1000" y="0" text-anchor="end" dominant-baseline="hanging">
        <tspan class="italic">H</tspan>
        <tspan class="sub" baseline-shift="sub">p</tspan>
      </text>
      <line x1="1000" y1="0" x2="1000" y2="-50" stroke="black" stroke-width="2"></line>
      <text x="-1000" y="0" text-anchor="end" dominant-baseline="hanging">
        &minus;
        <tspan class="italic">H</tspan>
        <tspan class="sub" baseline-shift="sub">p</tspan>
      </text>
      <line x1="-1000" y1="0" x2="-1000" y2="-50" stroke="black" stroke-width="2"></line>
      <!-- y-axis -->
      <line x1="0" y1="-700" x2="0" y2="700" stroke="black" stroke-width="2"></line>
      <text x="0" y="-700" text-anchor="end" dominant-baseline="hanging">
        &minus;
        <tspan class="italic">M</tspan>
      </text>
      <text x="0" y="-500" text-anchor="end" dominant-baseline="middle">
        ½
        <tspan class="italic">H</tspan>
        <tspan class="sub" baseline-shift="sub">p</tspan>
      </text>
      <line x1="0" y1="-500" x2="50" y2="-500" stroke="black" stroke-width="2"></line>
      <text x="0" y="500" text-anchor="end" dominant-baseline="middle">
        &minus;½
        <tspan class="italic">H</tspan>
        <tspan class="sub" baseline-shift="sub">p</tspan>
      </text>
      <line x1="0" y1="500" x2="50" y2="500" stroke="black" stroke-width="2"></line>
      <!-- hysteresis -->
      <path
        d={generatePath(hyst.points, xScale, yScale)}
        fill="none"
        stroke="red"
        stroke-width="4"
      />
      <circle
        cx={xScale(hyst.points[roundt].x)}
        cy={yScale(hyst.points[roundt].y)}
        r="30"
        fill="red"
        stroke="none"
      />
      {#each arrows as { x, y, deg }}
        <use
          href="#arrowhead"
          x={xScale(x)}
          y={yScale(y)}
          transform="rotate({-deg} {xScale(x)} {yScale(y)})"
        />
      {/each}
    </svg>
    <figcaption>Fig. 3 Magnetization vs. field (hysteresis)</figcaption>
  </figure>

  <h2>Configuration</h2>
  <h3>External magnetic field transition</h3>
  <table>
    <thead>
      <tr>
        <th></th>
        <th>He</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      <tr class={t === 0 ? 'active' : ''}>
        <td></td>
        <td>0</td>
        <td></td>
      </tr>
      {#each Array(trseq.length - 1) as _, i}
        <tr class={t > 0 && tran.lowerBound(t) === i ? 'active' : ''}>
          <td>{trseq[i + 1] > trseq[i] ? '↗' : trseq[i + 1] === trseq[i] ? '→' : '↘'}</td>
          <td>
            <input type="number" min="-2" max="2" step="0.5" bind:value={trseq[i + 1]} />
            Hp
          </td>
          <td>
            <button on:click={() => handleClickMinus(i + 1)} disabled={trseq[i] === trseq[i + 2]}>
              -
            </button>
          </td>
        </tr>
      {/each}
      <tr>
        <td colspan="3"><button on:click={handleClickPlus} style="width: 100%;">+</button></td>
      </tr>
    </tbody>
  </table>

  <h2>Share</h2>
  <label for="url">URL:</label>
  <input
    type="url"
    bind:value={url}
    readonly
    size="50"
    id="url"
    on:focus={(e) => e.target.select()}
    on:click={(e) => e.target.select()}
  />
  <button on:click={handleClickCopy}>Copy</button>
  {#if copied}
    <span class="red" transition:fade>Copied!</span>
  {/if}
</div>

<div id="progress">
  <h2>
    <label for="time">Time</label>
  </h2>
  <input type="range" bind:value={t} min="0" max={maxt} id="time" list="markers" />
  <datalist id="markers">
    {#each Array(maxt / 50 + 1) as _, i}
      <option value={i * 50} label={i * 50}></option>
    {/each}
  </datalist>
  <button on:click={handleClickPlay}>
    {@html playing ? '&#x23f8; Pause' : '&#x25b6; Play'}
  </button>
</div>

<footer>
  <a href="https://github.com/toshikish/beansim">View on GitHub</a>
</footer>

<style>
  div#graph {
    float: left;
  }

  @media (width < 300px) {
    div#graph {
      width: 100%;
    }
  }

  @media (300px <= width < 600px) {
    div#graph {
      width: 300px;
    }

    div#transition {
      width: 100%;
    }
  }

  @media (600px <= width) {
    div#graph {
      width: 300px;
    }

    div#transition figure {
      width: 500px;
    }
  }

  figure {
    margin-inline: 1em;
  }

  svg {
    width: 100%;
  }

  svg text {
    font: 100px serif;
  }

  tspan.italic {
    font-style: italic;
    letter-spacing: 10px;
  }

  tspan.sub {
    font-size: 0.8em;
    vertical-align: sub;
  }

  div#transition {
    float: left;
  }

  table {
    border-collapse: collapse;
  }

  td {
    padding: 0.3rem;
  }

  .red {
    color: red;
  }

  div#progress {
    float: left;
    width: 100%;
  }

  input#time {
    width: 100%;
  }

  datalist {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    writing-mode: vertical-lr;
    width: 100%;
  }

  div#transition tr.active {
    background-color: #ffdddd;
  }

  footer {
    float: left;
    width: 100%;
    margin: 1rem 0;
  }
</style>
