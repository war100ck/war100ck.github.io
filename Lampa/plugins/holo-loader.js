(function () {
    'use strict';

    // ========== БЛОК ПОДАВЛЕНИЯ СТАНДАРТНОГО ЛОАДЕРА (САМЫЙ ПЕРВЫЙ) ==========
    (function suppressDefaultLoader() {
        // Функция немедленного уничтожения
        const destroyDefaultLoader = () => {
            try {
                // 1. Удаляем стили стандартного лоадера
                const stylesToRemove = ['lampa-loader-critical', 'lampa-loader-styles'];
                stylesToRemove.forEach(id => {
                    const style = document.getElementById(id);
                    if (style) style.remove();
                });
                
                // 2. Удаляем DOM элементы стандартного лоадера
                const selectors = ['.lampa-terminal-loader', '.welcome', '[class*="lampa-loader"]', '[class*="terminal-loader"]'];
                selectors.forEach(selector => {
                    const elements = document.querySelectorAll(selector);
                    elements.forEach(el => {
                        if (el && el.parentNode) el.remove();
                    });
                });
                
                // 3. Отключаем глобальные переменные Lampa лоадера
                if (window.lampaTerminalLoader) {
                    if (window.lampaTerminalLoader.destroy) window.lampaTerminalLoader.destroy();
                    if (window.lampaTerminalLoader.cleanup) window.lampaTerminalLoader.cleanup();
                    window.lampaTerminalLoader = null;
                }
                
                // 4. Отключаем jQuery fadeout для welcome
                if (typeof $ !== 'undefined' && $.fn && $.fn.fadeOut) {
                    if (!window._originalFadeOut) {
                        window._originalFadeOut = $.fn.fadeOut;
                        $.fn.fadeOut = function() {
                            if (this.hasClass && (this.hasClass('welcome') || this.hasClass('lampa-terminal-loader'))) {
                                this.remove();
                                return this;
                            }
                            return window._originalFadeOut.apply(this, arguments);
                        };
                    }
                }
                
                // 5. Отключаем Lampa.LoadingProgress если активен
                if (typeof Lampa !== 'undefined' && Lampa.LoadingProgress) {
                    if (Lampa.LoadingProgress.destroy) Lampa.LoadingProgress.destroy();
                    if (Lampa.LoadingProgress.stop) Lampa.LoadingProgress.stop();
                    // Переопределяем на пустышку
                    Lampa.LoadingProgress = {
                        step: function() {},
                        destroy: function() {},
                        stop: function() {}
                    };
                }
                
                console.log('[HoloLoader] Default loader destroyed');
            } catch(e) {
                console.warn('[HoloLoader] Suppression error:', e);
            }
        };
        
        // Выполняем МГНОВЕННО
        destroyDefaultLoader();
        
        // Выполняем при загрузке DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', destroyDefaultLoader);
        }
        
        // Выполняем несколько раз с задержкой для гарантии
        const delays = [0, 50, 150, 300];
        delays.forEach(delay => {
            setTimeout(destroyDefaultLoader, delay);
        });
    })();

    if (window.holoLoaderActive) return;
    window.holoLoaderActive = true;

    // ======================== КОНФИГУРАЦИЯ ========================
    const DEFAULT_CONFIG = {
        minDisplayTime: 5000,
        fadeOutDuration: 1000,
        hologram: {
            ringCount: 3,
            rotationSpeed: 0.008,
            waveSpeed: 0.02
        },
        progress: {
            segmentCount: 12,
            glowIntensity: 0.7
        },
        particles: {
            count: 50,
            colors: ['#00f2ff', '#ff00f2', '#f2ff00', '#00ffaa']
        },
        modules: [
            'Квантовая энтропия', 'Голографическая память', 'Нейронный интерфейс',
            'Пространственный модуль', 'Временная синхронизация', 'Энергоблок'
        ],
        reducedMotion: false
    };

    const CONFIG = window.HOLO_LOADER_CONFIG || DEFAULT_CONFIG;

    // Адаптация под motion preferences
    if (!CONFIG.reducedMotion && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
        CONFIG.reducedMotion = true;
        CONFIG.particles.count = 15;
        CONFIG.hologram.rotationSpeed = 0.002;
    }

    // ======================== СТИЛИ ========================
    const STYLES = `
        .holo-datacenter {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: radial-gradient(ellipse at center, #0a0a1a 0%, #020208 100%);
            z-index: 99999;
            font-family: 'Share Tech Mono', 'Courier New', monospace;
            overflow: hidden;
            color: #0ff;
        }

        /* Скан-линии */
        .holo-scanlines {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: repeating-linear-gradient(
                0deg,
                rgba(0, 255, 255, 0.03) 0px,
                rgba(0, 255, 255, 0.03) 2px,
                transparent 2px,
                transparent 6px
            );
            pointer-events: none;
            z-index: 1;
            animation: scanMove 8s linear infinite;
        }

        @keyframes scanMove {
            0% { transform: translateY(-100%); }
            100% { transform: translateY(100%); }
        }

        /* Центральная голограмма */
        .holo-hologram {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: min(400px, 70vw);
            height: min(400px, 70vw);
            z-index: 2;
        }

        .holo-ring {
            position: absolute;
            top: 50%;
            left: 50%;
            border-radius: 50%;
            border-style: solid;
            transform: translate(-50%, -50%);
            opacity: 0;
            animation: ringFadeIn 1s ease-out forwards;
        }

        .holo-ring-1 { width: 100%; height: 100%; border-width: 2px; border-color: #0ff; box-shadow: 0 0 20px rgba(0, 255, 255, 0.5); animation-delay: 0.1s; }
        .holo-ring-2 { width: 70%; height: 70%; border-width: 1px; border-color: #f0f; box-shadow: 0 0 15px rgba(255, 0, 255, 0.5); animation-delay: 0.3s; }
        .holo-ring-3 { width: 40%; height: 40%; border-width: 1px; border-color: #ff0; box-shadow: 0 0 10px rgba(255, 255, 0, 0.5); animation-delay: 0.5s; }

        @keyframes ringFadeIn {
            from { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
            to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }

        /* Центральный шар */
        .holo-core {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 20%;
            height: 20%;
            background: radial-gradient(circle, #0ff, #00aaff);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            box-shadow: 0 0 30px #0ff, 0 0 60px #0ff;
            animation: corePulse 2s ease-in-out infinite;
        }

        @keyframes corePulse {
            0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
            50% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
        }

        /* Прогресс-сегменты */
        .holo-progress-container {
            position: absolute;
            bottom: 20%;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 8px;
            z-index: 5;
        }

        .holo-segment {
            width: 24px;
            height: 48px;
            background: rgba(0, 255, 255, 0.1);
            border: 1px solid rgba(0, 255, 255, 0.3);
            border-radius: 4px;
            position: relative;
            overflow: hidden;
            transition: all 0.3s ease;
        }

        .holo-segment-fill {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 0%;
            background: linear-gradient(0deg, #0ff, #f0f);
            transition: height 0.2s linear;
        }

        .holo-segment.active {
            border-color: #0ff;
            box-shadow: 0 0 10px #0ff;
        }

        /* Модули */
        .holo-modules {
            position: absolute;
            right: 5%;
            top: 50%;
            transform: translateY(-50%);
            text-align: right;
            z-index: 4;
        }

        .holo-module {
            font-size: clamp(10px, 2vw, 14px);
            margin: 12px 0;
            opacity: 0.3;
            letter-spacing: 2px;
            transition: all 0.5s ease;
            text-transform: uppercase;
        }

        .holo-module.loaded {
            opacity: 1;
            text-shadow: 0 0 8px #0ff;
            transform: translateX(-10px);
        }

        .holo-module::before {
            content: '◉ ';
            color: #0ff;
            opacity: 0;
        }

        .holo-module.loaded::before {
            opacity: 1;
        }

        /* Индикатор статуса */
        .holo-status {
            position: absolute;
            bottom: 5%;
            left: 5%;
            font-size: 12px;
            letter-spacing: 2px;
            z-index: 4;
        }

        .holo-status-text {
            opacity: 0.7;
            animation: statusBlink 1.5s infinite;
        }

        @keyframes statusBlink {
            0%, 100% { opacity: 0.7; }
            50% { opacity: 0.3; }
        }

        /* Частицы */
        .holo-particles {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            pointer-events: none;
            z-index: 3;
        }

        .holo-particle {
            position: absolute;
            width: 2px;
            height: 2px;
            border-radius: 50%;
            opacity: 0;
            animation: particleFloat linear infinite;
        }

        @keyframes particleFloat {
            0% {
                transform: translateY(100vh) scale(0);
                opacity: 0;
            }
            10% {
                opacity: 1;
            }
            90% {
                opacity: 1;
            }
            100% {
                transform: translateY(-100vh) scale(1);
                opacity: 0;
            }
        }

        /* ACCESS GRANTED */
        .holo-access {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0);
            font-size: clamp(24px, 5vw, 48px);
            font-weight: bold;
            color: #0ff;
            text-shadow: 0 0 20px #0ff, 0 0 40px #0ff;
            z-index: 10;
            white-space: nowrap;
            letter-spacing: 8px;
            transition: all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            opacity: 0;
        }

        .holo-access.show {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
        }

        /* Fade out */
        .holo-datacenter.fade-out {
            opacity: 0;
            transition: opacity ${CONFIG.fadeOutDuration}ms ease;
            pointer-events: none;
        }

        /* Responsive */
        @media (max-width: 768px) {
            .holo-progress-container { gap: 4px; bottom: 15%; }
            .holo-segment { width: 16px; height: 32px; }
            .holo-modules { top: auto; bottom: 15%; right: 5%; transform: none; }
            .holo-module { font-size: 8px; margin: 6px 0; }
        }
    `;

    // HTML структура
    const HTML = `
        <div class="holo-datacenter">
            <div class="holo-scanlines"></div>
            <div class="holo-particles"></div>
            <div class="holo-hologram">
                <div class="holo-ring holo-ring-1"></div>
                <div class="holo-ring holo-ring-2"></div>
                <div class="holo-ring holo-ring-3"></div>
                <div class="holo-core"></div>
            </div>
            <div class="holo-progress-container"></div>
            <div class="holo-modules"></div>
            <div class="holo-status">
                <div class="holo-status-text">⟳ СИСТЕМА КАЛИБРУЕТСЯ</div>
                <div class="holo-status-time" style="font-size:10px;opacity:0.5;"></div>
            </div>
            <div class="holo-access">ДОСТУП РАЗРЕШЁН</div>
        </div>
    `;

    // ======================== ЛОГИКА ========================
    let loader = {
        element: null,
        destroyed: false,
        currentModule: 0,
        segments: [],
        particles: [],
        animationId: null,
        rotation: 0,
        startTime: Date.now(),
        modulesList: []
    };

    function log(...args) {
        console.log('[HoloLoader]', ...args);
    }

    function createParticles() {
        const container = loader.element.querySelector('.holo-particles');
        if (!container) return;

        for (let i = 0; i < CONFIG.particles.count; i++) {
            const particle = document.createElement('div');
            particle.className = 'holo-particle';
            const color = CONFIG.particles.colors[Math.floor(Math.random() * CONFIG.particles.colors.length)];
            particle.style.backgroundColor = color;
            particle.style.boxShadow = `0 0 4px ${color}`;
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.animationDuration = `${5 + Math.random() * 15}s`;
            particle.style.animationDelay = `${Math.random() * 10}s`;
            container.appendChild(particle);
        }
    }

    function createProgressSegments() {
        const container = loader.element.querySelector('.holo-progress-container');
        if (!container) return;

        for (let i = 0; i < CONFIG.progress.segmentCount; i++) {
            const segment = document.createElement('div');
            segment.className = 'holo-segment';
            const fill = document.createElement('div');
            fill.className = 'holo-segment-fill';
            segment.appendChild(fill);
            container.appendChild(segment);
            loader.segments.push({ element: segment, fill: fill, active: false });
        }
    }

    function createModules() {
        const container = loader.element.querySelector('.holo-modules');
        if (!container) return;

        loader.modulesList = CONFIG.modules.map(name => {
            const div = document.createElement('div');
            div.className = 'holo-module';
            div.textContent = name;
            container.appendChild(div);
            return div;
        });
    }

    function updateProgress(percent) {
        if (!loader.segments.length) return;
        const activeCount = Math.floor((percent / 100) * loader.segments.length);
        
        loader.segments.forEach((segment, idx) => {
            const isActive = idx < activeCount;
            const fillPercent = isActive ? 100 : 0;
            
            if (segment.fill.style.height !== `${fillPercent}%`) {
                segment.fill.style.height = `${fillPercent}%`;
            }
            
            if (isActive && !segment.active) {
                segment.active = true;
                segment.element.classList.add('active');
            } else if (!isActive && segment.active) {
                segment.active = false;
                segment.element.classList.remove('active');
            }
        });
    }

    function updateModules(step) {
        if (!loader.modulesList.length) return;
        for (let i = 0; i < Math.min(step, loader.modulesList.length); i++) {
            if (loader.modulesList[i] && !loader.modulesList[i].classList.contains('loaded')) {
                loader.modulesList[i].classList.add('loaded');
            }
        }
    }

    function animateHologram() {
        if (loader.destroyed || !loader.element) return;

        loader.rotation += CONFIG.hologram.rotationSpeed;
        
        const rings = loader.element.querySelectorAll('.holo-ring');
        rings.forEach((ring, idx) => {
            const speed = (idx + 1) * 0.5;
            const rotate = loader.rotation * speed;
            const scale = 1 + Math.sin(Date.now() * CONFIG.hologram.waveSpeed + idx) * 0.02;
            ring.style.transform = `translate(-50%, -50%) rotate(${rotate}deg) scale(${scale})`;
        });

        loader.animationId = requestAnimationFrame(animateHologram);
    }

    function updateStatusText(text) {
        const statusEl = loader.element?.querySelector('.holo-status-text');
        if (statusEl) statusEl.textContent = text;
    }

    function updateTimeDisplay() {
        if (loader.destroyed) return;
        const timeEl = loader.element?.querySelector('.holo-status-time');
        if (timeEl) {
            const elapsed = Math.floor((Date.now() - loader.startTime) / 1000);
            timeEl.textContent = `UPTIME: ${elapsed}s`;
        }
        setTimeout(() => updateTimeDisplay(), 1000);
    }

    function showAccessAndFadeOut() {
        const accessEl = loader.element?.querySelector('.holo-access');
        if (accessEl) accessEl.classList.add('show');

        setTimeout(() => {
            if (loader.element) {
                loader.element.classList.add('fade-out');
                setTimeout(() => {
                    cleanup();
                }, CONFIG.fadeOutDuration);
            }
        }, 800);
    }

    function simulateLoading() {
        if (!loader.modulesList.length) {
            setTimeout(simulateLoading, 100);
            return;
        }
        
        let step = 0;
        const totalSteps = loader.modulesList.length;
        const stepDuration = CONFIG.minDisplayTime / totalSteps;

        function nextStep() {
            if (loader.destroyed) return;

            if (step <= totalSteps) {
                const percent = (step / totalSteps) * 100;
                updateProgress(percent);
                updateModules(step);
                
                const statusTexts = [
                    '◢ ЗАПУСК ГОЛОГРАММЫ',
                    '◣ КАЛИБРОВКА ДАТЧИКОВ',
                    '◤ ЗАГРУЗКА МОДУЛЕЙ',
                    '◥ АКТИВАЦИЯ ЯДРА',
                    '✔ СИСТЕМА ГОТОВА'
                ];
                const statusIdx = Math.min(Math.floor(step / (totalSteps / statusTexts.length)), statusTexts.length - 1);
                updateStatusText(statusTexts[statusIdx]);

                step++;
                setTimeout(nextStep, stepDuration);
            } else {
                const elapsed = Date.now() - loader.startTime;
                const remaining = Math.max(0, CONFIG.minDisplayTime - elapsed);
                
                setTimeout(() => {
                    if (!loader.destroyed) {
                        showAccessAndFadeOut();
                    }
                }, remaining);
            }
        }

        nextStep();
    }

    function hookToLampaIfNeeded() {
        if (typeof Lampa !== 'undefined') {
            log('Lampa detected, integrating...');
            
            // Полностью перехватываем LoadingProgress
            if (Lampa.LoadingProgress) {
                const originalStep = Lampa.LoadingProgress.step;
                Lampa.LoadingProgress.step = function(position) {
                    // Обновляем прогресс холо-лоадера
                    if (loader && !loader.destroyed) {
                        const percent = (position / 5) * 100;
                        updateProgress(percent);
                        updateModules(position);
                    }
                    if (originalStep) return originalStep.apply(this, arguments);
                };
            }
            
            if (Lampa.Listener) {
                Lampa.Listener.follow('app', (e) => {
                    if (e.type === 'ready' && !loader.destroyed) {
                        log('Lampa ready event received');
                        simulateLoading();
                    }
                });
            } else {
                simulateLoading();
            }
        } else {
            log('Lampa not found, using standalone mode');
            simulateLoading();
            
            const checkInterval = setInterval(() => {
                if (typeof Lampa !== 'undefined') {
                    clearInterval(checkInterval);
                    log('Lampa appeared, sending ready event');
                    if (Lampa.Listener) {
                        Lampa.Listener.trigger('app', { type: 'ready' });
                    }
                }
            }, 100);
        }
    }

    function cleanup() {
        if (loader.animationId) {
            cancelAnimationFrame(loader.animationId);
        }
        
        if (loader.element && loader.element.parentNode) {
            loader.element.parentNode.removeChild(loader.element);
        }
        
        const style = document.getElementById('holo-loader-styles');
        if (style) style.remove();
        
        loader.destroyed = true;
        log('Cleanup complete');
    }

    function init() {
        log('Initializing HoloLoader...');
        
        // Ещё раз убиваем стандартный лоадер перед инициализацией
        const stylesToRemove = ['lampa-loader-critical', 'lampa-loader-styles'];
        stylesToRemove.forEach(id => {
            const style = document.getElementById(id);
            if (style) style.remove();
        });
        
        // Добавляем стили
        const styleEl = document.createElement('style');
        styleEl.id = 'holo-loader-styles';
        styleEl.textContent = STYLES;
        document.head.appendChild(styleEl);
        
        // Добавляем HTML
        const wrapper = document.createElement('div');
        wrapper.innerHTML = HTML;
        loader.element = wrapper.firstElementChild;
        
        // Вставляем ПЕРВЫМ в body
        if (document.body.firstChild) {
            document.body.insertBefore(loader.element, document.body.firstChild);
        } else {
            document.body.appendChild(loader.element);
        }
        
        // Инициализируем компоненты
        createParticles();
        createProgressSegments();
        createModules();
        
        // Запускаем анимацию
        animateHologram();
        updateTimeDisplay();
        
        // Интегрируемся с Lampa или запускаем свою логику
        hookToLampaIfNeeded();
        
        log('HoloLoader ready, z-index: 99999');
    }

    // Стартуем МГНОВЕННО, без ожидания DOM
    if (document.readyState === 'loading') {
        // Если DOM ещё грузится, ждём body
        const waitForBody = setInterval(() => {
            if (document.body) {
                clearInterval(waitForBody);
                init();
            }
        }, 5);
    } else {
        init();
    }
})();
