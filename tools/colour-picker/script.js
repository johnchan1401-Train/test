(function () {
  var colorInput = document.getElementById("color-input");
  var hexOutput = document.getElementById("hex-value");
  var rgbOutput = document.getElementById("rgb-value");
  var hslOutput = document.getElementById("hsl-value");
  var copyStatus = document.getElementById("copy-status");
  var copyStatusTimer = null;

  function hexToRgb(hex) {
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);
    return { r: r, g: g, b: b };
  }

  function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    var max = Math.max(r, g, b);
    var min = Math.min(r, g, b);
    var h = 0;
    var s = 0;
    var l = (max + min) / 2;

    if (max !== min) {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }

  function update() {
    var hex = colorInput.value;
    var rgb = hexToRgb(hex);
    var hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

    hexOutput.textContent = hex.toUpperCase();
    rgbOutput.textContent = "rgb(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ")";
    hslOutput.textContent = "hsl(" + hsl.h + ", " + hsl.s + "%, " + hsl.l + "%)";
  }

  function showCopyStatus(message) {
    copyStatus.textContent = message;
    if (copyStatusTimer) clearTimeout(copyStatusTimer);
    copyStatusTimer = setTimeout(function () {
      copyStatus.textContent = "";
    }, 1500);
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        function () {
          showCopyStatus("Copied " + text);
        },
        function () {
          showCopyStatus("Couldn't copy - copy manually: " + text);
        }
      );
    } else {
      showCopyStatus("Clipboard not available - copy manually: " + text);
    }
  }

  colorInput.addEventListener("input", update);

  document.querySelectorAll("[data-copy-target]").forEach(function (button) {
    button.addEventListener("click", function () {
      var target = document.getElementById(button.getAttribute("data-copy-target"));
      copyText(target.textContent);
    });
  });

  document.querySelectorAll(".format-value").forEach(function (output) {
    output.addEventListener("click", function () {
      copyText(output.textContent);
    });
  });

  update();
})();
