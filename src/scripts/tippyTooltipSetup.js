import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/shift-away.css';

document.addEventListener('DOMContentLoaded', () => {
    const tips = document.querySelectorAll('[tip]');
    tips.forEach((tip) => {
        const isFootnoteTip = tip.parentElement.querySelector('span').innerHTML.trim().startsWith('<sup>')
        let offsetAmount = 10
        if (isFootnoteTip) {
            offsetAmount = 18
        }
        tippy(tip, {
            content: tip.attributes.getNamedItem('tip')?.textContent || '',
            animation: "shift-away",
            duration: [350, 250],
            interactive: true,
            interactiveBorder: 10,
            maxWidth: 380,
            touch: 'hold',
            offset: [0, offsetAmount],
        });
    });
});