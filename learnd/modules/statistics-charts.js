/**
 * 背单词神器 Pro - 统计图表模块
 * Canvas 图表绘制 + 数据可视化
 * Version: 3.0.0
 */

'use strict';

// ==================== 图表绘制基类 ====================
class Chart {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        this.padding = { top: 40, right: 40, bottom: 60, left: 60 };
    }

    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    drawTitle(title) {
        this.ctx.fillStyle = '#333';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(title, this.width / 2, 20);
    }

    drawXAxis(labels) {
        const { left, right, bottom } = this.padding;
        const chartWidth = this.width - left - right;
        const y = this.height - bottom;

        // 绘制轴线
        this.ctx.beginPath();
        this.ctx.moveTo(left, y);
        this.ctx.lineTo(this.width - right, y);
        this.ctx.strokeStyle = '#ccc';
        this.ctx.stroke();

        // 绘制标签
        this.ctx.fillStyle = '#666';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';

        const step = chartWidth / (labels.length || 1);
        labels.forEach((label, index) => {
            const x = left + step * index + step / 2;
            this.ctx.save();
            this.ctx.translate(x, y + 15);
            this.ctx.rotate(-0.3);
            this.ctx.fillText(label, 0, 0);
            this.ctx.restore();
        });
    }

    drawYAxis(maxValue) {
        const { left, top, bottom } = this.padding;
        const chartHeight = this.height - top - bottom;
        const x = left;

        // 绘制轴线
        this.ctx.beginPath();
        this.ctx.moveTo(x, top);
        this.ctx.lineTo(x, this.height - bottom);
        this.ctx.strokeStyle = '#ccc';
        this.ctx.stroke();

        // 绘制刻度和标签
        this.ctx.fillStyle = '#666';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'right';

        const steps = 5;
        for (let i = 0; i <= steps; i++) {
            const value = Math.round((maxValue / steps) * i);
            const y = this.height - bottom - (chartHeight / steps) * i;

            // 绘制刻度线
            this.ctx.beginPath();
            this.ctx.moveTo(x - 5, y);
            this.ctx.lineTo(x, y);
            this.ctx.stroke();

            // 绘制标签
            this.ctx.fillText(value.toString(), x - 10, y + 4);

            // 绘制网格线
            this.ctx.strokeStyle = '#f0f0f0';
            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(this.width - this.padding.right, y);
            this.ctx.stroke();
            this.ctx.strokeStyle = '#ccc';
        }
    }
}

