import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/shift-away.css';

document.addEventListener('DOMContentLoaded', () => {
    const tips = document.querySelectorAll('[tip]');
    tips.forEach((tip) => {
        const isFootnoteTip = tip.querySelector('sup') !== null
        let offsetAmount = 6
        if (isFootnoteTip) {
            offsetAmount = 12
        }
        tippy(tip, {
            content: tip.attributes.getNamedItem('tip')?.textContent || '',
            animation: "shift-away",
            duration: [350, 250],
            interactive: true,
            interactiveBorder: 10,
            maxWidth: 380,
            theme: 'glass',
            arrow: false,
            touch: 'hold',
            offset: [0, offsetAmount],
        });
    });
});