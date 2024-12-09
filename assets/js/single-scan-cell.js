class SingleScanCell extends HTMLElement {
    constructor() {
        super();
        console.log('[SingleScanCell] Constructor called');
    }

    connectedCallback() {
        console.log('[SingleScanCell] Connected, external-css:', this.getAttribute('external-css'));
        this.render();

        // Add intersection observer to trigger animation when element becomes visible
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animate();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        observer.observe(this);
    }

    animate() {
        const elements = [
            this.querySelector('h2'),
            this.querySelector('h3'),
            this.querySelector('.image-comparison'),
            this.querySelector('ingredients-list')
        ].filter(el => el !== null); // Only animate elements that exist

        if (elements.length === 0) return; // Don't animate if no elements found

        anime({
            targets: elements,
            opacity: [0, 1],
            translateY: [15, 0],
            duration: 600,
            delay: anime.stagger(100),
            easing: 'easeOutCubic',
            begin: function(anim) {
                elements.forEach(el => {
                    if (el) {
                        el.style.opacity = '0';
                        el.style.transform = 'translateY(15px)';
                    }
                });
            }
        });
    }

    render() {
        const externalCss = this.getAttribute('external-css');
        console.log('[SingleScanCell] Render, external-css:', externalCss);
        
        const title = this.getAttribute('title') || '';
        const brand = this.getAttribute('brand') || '';
        const leftImage = this.getAttribute('left-image') || '';
        const rightImage = this.getAttribute('right-image') || '';
        
        let ingredients = [];
        const ingredientsStr = this.getAttribute('ingredients') || '[]';
        
        try {
            // Sanitize the JSON string before parsing
            const sanitizedStr = ingredientsStr
                .replace(/\s+/g, ' ')
                .trim()
                .replace(/&quot;/g, '"');
            ingredients = JSON.parse(sanitizedStr);
        } catch (e) {
            console.error('Failed to parse ingredients:', e);
            ingredients = []; // Fallback to empty array on error
        }

        this.innerHTML = `
            <article class="single-scan-cell">
                <div class="grid">
                    <div class="cell-image">
                        <image-split 
                            external-css="${externalCss}"
                            left-image="${leftImage}"
                            right-image="${rightImage}"
                            left-alt="Original Image"
                            right-alt="Reference Image">
                        </image-split>
                    </div>
                    <div class="cell-content">
                        <hgroup>
                            <h2>${title}</h2>
                            <h3>${brand}</h3>
                        </hgroup>
                        <ingredients-list data-ingredients='${JSON.stringify(ingredients)}'></ingredients-list>
                    </div>
                </div>
            </article>
        `;
        
        console.log('[SingleScanCell] After render, image-split element:', this.querySelector('image-split'));
    }
}

customElements.define('single-scan-cell', SingleScanCell); 