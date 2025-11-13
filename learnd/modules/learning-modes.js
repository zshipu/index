/**
 * 背单词神器 Pro - 高级学习模式模块
 * 拼写练习 + 听写模式 + 快速复习
 * Version: 3.0.0
 */

'use strict';

// ==================== 拼写练习模式 ====================
class SpellingPracticeMode {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            showHint: true,
            allowRetry: true,
            timeLimit: 60,
            ...options
        };
        this.currentWord = null;
        this.attempts = 0;
        this.correctCount = 0;
        this.startTime = null;
        this.onComplete = options.onComplete || (() => {});
    }

    start(word) {
        this.currentWord = word;
        this.attempts = 0;
        this.startTime = Date.now();
        this.render();
    }

    render() {
        const html = `
            <div class="spelling-practice" id="spellingPractice">
                <div class="practice-header">
                    <h2>✍️ 拼写练习</h2>
                    <div class="practice-stats">
                        <span>✅ 正确: ${this.correctCount}</span>
                        <span>❌ 尝试: ${this.attempts}</span>
                    </div>
                </div>

                <div class="practice-content">
                    <div class="word-hint">
                        <div class="phonetic">${this.currentWord.phonetic}</div>
                        <div class="meaning">${this.currentWord.meaning}</div>
                        ${this.currentWord.example ? `<div class="example">"${this.currentWord.example}"</div>` : ''}
                    </div>

                    <div class="spelling-area">
                        ${this.options.showHint ? `
                            <div class="letter-hints">
                                ${this.generateLetterHints(this.currentWord.word)}
                            </div>
                        ` : ''}

                        <input type="text"
                               id="spellingInput"
                               class="spelling-input"
                               placeholder="输入单词拼写..."
                               autocomplete="off"
                               autocapitalize="off"
                               spellcheck="false">

                        <div class="spelling-feedback" id="spellingFeedback"></div>
                    </div>

                    <div class="practice-buttons">
                        <button class="btn-check" id="checkSpelling">检查</button>
                        <button class="btn-hint" id="showHint">提示</button>
                        <button class="btn-skip" id="skipWord">跳过</button>
                        <button class="btn-speak" id="speakWord">🔊 发音</button>
                    </div>
                </div>
            </div>
        `;

        this.container.innerHTML = html;
        this.attachEvents();
        document.getElementById('spellingInput').focus();
    }

    generateLetterHints(word) {
        // 显示部分字母作为提示
        const visibleCount = Math.ceil(word.length / 3);
        return word.split('').map((letter, index) => {
            const show = index === 0 || index === word.length - 1 || Math.random() < 0.3;
            return `<span class="letter-hint ${show ? 'visible' : 'hidden'}">${show ? letter : '_'}</span>`;
        }).join('');
    }

    attachEvents() {
        const input = document.getElementById('spellingInput');
        const checkBtn = document.getElementById('checkSpelling');
        const hintBtn = document.getElementById('showHint');
        const skipBtn = document.getElementById('skipWord');
        const speakBtn = document.getElementById('speakWord');

        checkBtn.addEventListener('click', () => this.checkAnswer());
        hintBtn.addEventListener('click', () => this.showHint());
        skipBtn.addEventListener('click', () => this.skip());
        speakBtn.addEventListener('click', () => this.speak());

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.checkAnswer();
            }
        });

        // 实时反馈
        input.addEventListener('input', (e) => {
            const value = e.target.value.toLowerCase();
            const target = this.currentWord.word.toLowerCase();

            // 显示正确/错误的字母
            this.highlightInput(value, target);
        });
    }

    highlightInput(value, target) {
        const input = document.getElementById('spellingInput');
        let isCorrect = true;

        for (let i = 0; i < value.length; i++) {
            if (value[i] !== target[i]) {
                isCorrect = false;
                break;
            }
        }

        input.style.borderColor = isCorrect ? '#4facfe' : '#fa709a';
    }

    checkAnswer() {
        const input = document.getElementById('spellingInput');
        const value = input.value.trim().toLowerCase();
        const target = this.currentWord.word.toLowerCase();
        const feedback = document.getElementById('spellingFeedback');

        this.attempts++;

        if (value === target) {
            this.correctCount++;
            const timeSpent = Math.round((Date.now() - this.startTime) / 1000);

            feedback.innerHTML = `
                <div class="feedback-success">
                    <span class="feedback-icon">🎉</span>
                    <span>正确！</span>
                    <span class="time-spent">${timeSpent}秒</span>
                </div>
            `;

            input.disabled = true;
            this.showCelebration();

            setTimeout(() => {
                this.onComplete({
                    word: this.currentWord,
                    attempts: this.attempts,
                    timeSpent,
                    success: true
                });
            }, 1500);
        } else {
            feedback.innerHTML = `
                <div class="feedback-error">
                    <span class="feedback-icon">❌</span>
                    <span>不正确,再试一次！</span>
                    ${!this.options.allowRetry ? `<span class="correct-answer">正确答案: ${this.currentWord.word}</span>` : ''}
                </div>
            `;

            input.value = '';
            input.focus();

            // 震动反馈
            if (navigator.vibrate) {
                navigator.vibrate([50, 100, 50]);
            }

            if (!this.options.allowRetry) {
                input.disabled = true;
                setTimeout(() => {
                    this.onComplete({
                        word: this.currentWord,
                        attempts: this.attempts,
                        timeSpent: Math.round((Date.now() - this.startTime) / 1000),
                        success: false
                    });
                }, 2000);
            }
        }
    }

    showHint() {
        const input = document.getElementById('spellingInput');
        const currentValue = input.value.toLowerCase();
        const target = this.currentWord.word.toLowerCase();

        // 显示下一个正确字母
        if (currentValue.length < target.length) {
            input.value = target.substring(0, currentValue.length + 1);
            input.focus();
        }
    }

    skip() {
        const timeSpent = Math.round((Date.now() - this.startTime) / 1000);
        this.onComplete({
            word: this.currentWord,
            attempts: this.attempts,
            timeSpent,
            skipped: true
        });
    }

    speak() {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(this.currentWord.word);
            utterance.lang = 'en-US';
            utterance.rate = 0.7;
            speechSynthesis.cancel();
            speechSynthesis.speak(utterance);
        }
    }

    showCelebration() {
        const emojis = ['🎉', '🎊', '✨', '🌟', '⭐'];
        const emoji = emojis[Math.floor(Math.random() * emojis.length)];

        const celebration = document.createElement('div');
        celebration.className = 'celebration-emoji';
        celebration.textContent = emoji;
        celebration.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0);
            font-size: 5em;
            animation: celebrationPop 0.6s ease-out;
            pointer-events: none;
            z-index: 10000;
        `;

        document.body.appendChild(celebration);
        setTimeout(() => celebration.remove(), 600);
    }
}

// ==================== 听写模式 ====================
class DictationMode {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            autoSpeak: true,
            speakCount: 2,
            showHint: false,
            ...options
        };
        this.currentWord = null;
        this.speakCounter = 0;
        this.recognition = null;
        this.startTime = null;
        this.onComplete = options.onComplete || (() => {});

        this.initSpeechRecognition();
    }

    initSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (SpeechRecognition) {
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';

            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript.toLowerCase().trim();
                this.handleRecognitionResult(transcript);
            };

            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.showError('语音识别出错，请重试');
            };
        }
    }

    start(word) {
        this.currentWord = word;
        this.speakCounter = 0;
        this.startTime = Date.now();
        this.render();

        if (this.options.autoSpeak) {
            setTimeout(() => this.speak(), 500);
        }
    }

    render() {
        const html = `
            <div class="dictation-mode" id="dictationMode">
                <div class="practice-header">
                    <h2>🎤 听写模式</h2>
                    <div class="speak-counter">
                        已播放: ${this.speakCounter}/${this.options.speakCount}
                    </div>
                </div>

                <div class="practice-content">
                    <div class="dictation-area">
                        <div class="sound-wave">
                            <div class="wave-bar"></div>
                            <div class="wave-bar"></div>
                            <div class="wave-bar"></div>
                            <div class="wave-bar"></div>
                            <div class="wave-bar"></div>
                        </div>

                        <div class="dictation-instructions">
                            点击麦克风按钮开始听写
                        </div>

                        <div class="recognition-result" id="recognitionResult"></div>

                        <input type="text"
                               id="dictationInput"
                               class="dictation-input"
                               placeholder="或手动输入..."
                               autocomplete="off"
                               autocapitalize="off"
                               spellcheck="false">
                    </div>

                    ${this.options.showHint ? `
                        <div class="hint-area">
                            <div class="phonetic">${this.currentWord.phonetic}</div>
                            <div class="meaning">${this.currentWord.meaning}</div>
                        </div>
                    ` : ''}

                    <div class="practice-buttons">
                        <button class="btn-mic" id="startRecognition">
                            <span class="mic-icon">🎤</span>
                            <span>开始听写</span>
                        </button>
                        <button class="btn-speak" id="speakAgain">
                            <span>🔊</span>
                            <span>再听一次</span>
                        </button>
                        <button class="btn-check" id="checkDictation">检查</button>
                        <button class="btn-hint" id="showDictationHint">提示</button>
                        <button class="btn-skip" id="skipDictation">跳过</button>
                    </div>
                </div>
            </div>
        `;

        this.container.innerHTML = html;
        this.attachEvents();
    }

    attachEvents() {
        const startBtn = document.getElementById('startRecognition');
        const speakBtn = document.getElementById('speakAgain');
        const checkBtn = document.getElementById('checkDictation');
        const hintBtn = document.getElementById('showDictationHint');
        const skipBtn = document.getElementById('skipDictation');
        const input = document.getElementById('dictationInput');

        startBtn.addEventListener('click', () => this.startRecognition());
        speakBtn.addEventListener('click', () => this.speak());
        checkBtn.addEventListener('click', () => this.checkAnswer());
        hintBtn.addEventListener('click', () => this.showHint());
        skipBtn.addEventListener('click', () => this.skip());

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.checkAnswer();
            }
        });
    }

    speak() {
        if (this.speakCounter >= this.options.speakCount) {
            this.showError('已达到最大播放次数');
            return;
        }

        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(this.currentWord.word);
            utterance.lang = 'en-US';
            utterance.rate = 0.7;
            utterance.pitch = 1.0;

            utterance.onstart = () => {
                this.animateSoundWave(true);
            };

            utterance.onend = () => {
                this.animateSoundWave(false);
                this.speakCounter++;
                document.querySelector('.speak-counter').textContent =
                    `已播放: ${this.speakCounter}/${this.options.speakCount}`;
            };

            speechSynthesis.cancel();
            speechSynthesis.speak(utterance);
        }
    }

    animateSoundWave(active) {
        const bars = document.querySelectorAll('.wave-bar');
        bars.forEach(bar => {
            if (active) {
                bar.style.animation = 'wave 0.6s ease-in-out infinite';
                bar.style.animationDelay = `${Math.random() * 0.3}s`;
            } else {
                bar.style.animation = 'none';
            }
        });
    }

    startRecognition() {
        if (!this.recognition) {
            this.showError('您的浏览器不支持语音识别');
            return;
        }

        const btn = document.getElementById('startRecognition');
        const resultDiv = document.getElementById('recognitionResult');

        btn.classList.add('listening');
        btn.innerHTML = '<span class="mic-icon recording">🎤</span><span>听写中...</span>';
        resultDiv.innerHTML = '<div class="listening-indicator">正在听写...</div>';

        try {
            this.recognition.start();
        } catch (error) {
            this.showError('语音识别启动失败');
            this.resetRecognitionButton();
        }
    }

    handleRecognitionResult(transcript) {
        const resultDiv = document.getElementById('recognitionResult');
        const input = document.getElementById('dictationInput');

        resultDiv.innerHTML = `<div class="recognition-text">识别结果: ${transcript}</div>`;
        input.value = transcript;

        this.resetRecognitionButton();
        this.checkAnswer(transcript);
    }

    resetRecognitionButton() {
        const btn = document.getElementById('startRecognition');
        btn.classList.remove('listening');
        btn.innerHTML = '<span class="mic-icon">🎤</span><span>开始听写</span>';
    }

    checkAnswer(recognizedText) {
        const input = document.getElementById('dictationInput');
        const value = (recognizedText || input.value).trim().toLowerCase();
        const target = this.currentWord.word.toLowerCase();

        if (value === target) {
            const timeSpent = Math.round((Date.now() - this.startTime) / 1000);
            this.showSuccess();

            setTimeout(() => {
                this.onComplete({
                    word: this.currentWord,
                    timeSpent,
                    success: true,
                    method: recognizedText ? 'voice' : 'manual'
                });
            }, 1500);
        } else {
            this.showError(`不正确，再试一次！${value ? `（你的答案: ${value}）` : ''}`);
            if (navigator.vibrate) {
                navigator.vibrate([50, 100, 50]);
            }
        }
    }

    showHint() {
        this.options.showHint = true;
        this.render();
        this.speak();
    }

    skip() {
        const timeSpent = Math.round((Date.now() - this.startTime) / 1000);
        this.onComplete({
            word: this.currentWord,
            timeSpent,
            skipped: true
        });
    }

    showSuccess() {
        const resultDiv = document.getElementById('recognitionResult');
        resultDiv.innerHTML = `
            <div class="feedback-success">
                <span class="feedback-icon">🎉</span>
                <span>完全正确！</span>
            </div>
        `;
    }

    showError(message) {
        const resultDiv = document.getElementById('recognitionResult');
        resultDiv.innerHTML = `
            <div class="feedback-error">
                <span class="feedback-icon">❌</span>
                <span>${message}</span>
            </div>
        `;
    }
}

// ==================== 快速复习模式 ====================
class QuickReviewMode {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            wordsPerSession: 10,
            timePerWord: 5, // 秒
            autoAdvance: true,
            ...options
        };
        this.words = [];
        this.currentIndex = 0;
        this.results = [];
        this.timer = null;
        this.onComplete = options.onComplete || (() => {});
    }

    start(words) {
        this.words = words.slice(0, this.options.wordsPerSession);
        this.currentIndex = 0;
        this.results = [];
        this.showNextWord();
    }

    showNextWord() {
        if (this.currentIndex >= this.words.length) {
            this.showResults();
            return;
        }

        const word = this.words[this.currentIndex];
        const timeLeft = this.options.timePerWord;

        const html = `
            <div class="quick-review" id="quickReview">
                <div class="review-header">
                    <div class="progress">${this.currentIndex + 1} / ${this.words.length}</div>
                    <div class="timer" id="timer">${timeLeft}s</div>
                </div>

                <div class="review-word">
                    <div class="word-main">${word.word}</div>
                    <div class="phonetic">${word.phonetic}</div>
                </div>

                <div class="review-question">你认识这个单词吗？</div>

                <div class="review-buttons">
                    <button class="btn-know" id="btnKnow">✅ 认识</button>
                    <button class="btn-unknown" id="btnUnknown">❓ 不认识</button>
                </div>

                <div class="review-answer" id="reviewAnswer" style="display: none;">
                    <div class="meaning">${word.meaning}</div>
                    ${word.example ? `<div class="example">${word.example}</div>` : ''}
                </div>
            </div>
        `;

        this.container.innerHTML = html;

        document.getElementById('btnKnow').addEventListener('click', () => this.answer(true));
        document.getElementById('btnUnknown').addEventListener('click', () => this.answer(false));

        if (this.options.autoAdvance) {
            this.startTimer(timeLeft);
        }
    }

    startTimer(seconds) {
        let timeLeft = seconds;
        const timerEl = document.getElementById('timer');

        this.timer = setInterval(() => {
            timeLeft--;
            timerEl.textContent = `${timeLeft}s`;

            if (timeLeft <= 0) {
                clearInterval(this.timer);
                this.answer(false); // 超时视为不认识
            }
        }, 1000);
    }

    answer(known) {
        if (this.timer) {
            clearInterval(this.timer);
        }

        const word = this.words[this.currentIndex];
        this.results.push({ word, known });

        // 显示答案
        const answerDiv = document.getElementById('reviewAnswer');
        answerDiv.style.display = 'block';

        // 禁用按钮
        document.getElementById('btnKnow').disabled = true;
        document.getElementById('btnUnknown').disabled = true;

        setTimeout(() => {
            this.currentIndex++;
            this.showNextWord();
        }, 1500);
    }

    showResults() {
        const known = this.results.filter(r => r.known).length;
        const unknown = this.results.filter(r => r.unknown).length;
        const rate = (known / this.results.length * 100).toFixed(1);

        const html = `
            <div class="review-results">
                <h2>📊 复习完成！</h2>
                <div class="results-stats">
                    <div class="stat">
                        <div class="stat-number">${this.results.length}</div>
                        <div class="stat-label">总计</div>
                    </div>
                    <div class="stat">
                        <div class="stat-number">${known}</div>
                        <div class="stat-label">认识</div>
                    </div>
                    <div class="stat">
                        <div class="stat-number">${unknown}</div>
                        <div class="stat-label">不认识</div>
                    </div>
                    <div class="stat">
                        <div class="stat-number">${rate}%</div>
                        <div class="stat-label">正确率</div>
                    </div>
                </div>
                <button class="btn-primary" id="reviewAgain">再复习一次</button>
                <button class="btn-secondary" id="finishReview">完成</button>
            </div>
        `;

        this.container.innerHTML = html;

        document.getElementById('reviewAgain').addEventListener('click', () => {
            const wrongWords = this.results.filter(r => !r.known).map(r => r.word);
            this.start(wrongWords.length > 0 ? wrongWords : this.words);
        });

        document.getElementById('finishReview').addEventListener('click', () => {
            this.onComplete(this.results);
        });
    }
}

// ==================== 导出 ====================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SpellingPracticeMode,
        DictationMode,
        QuickReviewMode
    };
}
