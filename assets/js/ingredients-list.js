class IngredientsListComponent extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        const ingredientsData = this.getAttribute('data-ingredients');
        if (ingredientsData) {
            try {
                const ingredients = JSON.parse(ingredientsData);
                this.render(ingredients);
            } catch (e) {
                console.error('Failed to parse ingredients data:', e);
            }
        }
    }

    render(ingredients) {
        this.innerHTML = '';
        this.classList.add('ingredients-container');
        
        ingredients.forEach((ingredient, index) => {
            const badge = document.createElement('span');
            badge.className = `badge ${ingredient.verified ? 'badge-trusted' : 'badge-unverified'}`;
            badge.textContent = ingredient.name;
            badge.setAttribute('data-tooltip', 
                ingredient.verified 
                    ? 'Verified ingredient from trusted source' 
                    : 'Ingredient not yet verified'
            );
            badge.style.opacity = '0';
            badge.style.transform = 'translateY(10px)';
            this.appendChild(badge);
        });

        // Animate badges
        const badges = this.querySelectorAll('.badge');
        const badgesArray = Array.from(badges);
        
        // Calculate number of parallel animations based on total count
        const totalBadges = badgesArray.length;
        const parallelCount = Math.max(1, Math.floor(totalBadges / 7));
        
        // Create groups for parallel animation
        const groups = [];
        for (let i = 0; i < parallelCount; i++) {
            groups.push([]);
        }
        
        // Distribute badges randomly into groups
        badgesArray
            .map(value => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .forEach((item, index) => {
                const groupIndex = index % parallelCount;
                groups[groupIndex].push(item.value);
            });

        // Animate each group with its own timeline
        groups.forEach((group, groupIndex) => {
            const delays = Array(group.length).fill(0)
                .map((_, i) => i * 70)
                .sort(() => Math.random() - 0.5);

            anime({
                targets: group,
                opacity: [0, 1],
                translateY: [10, 0],
                delay: (_, i) => delays[i],
                duration: 600,
                easing: 'easeOutElastic(1, .5)',
                complete: () => {
                    if (groupIndex === groups.length - 1) {
                        badges.forEach(badge => {
                            badge.style.opacity = '';
                            badge.style.transform = '';
                        });
                    }
                }
            });
        });
    }
}

customElements.define('ingredients-list', IngredientsListComponent); 