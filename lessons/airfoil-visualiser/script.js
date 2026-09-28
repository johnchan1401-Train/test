(function () {
  var canvas = document.getElementById("airfoil-canvas");
  var ctx = canvas.getContext("2d");
  var W = canvas.width;
  var H = canvas.height;

  var nacaCodeInput = document.getElementById("naca-code");
  var camberInput = document.getElementById("camber-input");
  var positionInput = document.getElementById("position-input");
  var thicknessInput = document.getElementById("thickness-input");
  var aoaInput = document.getElementById("aoa-input");

  var camberValue = document.getElementById("camber-value");
  var positionValue = document.getElementById("position-value");
  var thicknessValue = document.getElementById("thickness-value");
  var aoaValue = document.getElementById("aoa-value");

  var originX = W * 0.18;
  var originY = H / 2;
  var chordPx = W * 0.64;
  var colStep = 3;

  var airfoilPath = null; // {upper, lower} in pixel space, for drawing the fill
  var streamlinePaths = []; // array of point arrays in pixel space
  var dashPhase = 0;

  // --- NACA geometry ------------------------------------------------------

  function nacaPoints(m, p, t, n) {
    var upper = [];
    var lower = [];

    for (var i = 0; i <= n; i++) {
      var beta = (i / n) * Math.PI;
      var x = (1 - Math.cos(beta)) / 2;

      var yt =
        5 *
        t *
        (0.2969 * Math.sqrt(x) -
          0.126 * x -
          0.3516 * x * x +
          0.2843 * x * x * x -
          0.1015 * x * x * x * x);

      var yc, dycdx;
      if (m === 0 || p === 0) {
        yc = 0;
        dycdx = 0;
      } else if (x < p) {
        yc = (m / (p * p)) * (2 * p * x - x * x);
        dycdx = ((2 * m) / (p * p)) * (p - x);
      } else {
        yc = (m / ((1 - p) * (1 - p))) * (1 - 2 * p + 2 * p * x - x * x);
        dycdx = ((2 * m) / ((1 - p) * (1 - p))) * (p - x);
      }

      var theta = Math.atan(dycdx);

      upper.push({ x: x - yt * Math.sin(theta), y: yc + yt * Math.cos(theta) });
      lower.push({ x: x + yt * Math.sin(theta), y: yc - yt * Math.cos(theta) });
    }

    return { upper: upper, lower: lower };
  }

  // Rotate about the quarter-chord point so positive angle of attack
  // pitches the leading edge up relative to the (always horizontal) flow.
  function rotateAboutQuarterChord(points, angleRad) {
    var pivotX = 0.25;
    var cos = Math.cos(angleRad);
    var sin = Math.sin(angleRad);

    return points.map(function (pt) {
      var dx = pt.x - pivotX;
      var dy = pt.y;
      return {
        x: dx * cos + dy * sin,
        y: -dx * sin + dy * cos
      };
    });
  }

  function toPixels(points) {
    return points.map(function (pt) {
      return {
        x: originX + pt.x * chordPx,
        y: originY - pt.y * chordPx
      };
    });
  }

  // --- Streamlines ---------------------------------------------------------

  function makeSampler(sortedPoints) {
    return function (xq) {
      var n = sortedPoints.length;
      if (n === 0) return null;
      if (xq < sortedPoints[0].x || xq > sortedPoints[n - 1].x) return null;
      for (var i = 0; i < n - 1; i++) {
        var a = sortedPoints[i];
        var b = sortedPoints[i + 1];
        if (xq >= a.x && xq <= b.x) {
          var t = b.x === a.x ? 0 : (xq - a.x) / (b.x - a.x);
          return a.y + (b.y - a.y) * t;
        }
      }
      return null;
    };
  }

  function buildEnvelope(upperPx, lowerPx) {
    var upperSorted = upperPx.slice().sort(function (a, b) { return a.x - b.x; });
    var lowerSorted = lowerPx.slice().sort(function (a, b) { return a.x - b.x; });
    var sampleUpper = makeSampler(upperSorted);
    var sampleLower = makeSampler(lowerSorted);

    var cols = [];
    for (var x = 0; x <= W; x += colStep) {
      var uy = sampleUpper(x);
      var ly = sampleLower(x);
      if (uy === null || ly === null) {
        cols.push({ x: x, top: null, bottom: null });
      } else {
        cols.push({ x: x, top: Math.min(uy, ly), bottom: Math.max(uy, ly) });
      }
    }
    return cols;
  }

  function buildStreamlines(envelopeCols) {
    var rows = 14;
    var marginTop = 28;
    var marginBottom = 28;
    var strength = 1.35;
    var lines = [];

    for (var r = 0; r < rows; r++) {
      var y0 = marginTop + (r / (rows - 1)) * (H - marginTop - marginBottom);
      var points = envelopeCols.map(function (col) {
        var y = y0;
        if (col.top !== null) {
          var halfT = (col.bottom - col.top) / 2;
          if (halfT > 0.5) {
            var mid = (col.top + col.bottom) / 2;
            var dy = y0 - mid;
            var sigma = halfT + 14;
            var bump = strength * halfT * Math.exp(-((dy * dy) / (2 * sigma * sigma)));
            var sign = dy >= 0 ? 1 : -1;
            y = y0 + sign * bump;
          }
        }
        return { x: col.x, y: y };
      });
      lines.push(points);
    }
    return lines;
  }

  // --- Recompute geometry on parameter change ------------------------------

  function recompute() {
    var m = parseInt(camberInput.value, 10) / 100;
    var p = parseInt(positionInput.value, 10) / 10;
    var t = parseInt(thicknessInput.value, 10) / 100;
    var aoaRad = (parseInt(aoaInput.value, 10) * Math.PI) / 180;

    var raw = nacaPoints(m, p, t, 100);
    var upperRotated = rotateAboutQuarterChord(raw.upper, aoaRad);
    var lowerRotated = rotateAboutQuarterChord(raw.lower, aoaRad);

    var upperPx = toPixels(upperRotated);
    var lowerPx = toPixels(lowerRotated);

    airfoilPath = { upper: upperPx, lower: lowerPx };

    var envelope = buildEnvelope(upperPx, lowerPx);
    streamlinePaths = buildStreamlines(envelope);
  }

  // --- Drawing ---------------------------------------------------------------

  function drawAirfoil() {
    if (!airfoilPath.upper.length) return;

    ctx.beginPath();
    ctx.moveTo(airfoilPath.upper[0].x, airfoilPath.upper[0].y);
    airfoilPath.upper.forEach(function (pt) { ctx.lineTo(pt.x, pt.y); });
    for (var i = airfoilPath.lower.length - 1; i >= 0; i--) {
      ctx.lineTo(airfoilPath.lower[i].x, airfoilPath.lower[i].y);
    }
    ctx.closePath();
    ctx.fillStyle = "#2b2320";
    ctx.fill();
    ctx.strokeStyle = "#c4623b";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function drawStreamlines() {
    ctx.strokeStyle = "rgba(196, 98, 59, 0.5)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([7, 9]);

    streamlinePaths.forEach(function (points, index) {
      ctx.lineDashOffset = -dashPhase - index * 3;
      ctx.beginPath();
      points.forEach(function (pt, i) {
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.stroke();
    });

    ctx.setLineDash([]);
  }

  function render() {
    ctx.clearRect(0, 0, W, H);
    drawStreamlines();
    drawAirfoil();
  }

  function tick() {
    dashPhase = (dashPhase + 1.4) % 1000;
    render();
    requestAnimationFrame(tick);
  }

  // --- Controls: sliders <-> NACA code -------------------------------------

  function updateReadouts() {
    camberValue.textContent = camberInput.value + "%";
    positionValue.textContent = positionInput.value + "0%";
    thicknessValue.textContent = thicknessInput.value + "%";
    aoaValue.textContent = aoaInput.value + "°";
  }

  function slidersToCode() {
    var thickness = parseInt(thicknessInput.value, 10);
    var thicknessStr = (thickness < 10 ? "0" : "") + thickness;
    return "" + camberInput.value + positionInput.value + thicknessStr;
  }

  function syncCodeFromSliders() {
    nacaCodeInput.value = slidersToCode();
  }

  function syncSlidersFromCode(code) {
    if (!/^\d{4}$/.test(code)) return false;
    camberInput.value = code.charAt(0);
    positionInput.value = code.charAt(1);
    thicknessInput.value = parseInt(code.slice(2), 10) || 1;
    return true;
  }

  function onSliderChange() {
    syncCodeFromSliders();
    updateReadouts();
    recompute();
  }

  camberInput.addEventListener("input", onSliderChange);
  positionInput.addEventListener("input", onSliderChange);
  thicknessInput.addEventListener("input", onSliderChange);
  aoaInput.addEventListener("input", function () {
    updateReadouts();
    recompute();
  });

  nacaCodeInput.addEventListener("input", function () {
    var digitsOnly = nacaCodeInput.value.replace(/\D/g, "").slice(0, 4);
    nacaCodeInput.value = digitsOnly;
    if (syncSlidersFromCode(digitsOnly)) {
      updateReadouts();
      recompute();
    }
  });

  updateReadouts();
  recompute();
  requestAnimationFrame(tick);
})();
