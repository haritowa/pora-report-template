class ImageSplitComponent extends HTMLElement {
    constructor() {
        super();
        
        // Create template programmatically
        const template = document.createElement('template');
        template.innerHTML = `
            <link rel="stylesheet" href="../css/image-split.css">
            <div class="image-split-container">
                <img class="background-blur" alt="Blur Background">
                <div class="image-container" data-side="left">
                    <img class="image" data-side="left">
                </div>
                <div class="image-container" data-side="right">
                    <img class="image" data-side="right">
                </div>
                <div class="overlay">
                    <div class="overlay-icon">⇄</div>
                </div>
                <div class="image-label label-left">Before</div>
                <div class="image-label label-right">After</div>
            </div>
        `;

        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.appendChild(template.content.cloneNode(true));
        
        this.container = shadowRoot.querySelector('.image-split-container');
        this.leftContainer = shadowRoot.querySelector('.image-container[data-side="left"]');
        this.rightContainer = shadowRoot.querySelector('.image-container[data-side="right"]');
        this.leftImage = shadowRoot.querySelector('.image[data-side="left"]');
        this.rightImage = shadowRoot.querySelector('.image[data-side="right"]');
        this.overlay = shadowRoot.querySelector('.overlay');
        this.blurBg = shadowRoot.querySelector('.background-blur');
        
        this.duration = 800;
        this.easing = 'easeOutExpo';
        this.isAnimating = false;
        
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.resetImages = this.resetImages.bind(this);
    }

    connectedCallback() {
        this.container.classList.add('loading');

        const loadImage = (img) => {
            return new Promise((resolve) => {
                if (img.complete) resolve();
                else {
                    img.onload = () => resolve();
                    img.onerror = () => resolve();
                }
            });
        };

        this.leftImage.src = this.getAttribute('left-image') || '';
        this.rightImage.src = this.getAttribute('right-image') || '';
        this.leftImage.alt = this.getAttribute('left-alt') || 'Before';
        this.rightImage.alt = this.getAttribute('right-alt') || 'After';

        Promise.all([
            loadImage(this.leftImage),
            loadImage(this.rightImage)
        ]).then(() => {
            // Remove loading state immediately after images are loaded
            this.container.classList.remove('loading');
            
            // Then handle the animation and styling
            this.leftContainer.style.opacity = '1';
            this.rightContainer.style.opacity = '1';
            this.leftImage.classList.add('loaded');
            this.rightImage.classList.add('loaded');
            this.blurBg.src = this.leftImage.src;
            this.blurBg.style.opacity = '1';
            
            // Initialize containers with explicit values
            this.leftContainer.style.width = '50%';
            this.leftContainer.style.height = '100%';
            this.leftContainer.style.left = '0';
            this.leftContainer.style.top = '0';
            
            this.rightContainer.style.width = '50%';
            this.rightContainer.style.height = '100%';
            this.rightContainer.style.left = '50%';
            this.rightContainer.style.top = '0';
            
            // Ensure images fill their containers properly
            this.leftImage.style.width = '100%';
            this.leftImage.style.height = '100%';
            this.rightImage.style.width = '100%';
            this.rightImage.style.height = '100%';
        });

        this.leftHalf = this.container.clientWidth / 2;
        this.container.addEventListener('mousemove', this.handleMouseMove);
        this.container.addEventListener('mouseleave', this.resetImages);
    }

    disconnectedCallback() {
        this.container.removeEventListener('mousemove', this.handleMouseMove);
        this.container.removeEventListener('mouseleave', this.resetImages);
    }

    resetImages() {
        this.shadowRoot.querySelector('.label-left').classList.remove('active');
        this.shadowRoot.querySelector('.label-right').classList.remove('active');
        this.blurBg.style.opacity = '1';
        
        const timeline = anime.timeline({
            duration: this.duration,
            easing: this.easing
        });

        timeline
            .add({
                targets: this.shadowRoot.querySelectorAll('.image-label'),
                opacity: 0,
                translateY: 20,
            })
            .add({
                targets: [this.leftContainer, this.rightContainer],
                translateX: 0,
                width: '50%',
                height: '100%',
                top: 0,
            }, 0)
            .add({
                targets: this.leftContainer,
                left: 0,
            }, 0)
            .add({
                targets: this.rightContainer,
                left: '50%',
            }, 0);

        this.overlay.style.opacity = '1';
    }

    calculateContainDimensions(image) {
        const containerAspect = this.container.clientWidth / this.container.clientHeight;
        const imageAspect = image.naturalWidth / image.naturalHeight;
        
        if (imageAspect > containerAspect) {
            return {
                width: '100%',
                height: (containerAspect / imageAspect * 100) + '%',
                top: ((1 - containerAspect / imageAspect) * 50) + '%'
            };
        } else {
            return {
                width: (imageAspect / containerAspect * 100) + '%',
                height: '100%',
                left: ((1 - imageAspect / containerAspect) * 50) + '%'
            };
        }
    }

    animateLeft() {
        this.blurBg.src = this.leftImage.src;
        this.blurBg.style.opacity = '1';
        
        this.shadowRoot.querySelector('.label-left').classList.add('active');
        this.shadowRoot.querySelector('.label-right').classList.remove('active');
        
        const containDimensions = this.calculateContainDimensions(this.leftImage);
        
        const timeline = anime.timeline({
            duration: this.duration,
            easing: this.easing
        });

        timeline
            .add({
                targets: this.leftContainer,
                width: containDimensions.width,
                height: containDimensions.height,
                top: containDimensions.top || '0',
                left: containDimensions.left || '0',
            }, 0)
            .add({
                targets: this.rightContainer,
                left: '120%',
            }, 0);

        this.overlay.style.opacity = '0';
    }

    animateRight() {
        this.blurBg.src = this.rightImage.src;
        this.blurBg.style.opacity = '1';
        
        this.shadowRoot.querySelector('.label-right').classList.add('active');
        this.shadowRoot.querySelector('.label-left').classList.remove('active');
        
        const containDimensions = this.calculateContainDimensions(this.rightImage);
        
        const timeline = anime.timeline({
            duration: this.duration,
            easing: this.easing
        });

        timeline
            .add({
                targets: this.rightContainer,
                width: containDimensions.width,
                height: containDimensions.height,
                top: containDimensions.top || '0',
                left: containDimensions.left || '0',
            }, 0)
            .add({
                targets: this.leftContainer,
                left: '-70%',
            }, 0);

        this.overlay.style.opacity = '0';
    }

    handleMouseMove(e) {
        if (this.isAnimating) return;
        
        const rect = this.container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        
        this.isAnimating = true;
        
        anime({
            targets: this.shadowRoot.querySelectorAll('.image-label'),
            opacity: 1,
            translateY: 0,
            duration: this.duration,
            easing: this.easing
        });
        
        if (x < this.leftHalf) {
            this.animateLeft();
        } else {
            this.animateRight();
        }
        
        setTimeout(() => {
            this.isAnimating = false;
        }, 100);
    }
}

customElements.define('image-split', ImageSplitComponent); 