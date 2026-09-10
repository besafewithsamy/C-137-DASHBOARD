(function () {
  const css = getComputedStyle(document.documentElement);
  const themeColor = (name, fallback) => (css.getPropertyValue(name).trim() || fallback);

  class MiniChart {
    constructor(canvas, options = {}) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.options = Object.assign({
        padLeft: 44,
        padRight: 16,
        padTop: 16,
        padBottom: 30,
        gridColor: 'rgba(128, 128, 140, 0.18)',
        tickColor: '#8892B0',
        font: '11px monospace',
        tooltip: true
      }, options);

      this.datasets = [];
      this.labels = [];
      this.hover = null;

      this.resize = this.resize.bind(this);
      this.handleMove = this.handleMove.bind(this);
      this.handleLeave = this.handleLeave.bind(this);

      window.addEventListener('resize', this.resize);
      this.canvas.addEventListener('mousemove', this.handleMove);
      this.canvas.addEventListener('mouseleave', this.handleLeave);

      this.resize();
    }

    setData(labels, datasets) {
      this.labels = labels.slice();
      this.datasets = datasets.map(ds => Object.assign({}, ds));
      this.draw();
    }

    pushDataPoint(threatValue, bandwidthValue) {
      this.datasets.forEach(ds => {
        if (ds.data.length) {
          ds.data.shift();
        }
      });
      if (this.labels.length) this.labels.shift();
      if (this.datasets[0]) this.datasets[0].data.push(threatValue);
      if (this.datasets[1]) this.datasets[1].data.push(bandwidthValue);
      if (this.labels.length) this.labels.push('Now');
      this.draw();
    }

    resize() {
      const rect = this.canvas.parentElement.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      this.width = Math.max(100, rect.width);
      this.height = Math.max(80, rect.height);
      this.canvas.width = this.width * dpr;
      this.canvas.height = this.height * dpr;
      this.canvas.style.width = this.width + 'px';
      this.canvas.style.height = this.height + 'px';
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.draw();
    }

    plotArea() {
      return {
        x: this.options.padLeft,
        y: this.options.padTop,
        w: this.width - this.options.padLeft - this.options.padRight,
        h: this.height - this.options.padTop - this.options.padBottom
      };
    }

    yRange() {
      let max = 0;
      this.datasets.forEach(ds => ds.data.forEach(v => { if (v > max) max = v; }));
      if (max <= 0) max = 10;
      const pow = Math.pow(10, Math.floor(Math.log10(max)));
      const norm = max / pow;
      let nice = 10;
      if (norm <= 1) nice = 1;
      else if (norm <= 2) nice = 2;
      else if (norm <= 2.5) nice = 2.5;
      else if (norm <= 5) nice = 5;
      return nice * pow;
    }

    draw() {
      const { ctx } = this;
      const area = this.plotArea();
      ctx.clearRect(0, 0, this.width, this.height);
      if (!this.datasets.length || !this.labels.length) return;

      const yMax = this.yRange();
      const xStep = this.labels.length > 1 ? area.w / (this.labels.length - 1) : 0;

      ctx.font = this.options.font;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = this.options.tickColor;
      for (let i = 0; i <= 4; i++) {
        const val = (yMax / 4) * i;
        const y = area.y + area.h - (area.h * i / 4);
        ctx.fillText(this.formatTick(val), area.x - 8, y);
        ctx.strokeStyle = this.options.gridColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(area.x, Math.round(y) + 0.5);
        ctx.lineTo(area.x + area.w, Math.round(y) + 0.5);
        ctx.stroke();
      }

      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      this.labels.forEach((label, i) => {
        if (this.labels.length > 8 && i % 2 !== 0 && i !== this.labels.length - 1) return;
        ctx.fillText(label, area.x + xStep * i, area.y + area.h + 8);
      });

      this.datasets.forEach(ds => {
        if (!ds.data.length) return;
        const pts = ds.data.map((v, i) => ({
          x: area.x + xStep * i,
          y: area.y + area.h - (v / yMax) * area.h
        }));

        if (ds.fill !== false) {
          const grad = ctx.createLinearGradient(0, area.y, 0, area.y + area.h);
          const rgb = this.hexToRgb(ds.color);
          if (rgb) {
            grad.addColorStop(0, `rgba(${rgb}, 0.18)`);
            grad.addColorStop(1, `rgba(${rgb}, 0.02)`);
          }
          ctx.beginPath();
          pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
          ctx.lineTo(pts[pts.length - 1].x, area.y + area.h);
          ctx.lineTo(pts[0].x, area.y + area.h);
          ctx.closePath();
          ctx.fillStyle = grad;
          ctx.fill();
        }

        ctx.beginPath();
        pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
        ctx.strokeStyle = ds.color;
        ctx.lineWidth = 2;
        ctx.setLineDash(ds.dash || []);
        ctx.stroke();
        ctx.setLineDash([]);

        if (this.hover !== null) {
          const p = pts[this.hover];
          ctx.beginPath();
          ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = ds.color;
          ctx.fill();
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      });
    }

    drawLegend() {
      const { ctx } = this;
      if (!this.datasets.length) return;
      ctx.font = 'bold 11px monospace';
      ctx.textBaseline = 'middle';
      let x = this.options.padLeft;
      const y = 6;
      this.datasets.forEach(ds => {
        ctx.strokeStyle = ds.color;
        ctx.lineWidth = 2;
        ctx.setLineDash(ds.dash || []);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 16, y);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = this.options.tickColor;
        ctx.textAlign = 'left';
        ctx.fillText(ds.label, x + 22, y);
        x += 22 + (ctx.measureText(ds.label).width || 0) + 18;
      });
    }

    drawTooltip(index) {
      const { ctx } = this;
      const area = this.plotArea();
      const lines = [`x: ${this.labels[index]}`];
      this.datasets.forEach(ds => {
        lines.push(`${ds.label}: ${ds.data[index]}`);
      });

      ctx.font = this.options.font;
      const w = Math.max(...lines.map(l => ctx.measureText(l).width)) + 16;
      const h = lines.length * 16 + 8;
      let tx = area.x + (this.labels.length > 1 ? (index / (this.labels.length - 1)) * area.w : area.w / 2) + 12;
      let ty = 20;
      if (tx + w > this.width - 4) tx -= w + 24;
      if (ty + h > this.height - 4) ty = this.height - h - 4;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
      ctx.strokeStyle = 'rgba(0,0,0,0.12)';
      ctx.lineWidth = 1;
      this.roundRect(tx, ty, w, h, 4);
      ctx.fill();
      ctx.stroke();

      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      lines.forEach((line, i) => {
        ctx.fillStyle = i === 0 ? '#4A5568' : this.datasets[i - 1].color;
        ctx.fillText(line, tx + 8, ty + 12 + i * 16);
      });
    }

    roundRect(x, y, w, h, r) {
      const { ctx } = this;
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }

    formatTick(val) {
      if (val >= 1000) return (val / 1000).toLocaleString() + 'k';
      return String(Math.round(val * 10) / 10);
    }

    hexToRgb(hex) {
      const m = hex.trim().replace('#', '');
      if (m.length !== 6) return null;
      const n = parseInt(m, 16);
      return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
    }

    handleMove(e) {
      if (!this.datasets.length || !this.labels.length) return;
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const area = this.plotArea();
      if (x < area.x - 4 || x > area.x + area.w + 4) {
        this.hover = null;
      } else {
        const xStep = this.labels.length > 1 ? area.w / (this.labels.length - 1) : 0;
        this.hover = Math.max(0, Math.min(this.labels.length - 1, Math.round((x - area.x) / (xStep || 1))));
      }
      this.draw();
      if (this.hover !== null) this.drawTooltip(this.hover);
    }

    handleLeave() {
      this.hover = null;
      this.draw();
    }
  }

  class DashboardChart extends MiniChart {
    constructor(canvas) {
      super(canvas);
      this._data = { labels: [], threat: [], bandwidth: [] };
    }

    setData(labels, threat, bandwidth) {
      this._data = { labels: labels.slice(), threat: threat.slice(), bandwidth: bandwidth.slice() };
      super.setData(labels, [
        {
          label: 'Threat Activity',
          data: threat,
          color: themeColor('--accent-green', '#3B7A77'),
          fill: true
        },
        {
          label: 'Bandwidth (MB/s)',
          data: bandwidth,
          color: themeColor('--accent-cyan', '#4A8B88'),
          fill: true,
          dash: [5, 5]
        }
      ]);
    }

    push(threatValue, bandwidthValue) {
      this.pushDataPoint(threatValue, bandwidthValue);
    }

    draw() {
      super.draw();
      this.drawLegend();
      if (this.hover !== null) this.drawTooltip(this.hover);
    }
  }

  window.MiniChart = { DashboardChart };
})();