// ==================== 折线图 ====================
class LineChart extends Chart {
    draw(data, options = {}) {
        this.clear();

        const { title = '', color = '#667eea', fillArea = true } = options;
        const { left, right, top, bottom } = this.padding;
        const chartWidth = this.width - left - right;
        const chartHeight = this.height - top - bottom;

        // 绘制标题
        if (title) this.drawTitle(title);

        // 计算最大值
        const maxValue = Math.max(...data.values, 1);

        // 绘制坐标轴
        this.drawXAxis(data.labels);
        this.drawYAxis(maxValue);

        // 绘制数据
        if (data.values.length === 0) return;

        const step = chartWidth / data.values.length;
        const scaleY = chartHeight / maxValue;

        // 填充区域
        if (fillArea) {
            this.ctx.beginPath();
            this.ctx.moveTo(left, this.height - bottom);

            data.values.forEach((value, index) => {
                const x = left + step * (index + 0.5);
                const y = this.height - bottom - value * scaleY;
                if (index === 0) {
                    this.ctx.lineTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            });

            this.ctx.lineTo(left + chartWidth, this.height - bottom);
            this.ctx.closePath();

            const gradient = this.ctx.createLinearGradient(0, top, 0, this.height - bottom);
            gradient.addColorStop(0, color + '40');
            gradient.addColorStop(1, color + '00');
            this.ctx.fillStyle = gradient;
            this.ctx.fill();
        }

        // 绘制折线
        this.ctx.beginPath();
        data.values.forEach((value, index) => {
            const x = left + step * (index + 0.5);
            const y = this.height - bottom - value * scaleY;
            if (index === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        });
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // 绘制数据点
        data.values.forEach((value, index) => {
            const x = left + step * (index + 0.5);
            const y = this.height - bottom - value * scaleY;

            this.ctx.beginPath();
            this.ctx.arc(x, y, 4, 0, Math.PI * 2);
            this.ctx.fillStyle = color;
            this.ctx.fill();
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        });
    }
}

// ==================== 柱状图 ====================
class BarChart extends Chart {
    draw(data, options = {}) {
        this.clear();

        const { title = '', colors = ['#667eea', '#4facfe', '#fa709a'] } = options;
        const { left, right, top, bottom } = this.padding;
        const chartWidth = this.width - left - right;
        const chartHeight = this.height - top - bottom;

        // 绘制标题
        if (title) this.drawTitle(title);

        // 计算最大值
        const maxValue = Math.max(...data.values, 1);

        // 绘制坐标轴
        this.drawXAxis(data.labels);
        this.drawYAxis(maxValue);

        // 绘制柱状图
        const barWidth = (chartWidth / data.values.length) * 0.8;
        const gap = (chartWidth / data.values.length) * 0.2;
        const scaleY = chartHeight / maxValue;

        data.values.forEach((value, index) => {
            const x = left + (chartWidth / data.values.length) * index + gap / 2;
            const y = this.height - bottom - value * scaleY;
            const height = value * scaleY;

            // 绘制柱子
            const gradient = this.ctx.createLinearGradient(x, y, x, y + height);
            gradient.addColorStop(0, colors[index % colors.length]);
            gradient.addColorStop(1, colors[index % colors.length] + '80');
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(x, y, barWidth, height);

            // 绘制数值
            this.ctx.fillStyle = '#333';
            this.ctx.font = 'bold 12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(value.toString(), x + barWidth / 2, y - 5);
        });
    }
}

// ==================== 饼图 ====================
class PieChart extends Chart {
    draw(data, options = {}) {
        this.clear();

        const { title = '', colors = ['#667eea', '#4facfe', '#fa709a', '#fee140'] } = options;

        // 绘制标题
        if (title) this.drawTitle(title);

        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const radius = Math.min(this.width, this.height) / 3;

        // 计算总和
        const total = data.values.reduce((sum, val) => sum + val, 0);
        if (total === 0) return;

        // 绘制饼图
        let startAngle = -Math.PI / 2;

        data.values.forEach((value, index) => {
            const angle = (value / total) * Math.PI * 2;
            const endAngle = startAngle + angle;

            // 绘制扇形
            this.ctx.beginPath();
            this.ctx.moveTo(centerX, centerY);
            this.ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            this.ctx.closePath();
            this.ctx.fillStyle = colors[index % colors.length];
            this.ctx.fill();
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            // 绘制标签
            const labelAngle = startAngle + angle / 2;
            const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
            const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);

            const percentage = ((value / total) * 100).toFixed(1) + '%';
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 14px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(percentage, labelX, labelY);

            startAngle = endAngle;
        });

        // 绘制图例
        const legendY = this.height - 40;
        const legendGap = 100;
        const legendStartX = centerX - (data.labels.length * legendGap) / 2;

        data.labels.forEach((label, index) => {
            const x = legendStartX + index * legendGap;

            // 绘制色块
            this.ctx.fillStyle = colors[index % colors.length];
            this.ctx.fillRect(x, legendY, 15, 15);

            // 绘制文字
            this.ctx.fillStyle = '#333';
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'left';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(label, x + 20, legendY + 7.5);
        });
    }
}

// ==================== 热力图 ====================
class HeatmapChart extends Chart {
    draw(data, options = {}) {
        this.clear();

        const { title = '学习热力图', colorScale = ['#ebedf0', '#c6e48b', '#7bc96f', '#239a3b', '#196127'] } = options;

        // 绘制标题
        if (title) this.drawTitle(title);

        const cellSize = 12;
        const gap = 3;
        const startX = 60;
        const startY = 50;

        // 绘制周标签
        const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
        this.ctx.fillStyle = '#666';
        this.ctx.font = '10px Arial';
        this.ctx.textAlign = 'right';
        weekDays.forEach((day, index) => {
            this.ctx.fillText(day, startX - 10, startY + index * (cellSize + gap) + cellSize / 2 + 3);
        });

        // 绘制热力图
        data.forEach((week, weekIndex) => {
            week.forEach((value, dayIndex) => {
                const x = startX + weekIndex * (cellSize + gap);
                const y = startY + dayIndex * (cellSize + gap);

                // 根据值选择颜色
                let colorIndex = 0;
                if (value > 0) colorIndex = 1;
                if (value >= 5) colorIndex = 2;
                if (value >= 10) colorIndex = 3;
                if (value >= 20) colorIndex = 4;

                this.ctx.fillStyle = colorScale[colorIndex];
                this.ctx.fillRect(x, y, cellSize, cellSize);

                // 鼠标悬停显示具体数值(需要配合事件处理)
                this.ctx.strokeStyle = '#fff';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(x, y, cellSize, cellSize);
            });
        });

        // 绘制图例
        const legendY = startY + 8 * (cellSize + gap);
        this.ctx.fillStyle = '#666';
        this.ctx.font = '10px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('少', startX, legendY + 15);

        colorScale.forEach((color, index) => {
            const x = startX + 30 + index * (cellSize + gap);
            this.ctx.fillStyle = color;
            this.ctx.fillRect(x, legendY, cellSize, cellSize);
        });

        this.ctx.fillStyle = '#666';
        this.ctx.fillText('多', startX + 30 + colorScale.length * (cellSize + gap) + 10, legendY + 15);
    }
}

// ==================== 统计仪表板 ====================
class StatisticsDashboard {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error('Canvas element not found');
            return;
        }

