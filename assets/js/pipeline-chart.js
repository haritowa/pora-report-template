class PipelineChart {
    constructor(element) {
        this.container = element;
        this.init();
    }

    static getInterpolatedColor(startColor, endColor, t) {
        const r = Math.round(startColor[0] + t * (endColor[0] - startColor[0]));
        const g = Math.round(startColor[1] + t * (endColor[1] - startColor[1]));
        const b = Math.round(startColor[2] + t * (endColor[2] - startColor[2]));
        return `rgba(${r}, ${g}, ${b}, 0.5)`;
    }

    createPipelineHTML(items) {
        return items.map((item, index) => `
            <div class="step">
                <div class="pill">
                    <div class="pill-label">${item.name}</div>
                    <div class="pill-label" data-original="${item.value}">0</div>
                </div>
                ${index < items.length - 1 ? '<div class="line"></div>' : ''}
            </div>
        `).join('');
    }

    init() {
        const items = JSON.parse(this.container.dataset.items || '[]');
        const pipelineHTML = this.createPipelineHTML(items);
        this.container.innerHTML = pipelineHTML;
        
        // Set initial position immediately without animation
        anime.set(this.container, {
            translateX: '-50%',
            translateY: '-50%',
            left: '50%',
            top: '50%'
        });
        
        setTimeout(() => this.animateNumbers(), 1500);
    }

    async animateNumbers() {
        const pills = this.container.querySelectorAll('.pill');
        
        for (const pill of pills) {
            const nameLabel = pill.querySelector('.pill-label:first-child');
            const valueLabel = pill.querySelector('.pill-label:last-child');
            
            await new Promise(resolve => setTimeout(resolve, 150));
            
            nameLabel.classList.add('transformed');
            valueLabel.classList.add('transformed');
            
            const finalValue = parseInt(valueLabel.getAttribute('data-original'), 10);
            const countUpAnim = new countUp.CountUp(valueLabel, finalValue, {
                duration: 1.2,
                startVal: 0,
                separator: '',
                useEasing: true,
                decimal: 0,
                decimalPlaces: 0,
                useGrouping: false,
                smartEasingThreshold: 700,
                smartEasingAmount: 300,
                easingFn: function(t, b, c, d) {
                    return c * (1 - Math.pow(1 - (t / d), 3)) + b;
                }
            });
            
            if (!countUpAnim.error) {
                countUpAnim.start();
                await new Promise(resolve => setTimeout(resolve, 700));
            } else {
                console.error(countUpAnim.error);
            }

            // Add pause between counter animations
            if (pills[pills.length - 1] !== pill) { // Don't wait after the last pill
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }

        this.colorize(pills);
        
        // Wait after colorize animation
        await new Promise(resolve => setTimeout(resolve, 2250));
        
        // Animate to top
        await new Promise(resolve => {
            anime({
                targets: this.container,
                translateX: ['-50%', 0],
                translateY: ['-50%', 0],
                left: ['50%', 0],
                top: ['50%', 0],
                duration: 1000,
                easing: 'easeOutCubic',
                complete: () => {
                    this.container.classList.add('animated');
                    resolve();
                }
            });
        });

        // Wait after moving to top
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Show content
        animateContent();
    }

    colorize(pills) {
        pills.forEach((pill, index) => {
            let color;
            
            if (index === 0) {
                color = `rgba(34, 153, 84, 0.5)`;
            } else {
                const previousValue = parseFloat(pills[index - 1].querySelector('.pill-label:last-child').textContent);
                const currentValue = parseFloat(pill.querySelector('.pill-label:last-child').textContent);
                const percentChange = ((previousValue - currentValue) / previousValue) * 100;
                let t = 0;

                if (percentChange <= 5) {
                    t = percentChange / 5;
                    color = PipelineChart.getInterpolatedColor([34, 153, 84], [255, 153, 51], t);
                } else if (percentChange <= 18) {
                    t = (percentChange - 5) / 13;
                    color = PipelineChart.getInterpolatedColor([255, 153, 51], [207, 38, 45], t);
                } else {
                    t = Math.min((percentChange - 18) / 22, 1);
                    color = PipelineChart.getInterpolatedColor([255, 153, 51], [207, 38, 45], t);
                }
            }

            pill.style.transition = 'background-color 0.5s ease';
            setTimeout(() => {
                pill.style.background = color;
            }, index * 100);
        });
    }
}

// Initialize all pipeline charts when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.pipeline-container').forEach(container => {
        new PipelineChart(container);
    });
});

function animateContent() {
    const contentWrapper = document.querySelector('.content-wrapper');
    if (!contentWrapper) return;

    anime({
        targets: '.content-wrapper',
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 800,
        easing: 'easeOutCubic',
        begin: function() {
            contentWrapper.style.display = 'block';
        }
    });
}