        // 设置高分辨率
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';

        this.ctx = this.canvas.getContext('2d');
        this.ctx.scale(dpr, dpr);

        this.lineChart = new LineChart(this.canvas);
        this.barChart = new BarChart(this.canvas);
        this.pieChart = new PieChart(this.canvas);
        this.heatmapChart = new HeatmapChart(this.canvas);
    }

    showLearningTrend(records) {
        // 按日期分组统计
        const byDate = {};
        records.forEach(record => {
            const date = record.date;
            byDate[date] = (byDate[date] || 0) + 1;
        });

        // 获取最近30天
        const days = 30;
        const labels = [];
        const values = [];
        const today = new Date();

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toDateString();
            const label = `${date.getMonth() + 1}/${date.getDate()}`;

            labels.push(label);
            values.push(byDate[dateStr] || 0);
        }

        this.lineChart.draw({ labels, values }, { title: '学习趋势 (最近30天)', color: '#667eea', fillArea: true });
    }

    showMasteryDistribution(words) {
        const distribution = { new: 0, learning: 0, familiar: 0, mastered: 0 };

        words.forEach(word => {
            if (!word.sm2 || word.sm2.repetitions === 0) {
                distribution.new++;
            } else if (word.sm2.repetitions < 3) {
                distribution.learning++;
            } else if (word.sm2.repetitions < 6) {
                distribution.familiar++;
            } else {
                distribution.mastered++;
            }
        });

        this.pieChart.draw(
            {
                labels: ['新词', '学习中', '熟悉', '已掌握'],
                values: [distribution.new, distribution.learning, distribution.familiar, distribution.mastered]
            },
            { title: '词汇掌握度分布' }
        );
    }

    showDailyStudyTime(records) {
        // 按日期统计学习时间
        const byDate = {};
        records.forEach(record => {
            const date = new Date(record.timestamp).toDateString();
            byDate[date] = (byDate[date] || 0) + (record.timeSpent || 0);
        });

        // 获取最近7天
        const labels = [];
        const values = [];
        const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        const today = new Date();

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toDateString();
            const dayLabel = weekDays[date.getDay()];

            labels.push(dayLabel);
            values.push(Math.round((byDate[dateStr] || 0) / 60)); // 转换为分钟
        }

        this.barChart.draw({ labels, values }, { title: '每日学习时长 (分钟)' });
    }

    showHeatmap(records) {
        // 生成52周 x 7天的热力图数据
        const weeks = 52;
        const data = Array(weeks).fill(0).map(() => Array(7).fill(0));

        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(startDate.getDate() - weeks * 7);

        records.forEach(record => {
            const recordDate = new Date(record.timestamp);
            const diffTime = recordDate.getTime() - startDate.getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays >= 0 && diffDays < weeks * 7) {
                const weekIndex = Math.floor(diffDays / 7);
                const dayIndex = diffDays % 7;
                if (weekIndex < weeks && dayIndex < 7) {
                    data[weekIndex][dayIndex]++;
                }
            }
        });

        this.heatmapChart.draw(data);
    }
}

// ==================== 导出 ====================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Chart,
        LineChart,
        BarChart,
        PieChart,
        HeatmapChart,
        StatisticsDashboard
    };
}
