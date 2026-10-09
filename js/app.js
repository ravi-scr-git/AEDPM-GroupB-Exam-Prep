/* AEDPM Group-B Exam Preparation App - Core Engine */

(function () {
  'use strict';

  // Application State
  const state = {
    topics: window.AEDPM_TOPICS || [],
    questions: window.AEDPM_QUESTIONS || [],
    mindmaps: window.AEDPM_MINDMAPS || [],
    currentSection: 'all', // 'all', 'Establishment Rules', 'Financial Rules', 'Technical Subject'
    currentTopicId: 'est_1',
    currentView: 'notes', // 'notes', 'mindmaps', 'practice', 'exam', 'matrix', 'flashcards'
    searchQuery: '',
    bookmarks: JSON.parse(localStorage.getItem('aedpm_bookmarks') || '[]'),
    completedTopics: JSON.parse(localStorage.getItem('aedpm_completed') || '[]'),
    
    // Practice Quiz State
    practiceFilterTopic: 'all',
    practiceAnswerState: {}, // qId -> selectedOptionIdx

    // Full Exam Simulator State
    exam: {
      active: false,
      questions: [],
      currentIndex: 0,
      userAnswers: {}, // qIndex -> optionIdx
      flagged: {}, // qIndex -> bool
      timeRemaining: 7200, // 120 minutes in seconds
      timerInterval: null,
      submitted: false,
      score: { correct: 0, wrong: 0, unattempted: 0, totalMarks: 0 }
    },

    // Flashcard State
    flashcardIndex: 0,
    flashcardFlipped: false
  };

  // DOM Elements
  const el = {
    sidebarContent: document.getElementById('sidebar-content'),
    mainContent: document.getElementById('main-content-body'),
    searchInput: document.getElementById('sidebar-search'),
    sectionTabs: document.querySelectorAll('.nav-tab-btn'),
    viewButtons: document.querySelectorAll('.view-btn'),
    themeToggle: document.getElementById('theme-toggle'),
    statsBadge: document.getElementById('stats-badge')
  };

  // Helper: Save State
  function saveStorage() {
    localStorage.setItem('aedpm_bookmarks', JSON.stringify(state.bookmarks));
    localStorage.setItem('aedpm_completed', JSON.stringify(state.completedTopics));
  }

  // --- INIT APPLICATION ---
  function init() {
    setupEventListeners();
    renderSidebar();
    renderMainView();
    updateStatsBadge();
  }

  function updateStatsBadge() {
    if (el.statsBadge) {
      el.statsBadge.innerText = `${state.questions.length} MCQs | ${state.topics.length} Topics`;
    }
  }

  // --- EVENT LISTENERS ---
  function setupEventListeners() {
    // Section Tabs
    el.sectionTabs.forEach(btn => {
      btn.addEventListener('click', () => {
        el.sectionTabs.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.currentSection = btn.dataset.section;
        renderSidebar();
      });
    });

    // View Switchers
    el.viewButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        el.viewButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.currentView = btn.dataset.view;
        renderMainView();
      });
    });

    // Search Input
    if (el.searchInput) {
      el.searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value.toLowerCase();
        renderSidebar();
      });
    }

    // Theme Toggle
    if (el.themeToggle) {
      el.themeToggle.addEventListener('click', () => {
        const currentTheme = document.body.dataset.theme === 'light' ? 'dark' : 'light';
        document.body.dataset.theme = currentTheme;
        localStorage.setItem('aedpm_theme', currentTheme);
      });
      // Restore Theme
      const savedTheme = localStorage.getItem('aedpm_theme') || 'dark';
      document.body.dataset.theme = savedTheme;
    }
  }

  // --- RENDER SIDEBAR ---
  function renderSidebar() {
    if (!el.sidebarContent) return;

    let filtered = state.topics;
    if (state.currentSection !== 'all') {
      filtered = filtered.filter(t => t.section === state.currentSection);
    }
    if (state.searchQuery) {
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(state.searchQuery) ||
        t.key_concepts.some(c => c.toLowerCase().includes(state.searchQuery))
      );
    }

    // Group by Section
    const groups = {};
    filtered.forEach(topic => {
      const grp = topic.module ? `${topic.section} - ${topic.module}` : topic.section;
      if (!groups[grp]) groups[grp] = [];
      groups[grp].push(topic);
    });

    let html = '';
    for (const [groupName, topicList] of Object.entries(groups)) {
      html += `<div class="section-group-title">${groupName}</div>`;
      topicList.forEach(t => {
        const isActive = t.id === state.currentTopicId ? 'active' : '';
        const isDone = state.completedTopics.includes(t.id) ? '✓ ' : '';
        html += `
          <div class="topic-nav-item ${isActive}" data-id="${t.id}">
            <span>${isDone}${t.title}</span>
          </div>
        `;
      });
    }

    if (filtered.length === 0) {
      html = `<div style="padding:1rem;color:var(--text-muted);font-size:0.85rem;">No matching topics found.</div>`;
    }

    el.sidebarContent.innerHTML = html;

    // Attach click events
    el.sidebarContent.querySelectorAll('.topic-nav-item').forEach(item => {
      item.addEventListener('click', () => {
        state.currentTopicId = item.dataset.id;
        state.currentView = 'notes';
        el.viewButtons.forEach(b => {
          b.classList.toggle('active', b.dataset.view === 'notes');
        });
        renderSidebar();
        renderMainView();
      });
    });
  }

  // --- RENDER MAIN VIEW ROUTER ---
  function renderMainView() {
    if (!el.mainContent) return;

    switch (state.currentView) {
      case 'notes':
        renderTopicNotes();
        break;
      case 'mindmaps':
        renderMindMapsView();
        break;
      case 'practice':
        renderPracticeQuiz();
        break;
      case 'exam':
        renderExamSimulator();
        break;
      case 'matrix':
        renderDeprecatedMatrix();
        break;
      case 'flashcards':
        renderFlashcards();
        break;
      default:
        renderTopicNotes();
    }
  }

  // --- VIEW 1: TOPIC NOTES ---
  function renderTopicNotes() {
    const topic = state.topics.find(t => t.id === state.currentTopicId) || state.topics[0];
    if (!topic) return;

    const isBookmarked = state.completedTopics.includes(topic.id);
    const relatedQuestions = state.questions.filter(q => q.topic_id === topic.id);

    let html = `
      <div class="topic-header-card">
        <div class="topic-meta">
          <span class="tag-section">${topic.section}</span>
          ${topic.module ? `<span class="tag-section">${topic.module}</span>` : ''}
        </div>
        <h1 class="topic-title">${topic.title}</h1>
        ${topic.subtitle ? `<div class="topic-subtitle">${topic.subtitle}</div>` : ''}
        
        <div style="margin-top: 1rem; display: flex; gap: 0.75rem;">
          <button class="btn-primary" id="btn-practice-this-topic">
            Practice ${relatedQuestions.length} Topic MCQs
          </button>
          <button class="btn-secondary" id="btn-toggle-completed">
            ${isBookmarked ? 'Mark Incomplete' : 'Mark Completed'}
          </button>
        </div>
      </div>

      <!-- Statutory Paras and Rules -->
      ${topic.statutory_paras_and_rules && topic.statutory_paras_and_rules.length > 0 ? `
        <div style="background: rgba(56, 189, 248, 0.08); border-left: 4px solid var(--accent); padding: 1.25rem; border-radius: 6px; margin-bottom: 1.25rem;">
          <div style="font-weight: 700; color: var(--accent); font-size: 0.95rem; margin-bottom: 0.6rem; display: flex; align-items: center; gap: 0.5rem;">
            <span>📜</span> ORIGINAL MANUAL PARAS &amp; STATUTORY CODES
          </div>
          <ul style="margin: 0; padding-left: 1.25rem; font-size: 0.88rem; color: var(--text-primary); line-height: 1.6;">
            ${topic.statutory_paras_and_rules.map(p => `<li><strong>${p}</strong></li>`).join('')}
          </ul>
        </div>
      ` : ''}

      <!-- Historical Roots, Pioneers & Evolution -->
      ${topic.roots_and_evolution ? `
        <div style="background: var(--bg-card); border: 1px solid var(--border); padding: 1.25rem; border-radius: var(--radius); margin-bottom: 1.25rem;">
          <div style="font-weight: 700; color: #f59e0b; font-size: 0.95rem; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem;">
            <span>🏛️</span> HISTORICAL ROOTS, PIONEERS &amp; EVOLUTION
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 0.75rem; font-size: 0.88rem; margin-bottom: 0.75rem;">
            <div style="background: var(--bg-tertiary); padding: 0.75rem; border-radius: 6px;">
              <span style="color: var(--text-muted); display: block; font-size: 0.75rem; text-transform: uppercase;">Origin / Founding Year</span>
              <strong style="color: var(--text-primary);">${topic.roots_and_evolution.origin_year || 'N/A'}</strong>
            </div>
            <div style="background: var(--bg-tertiary); padding: 0.75rem; border-radius: 6px;">
              <span style="color: var(--text-muted); display: block; font-size: 0.75rem; text-transform: uppercase;">Key Pioneers &amp; Architects</span>
              <strong style="color: var(--text-primary);">${topic.roots_and_evolution.key_persons || 'N/A'}</strong>
            </div>
            ${topic.roots_and_evolution.statistics ? `
              <div style="background: var(--bg-tertiary); padding: 0.75rem; border-radius: 6px; grid-column: 1 / -1;">
                <span style="color: var(--text-muted); display: block; font-size: 0.75rem; text-transform: uppercase;">Scale &amp; Benchmark Statistics</span>
                <span style="color: var(--text-primary);">${topic.roots_and_evolution.statistics}</span>
              </div>
            ` : ''}
          </div>
          ${topic.roots_and_evolution.milestones && topic.roots_and_evolution.milestones.length > 0 ? `
            <div style="margin-top: 0.5rem;">
              <span style="color: var(--text-muted); font-size: 0.8rem; font-weight: 600; text-transform: uppercase;">Chronological Milestones:</span>
              <ul style="margin: 0.4rem 0 0 1.25rem; font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5;">
                ${topic.roots_and_evolution.milestones.map(m => `<li>${m}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
      ` : ''}

      <!-- Language Tutorials & Reference Portals -->
      ${topic.language_tutorials_and_references && topic.language_tutorials_and_references.length > 0 ? `
        <div style="background: var(--bg-card); border: 1px solid var(--border); padding: 1.25rem; border-radius: var(--radius); margin-bottom: 1.25rem;">
          <div style="font-weight: 700; color: #10b981; font-size: 0.95rem; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem;">
            <span>💻</span> AUTHORITATIVE LANGUAGE TUTORIALS &amp; OFFICIAL DOCUMENTATION
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 0.75rem;">
            ${topic.language_tutorials_and_references.map(lt => `
              <div style="background: var(--bg-tertiary); padding: 0.85rem; border-radius: 6px; border-left: 3px solid #10b981;">
                <strong style="color: var(--text-primary); font-size: 0.95rem;">${lt.language || lt.technology}</strong>
                <div style="font-size: 0.78rem; color: var(--text-muted); margin: 0.2rem 0;">Standard: ${lt.standard}</div>
                <div style="margin-top: 0.4rem; font-size: 0.82rem;">
                  <a href="${lt.official_docs}" target="_blank" rel="noopener noreferrer" style="color: var(--accent); font-weight: 600;">📖 Official Docs ↗</a>
                </div>
                ${lt.recommended_tutorials && lt.recommended_tutorials.length > 0 ? `
                  <div style="margin-top: 0.4rem; font-size: 0.8rem; color: var(--text-secondary);">
                    <strong>Tutorials:</strong><br>
                    ${lt.recommended_tutorials.map(tut => `<div>• ${tut.replace(/https?:\/\/[^\s]+/g, url => `<a href="${url}" target="_blank" rel="noopener" style="color:var(--accent);">${url}</a>`)}</div>`).join('')}
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Syllabus External Links Comprehensive Audit -->
      ${topic.syllabus_links_audit && topic.syllabus_links_audit.length > 0 ? `
        <div style="background: var(--bg-card); border: 1px solid var(--border); padding: 1.25rem; border-radius: var(--radius); margin-bottom: 1.25rem;">
          <div style="font-weight: 700; color: #a855f7; font-size: 0.95rem; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
            <span>🔍</span> SYLLABUS EXTERNAL LINKS EVALUATION &amp; MIGRATION AUDIT
          </div>
          <p style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 0.75rem;">
            Evaluation of links from pages 7–10 of the official Railway Board syllabus document. Deprecated, acquired, and defunct references have been audited and updated to current authoritative standards.
          </p>
          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; font-size: 0.84rem;">
              <thead>
                <tr style="background: var(--bg-tertiary); color: var(--text-primary); text-align: left;">
                  <th style="padding: 0.6rem; border: 1px solid var(--border);">Syllabus Topic</th>
                  <th style="padding: 0.6rem; border: 1px solid var(--border);">Link in Syllabus</th>
                  <th style="padding: 0.6rem; border: 1px solid var(--border);">Status</th>
                  <th style="padding: 0.6rem; border: 1px solid var(--border);">Audit Analysis &amp; Extraction</th>
                  <th style="padding: 0.6rem; border: 1px solid var(--border);">Current Authoritative Resource</th>
                </tr>
              </thead>
              <tbody>
                ${topic.syllabus_links_audit.map(item => `
                  <tr>
                    <td style="padding: 0.6rem; border: 1px solid var(--border); font-weight: 600;">${item.syllabus_topic}</td>
                    <td style="padding: 0.6rem; border: 1px solid var(--border); font-family: var(--mono); font-size: 0.78rem; color: var(--text-muted);">${item.syllabus_url}</td>
                    <td style="padding: 0.6rem; border: 1px solid var(--border);">
                      <span style="display: inline-block; padding: 0.15rem 0.45rem; border-radius: 4px; font-size: 0.72rem; font-weight: 700; background: ${
                        item.status.includes('DEFUNCT') || item.status.includes('SHUT DOWN') ? 'rgba(239, 68, 68, 0.2); color: #ef4444;' :
                        item.status.includes('Acquired') || item.status.includes('Retired') ? 'rgba(245, 158, 11, 0.2); color: #f59e0b;' :
                        'rgba(16, 185, 129, 0.2); color: #10b981;'
                      }">${item.status}</span>
                    </td>
                    <td style="padding: 0.6rem; border: 1px solid var(--border); color: var(--text-secondary);">${item.audit_analysis}</td>
                    <td style="padding: 0.6rem; border: 1px solid var(--border);">
                      <a href="${item.modern_replacement_url}" target="_blank" rel="noopener noreferrer" style="color: var(--accent); text-decoration: underline; font-weight: 600;">Open Active Portal ↗</a>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      ` : ''}

      <!-- Deprecated vs Modern Callout -->
      ${topic.deprecated_vs_modern ? `
        <div class="deprecated-box">
          <div class="deprecated-title">
            <span>⚠️ DEPRECATED / LEGACY vs MODERN STANDARD EVALUATION</span>
          </div>
          <div style="font-size:0.9rem;">
            <strong>Legacy / Deprecated:</strong> ${topic.deprecated_vs_modern.deprecated_practice}<br>
            <strong>Modern Enterprise Standard:</strong> ${topic.deprecated_vs_modern.modern_practice}<br>
            <span style="color:var(--text-secondary);font-size:0.85rem;margin-top:0.3rem;display:block;">${topic.deprecated_vs_modern.transition_notes || ''}</span>
          </div>
        </div>
      ` : ''}

      <!-- Official References -->
      ${topic.official_references && topic.official_references.length > 0 ? `
        <div class="reference-box">
          <div style="font-weight:700;color:var(--accent);margin-bottom:0.4rem;">
            OFFICIAL RAILWAY &amp; STATUTORY REFERENCES
          </div>
          <ul style="padding-left:1.25rem;font-size:0.88rem;color:var(--text-secondary);">
            ${topic.official_references.map(r => `<li>${r}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      <!-- Key Concepts Grid -->
      <div style="margin: 1.5rem 0;">
        <h3 style="font-size: 1.1rem; color: var(--accent); margin-bottom: 0.75rem;">Core Concepts &amp; Statutory Rules</h3>
        <div class="concepts-grid">
          ${topic.key_concepts.map(c => `<div class="concept-chip">${c}</div>`).join('')}
        </div>
      </div>

      <!-- Detailed Notes Markdown / Content -->
      <div class="notes-prose">
        ${formatMarkdown(topic.detailed_notes)}
      </div>
    `;

    el.mainContent.innerHTML = html;

    // Attach topic buttons
    document.getElementById('btn-practice-this-topic')?.addEventListener('click', () => {
      state.practiceFilterTopic = topic.id;
      state.currentView = 'practice';
      el.viewButtons.forEach(b => b.classList.toggle('active', b.dataset.view === 'practice'));
      renderMainView();
    });

    document.getElementById('btn-toggle-completed')?.addEventListener('click', () => {
      if (state.completedTopics.includes(topic.id)) {
        state.completedTopics = state.completedTopics.filter(id => id !== topic.id);
      } else {
        state.completedTopics.push(topic.id);
      }
      saveStorage();
      renderSidebar();
      renderTopicNotes();
    });
  }

  // --- VIEW 2: MIND MAPS & DESIGN FLOWS ---
  function renderMindMapsView() {
    let html = `
      <div style="margin-bottom: 2rem;">
        <h1 style="font-size: 1.75rem; font-weight: 800; color: var(--text-primary); margin-bottom: 0.5rem;">
          Interactive Mind Maps, Memory Maps &amp; Design Flows
        </h1>
        <p style="color: var(--text-secondary); font-size: 0.95rem;">
          Visual architectural diagrams, OS process memory maps, and statutory railway workflows mandated for Group-B AEDPM.
        </p>
      </div>
    `;

    state.mindmaps.forEach(map => {
      html += `
        <div class="flow-card">
          <div class="flow-card-header">
            <span class="tag-section">${map.category}</span>
            <h2 style="font-size: 1.3rem; margin: 0.4rem 0; color: var(--accent);">${map.title}</h2>
            <p style="color: var(--text-secondary); font-size: 0.9rem;">${map.description}</p>
          </div>
          <div style="overflow-x: auto; margin: 1rem 0;">
            ${map.svg}
          </div>
          ${map.details && map.details.length > 0 ? `
            <div style="background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 6px; font-size: 0.88rem;">
              <strong style="color: var(--accent); display: block; margin-bottom: 0.4rem;">Architectural Breakdown &amp; Exam Notes:</strong>
              <ul style="padding-left: 1.25rem; color: var(--text-secondary);">
                ${map.details.map(d => `<li>${d}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
      `;
    });

    el.mainContent.innerHTML = html;
  }

  // --- VIEW 3: PRACTICE QUIZ ENGINE ---
  function renderPracticeQuiz() {
    let questionsToDisplay = state.questions;
    if (state.practiceFilterTopic !== 'all') {
      questionsToDisplay = questionsToDisplay.filter(q => q.topic_id === state.practiceFilterTopic);
    }

    const currentTopicObj = state.topics.find(t => t.id === state.practiceFilterTopic);

    let html = `
      <div style="margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
        <div>
          <h1 style="font-size: 1.6rem; font-weight: 800; color: var(--text-primary);">
            Practice Question Bank
          </h1>
          <p style="color: var(--text-secondary); font-size: 0.9rem;">
            Displaying ${questionsToDisplay.length} questions ${currentTopicObj ? `for <strong>${currentTopicObj.title}</strong>` : '(All Topics)'}
          </p>
        </div>
        <div style="display: flex; gap: 0.5rem;">
          <select id="practice-topic-selector" style="background: var(--bg-card); color: var(--text-primary); border: 1px solid var(--border); padding: 0.5rem; border-radius: 6px; font-size: 0.85rem;">
            <option value="all">All Topics (${state.questions.length} MCQs)</option>
            ${state.topics.map(t => `
              <option value="${t.id}" ${t.id === state.practiceFilterTopic ? 'selected' : ''}>
                ${t.title}
              </option>
            `).join('')}
          </select>
        </div>
      </div>

      <div class="quiz-container">
    `;

    // Render 50 questions at a time with paging or scroll
    const sliceCount = 100;
    const displayedQuestions = questionsToDisplay.slice(0, sliceCount);

    displayedQuestions.forEach((q, idx) => {
      const userSelected = state.practiceAnswerState[q.id];
      const isAnswered = userSelected !== undefined;

      html += `
        <div class="q-card" id="q-card-${q.id}">
          <div class="q-header">
            <span class="q-badge">${q.id} &bull; ${q.page}</span>
            <span style="font-size:0.75rem; color:var(--text-muted);">${q.section}</span>
          </div>
          <div class="q-text">${idx + 1}. ${q.question}</div>
          <div class="options-grid">
            ${q.options.map((opt, optIdx) => {
              let optClass = '';
              if (isAnswered) {
                if (optIdx === q.answer) optClass = 'show-correct';
                if (userSelected === optIdx) {
                  optClass = optIdx === q.answer ? 'selected-correct' : 'selected-wrong';
                }
              }
              return `
                <button class="option-btn ${optClass}" data-qid="${q.id}" data-opt="${optIdx}" ${isAnswered ? 'disabled' : ''}>
                  <strong>${String.fromCharCode(65 + optIdx)}.</strong> ${opt}
                </button>
              `;
            }).join('')}
          </div>
          ${isAnswered ? `
            <div class="q-explanation">
              <strong>${userSelected === q.answer ? '✓ Correct Answer!' : '✗ Incorrect!'}</strong><br>
              ${q.explanation}
            </div>
          ` : ''}
        </div>
      `;
    });

    html += `</div>`;
    el.mainContent.innerHTML = html;

    // Filter Change
    document.getElementById('practice-topic-selector')?.addEventListener('change', (e) => {
      state.practiceFilterTopic = e.target.value;
      renderPracticeQuiz();
    });

    // Option Clicks
    el.mainContent.querySelectorAll('.option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const qId = btn.dataset.qid;
        const optIdx = parseInt(btn.dataset.opt, 10);
        state.practiceAnswerState[qId] = optIdx;
        renderPracticeQuiz();
      });
    });
  }

  // --- VIEW 4: FULL EXAM SIMULATOR (100 Questions Timed CBT) ---
  function renderExamSimulator() {
    if (!state.exam.active && !state.exam.submitted) {
      renderExamWelcome();
      return;
    }

    if (state.exam.submitted) {
      renderExamResults();
      return;
    }

    // Active Exam Running
    renderActiveExamScreen();
  }

  function renderExamWelcome() {
    el.mainContent.innerHTML = `
      <div style="max-width: 800px; margin: 2rem auto; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 2.5rem;">
        <h1 style="color: var(--accent); font-size: 1.8rem; margin-bottom: 1rem; text-align: center;">
          Railway Group 'B' Centralized CBT Simulator
        </h1>
        <p style="color: var(--text-secondary); margin-bottom: 1.5rem; text-align: center;">
          Simulates the official Railway Board CBT/TBT for Miscellaneous Cadre AEDPM (Common Vacancy Cycle 2027-2028).
        </p>

        <div style="background: var(--bg-primary); padding: 1.5rem; border-radius: 8px; border: 1px solid var(--border); margin-bottom: 2rem;">
          <h3 style="color: var(--text-primary); margin-bottom: 0.75rem;">Official CBT Rules &amp; Scheme of Marking:</h3>
          <ul style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.8; padding-left: 1.5rem;">
            <li><strong>Total Questions:</strong> 100 Multiple Choice Questions (randomized across all syllabus sections).</li>
            <li><strong>Total Time:</strong> 120 Minutes (2 Hours).</li>
            <li><strong>Marking Scheme:</strong> +1.0 Mark for each correct answer.</li>
            <li><strong>Negative Marking:</strong> <strong>-1/3 (-0.33) Mark</strong> deducted for each wrong answer.</li>
            <li>Zero marks for unattempted questions.</li>
            <li>Qualifying Benchmark: 60% Marks (80% for Outstanding).</li>
          </ul>
        </div>

        <div style="text-align: center;">
          <button class="btn-primary" id="btn-start-exam" style="font-size: 1.1rem; padding: 0.85rem 2.5rem;">
            Start 100-Question Mock Test
          </button>
        </div>
      </div>
    `;

    document.getElementById('btn-start-exam')?.addEventListener('click', startExam);
  }

  function startExam() {
    // Pick 100 randomized questions
    const shuffled = [...state.questions].sort(() => 0.5 - Math.random());
    state.exam.questions = shuffled.slice(0, 100);
    state.exam.active = true;
    state.exam.submitted = false;
    state.exam.currentIndex = 0;
    state.exam.userAnswers = {};
    state.exam.flagged = {};
    state.exam.timeRemaining = 7200; // 120 mins

    if (state.exam.timerInterval) clearInterval(state.exam.timerInterval);
    state.exam.timerInterval = setInterval(() => {
      state.exam.timeRemaining--;
      updateExamTimerDisplay();
      if (state.exam.timeRemaining <= 0) {
        clearInterval(state.exam.timerInterval);
        submitExam();
      }
    }, 1000);

    renderActiveExamScreen();
  }

  function updateExamTimerDisplay() {
    const timerEl = document.getElementById('exam-timer');
    if (!timerEl) return;
    const mins = Math.floor(state.exam.timeRemaining / 60);
    const secs = state.exam.timeRemaining % 60;
    timerEl.innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  function renderActiveExamScreen() {
    const qIndex = state.exam.currentIndex;
    const currentQ = state.exam.questions[qIndex];
    const userSelected = state.exam.userAnswers[qIndex];

    const html = `
      <div class="exam-layout">
        <!-- Main Question Area -->
        <div class="exam-main">
          <div style="display: flex; justify-content: space-between; margin-bottom: 1rem; border-bottom: 1px solid var(--border); padding-bottom: 0.5rem;">
            <span style="font-weight: 700; color: var(--accent);">Question ${qIndex + 1} of 100</span>
            <span style="color: var(--text-muted); font-size: 0.85rem;">${currentQ.section} (${currentQ.page})</span>
          </div>

          <div style="font-size: 1.15rem; font-weight: 600; color: var(--text-primary); margin-bottom: 1.5rem;">
            ${currentQ.question}
          </div>

          <div class="options-grid" style="margin-bottom: 2rem;">
            ${currentQ.options.map((opt, optIdx) => `
              <button class="option-btn ${userSelected === optIdx ? 'selected-correct' : ''}" data-opt="${optIdx}">
                <strong>${String.fromCharCode(65 + optIdx)}.</strong> ${opt}
              </button>
            `).join('')}
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border); padding-top: 1rem;">
            <div style="display: flex; gap: 0.5rem;">
              <button class="btn-secondary" id="btn-exam-prev" ${qIndex === 0 ? 'disabled' : ''}>Previous</button>
              <button class="btn-primary" id="btn-exam-next" ${qIndex === 99 ? 'disabled' : ''}>Next</button>
            </div>
            <div style="display: flex; gap: 0.5rem;">
              <button class="btn-secondary" id="btn-exam-flag">
                ${state.exam.flagged[qIndex] ? 'Unmark Review' : 'Mark for Review'}
              </button>
              <button class="btn-primary" id="btn-exam-submit" style="background: var(--danger);">
                Submit CBT Test
              </button>
            </div>
          </div>
        </div>

        <!-- Sidebar Palette -->
        <div class="exam-sidebar">
          <div class="timer-box" id="exam-timer">120:00</div>
          <div style="font-size: 0.85rem; font-weight: bold; margin-bottom: 0.5rem; color: var(--text-secondary);">
            Question Palette
          </div>
          <div class="palette-grid">
            ${state.exam.questions.map((_, i) => {
              let pClass = '';
              if (i === qIndex) pClass += ' active';
              if (state.exam.userAnswers[i] !== undefined) pClass += ' answered';
              if (state.exam.flagged[i]) pClass += ' flagged';
              return `<button class="palette-btn ${pClass}" data-idx="${i}">${i + 1}</button>`;
            }).join('')}
          </div>
        </div>
      </div>
    `;

    el.mainContent.innerHTML = html;
    updateExamTimerDisplay();

    // Event handlers for active exam
    el.mainContent.querySelectorAll('.option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        state.exam.userAnswers[qIndex] = parseInt(btn.dataset.opt, 10);
        renderActiveExamScreen();
      });
    });

    document.getElementById('btn-exam-prev')?.addEventListener('click', () => {
      if (state.exam.currentIndex > 0) {
        state.exam.currentIndex--;
        renderActiveExamScreen();
      }
    });

    document.getElementById('btn-exam-next')?.addEventListener('click', () => {
      if (state.exam.currentIndex < 99) {
        state.exam.currentIndex++;
        renderActiveExamScreen();
      }
    });

    document.getElementById('btn-exam-flag')?.addEventListener('click', () => {
      state.exam.flagged[qIndex] = !state.exam.flagged[qIndex];
      renderActiveExamScreen();
    });

    document.getElementById('btn-exam-submit')?.addEventListener('click', () => {
      if (confirm('Are you sure you want to finish and submit your CBT Exam?')) {
        submitExam();
      }
    });

    el.mainContent.querySelectorAll('.palette-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        state.exam.currentIndex = parseInt(btn.dataset.idx, 10);
        renderActiveExamScreen();
      });
    });
  }

  function submitExam() {
    clearInterval(state.exam.timerInterval);
    state.exam.active = false;
    state.exam.submitted = true;

    let correct = 0;
    let wrong = 0;
    let unattempted = 0;

    state.exam.questions.forEach((q, idx) => {
      const ans = state.exam.userAnswers[idx];
      if (ans === undefined) {
        unattempted++;
      } else if (ans === q.answer) {
        correct++;
      } else {
        wrong++;
      }
    });

    // Score calculation with -1/3 negative marking
    const netMarks = (correct * 1.0) - (wrong * (1.0 / 3.0));
    state.exam.score = {
      correct,
      wrong,
      unattempted,
      totalMarks: Math.max(0, netMarks).toFixed(2)
    };

    renderExamResults();
  }

  function renderExamResults() {
    const sc = state.exam.score;
    const percentage = ((parseFloat(sc.totalMarks) / 100.0) * 100).toFixed(1);
    const isPassed = parseFloat(sc.totalMarks) >= 60.0;

    let html = `
      <div style="max-width: 850px; margin: 1.5rem auto; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 2rem;">
        <h1 style="color: var(--accent); text-align: center; margin-bottom: 0.5rem;">CBT Exam Results</h1>
        <div style="text-align: center; font-size: 1.5rem; font-weight: 800; color: ${isPassed ? 'var(--success)' : 'var(--danger)'}; margin-bottom: 1.5rem;">
          ${isPassed ? 'QUALIFIED (>= 60%)' : 'DID NOT QUALIFY (< 60%)'}
        </div>

        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 2rem;">
          <div style="background: var(--bg-primary); padding: 1rem; border-radius: 8px; text-align: center;">
            <div style="color: var(--text-muted); font-size: 0.8rem;">TOTAL MARKS</div>
            <div style="font-size: 1.6rem; font-weight: bold; color: var(--accent);">${sc.totalMarks} / 100</div>
          </div>
          <div style="background: var(--bg-primary); padding: 1rem; border-radius: 8px; text-align: center;">
            <div style="color: var(--text-muted); font-size: 0.8rem;">CORRECT (+1.0)</div>
            <div style="font-size: 1.6rem; font-weight: bold; color: var(--success);">${sc.correct}</div>
          </div>
          <div style="background: var(--bg-primary); padding: 1rem; border-radius: 8px; text-align: center;">
            <div style="color: var(--text-muted); font-size: 0.8rem;">WRONG (-0.33)</div>
            <div style="font-size: 1.6rem; font-weight: bold; color: var(--danger);">${sc.wrong}</div>
          </div>
          <div style="background: var(--bg-primary); padding: 1rem; border-radius: 8px; text-align: center;">
            <div style="color: var(--text-muted); font-size: 0.8rem;">UNATTEMPTED</div>
            <div style="font-size: 1.6rem; font-weight: bold; color: var(--text-secondary);">${sc.unattempted}</div>
          </div>
        </div>

        <div style="text-align: center; margin-bottom: 2rem;">
          <button class="btn-primary" id="btn-retake-exam">Retake New Mock CBT</button>
        </div>

        <h3 style="color: var(--text-primary); margin-bottom: 1rem;">Detailed Question-by-Question Review:</h3>
        <div class="quiz-container">
    `;

    state.exam.questions.forEach((q, idx) => {
      const userAns = state.exam.userAnswers[idx];
      const isCorrect = userAns === q.answer;
      const wasAttempted = userAns !== undefined;

      html += `
        <div class="q-card" style="border-left: 5px solid ${!wasAttempted ? 'var(--text-muted)' : isCorrect ? 'var(--success)' : 'var(--danger)'};">
          <div class="q-header">
            <span class="q-badge">Q.${idx + 1} &bull; ${q.id}</span>
            <span style="font-size:0.8rem; font-weight:bold; color: ${!wasAttempted ? 'var(--text-muted)' : isCorrect ? 'var(--success)' : 'var(--danger)'};">
              ${!wasAttempted ? 'UNATTEMPTED (0 Marks)' : isCorrect ? '+1.0 MARKS' : '-0.33 MARKS'}
            </span>
          </div>
          <div class="q-text">${q.question}</div>
          <div class="options-grid">
            ${q.options.map((opt, optIdx) => {
              let optClass = '';
              if (optIdx === q.answer) optClass = 'show-correct';
              if (userAns === optIdx && optIdx !== q.answer) optClass = 'selected-wrong';
              return `
                <div class="option-btn ${optClass}" style="cursor: default;">
                  <strong>${String.fromCharCode(65 + optIdx)}.</strong> ${opt}
                </div>
              `;
            }).join('')}
          </div>
          <div class="q-explanation">
            <strong>Explanation:</strong> ${q.explanation}
          </div>
        </div>
      `;
    });

    html += `</div></div>`;
    el.mainContent.innerHTML = html;

    document.getElementById('btn-retake-exam')?.addEventListener('click', startExam);
  }

  // --- VIEW 5: DEPRECATED VS MODERN TECHNOLOGY MATRIX ---
  function renderDeprecatedMatrix() {
    const comparisons = [
      {
        domain: "Labour Laws & Industrial Relations",
        deprecated: "29 Erstwhile Central Labour Acts (Industrial Disputes Act 1947, Factories Act 1948, Trade Unions Act 1926, Payment of Wages Act 1936)",
        modern: "4 Comprehensive Labour Codes 2020 (Code on Wages 2019, IR Code 2020, Social Security Code 2020, OSH Code 2020)",
        reason: "Statutory consolidation enacted by Parliament; syllabus specifically instructs evaluating erstwhile acts under 4 Codes."
      },
      {
        domain: "Railway Budgeting & Financial Control",
        deprecated: "Separate Railway Budget presented prior to Union Budget (Acworth Separation Convention 1924); 16 distinct Demands for Grants",
        modern: "Merged Union Budget from 2017-18; Single Demand for Grants (Demand No. 85 - Ministry of Railways); no dividend liability",
        reason: "Bibek Debroy Committee recommendation to streamline national budgetary operations."
      },
      {
        domain: "Railway Pension Framework",
        deprecated: "Defined Benefit Old Pension Scheme (pre-2004); Pure market-linked NPS without guaranteed return (2004-2024)",
        modern: "Unified Pension Scheme (UPS) approved in 2024/2025: Guaranteed 50% average pay pension, 60% family pension, Dearness Relief indexation",
        reason: "Provides social security and financial certainty for government employees."
      },
      {
        domain: "GUI Client-Server Tools",
        deprecated: "Visual Basic 6.0 (VB6), Oracle Developer 2000 (D2K) / Forms & Reports iDS, PowerBuilder",
        modern: "Modern Web Front-Ends (React, Angular, Vue, Web Components), Electron, Qt, C# .NET WPF/MAUI",
        reason: "VB6 retired by Microsoft in 2008; D2K browser plugins deprecated; modern web frameworks offer superior scalability."
      },
      {
        domain: "Social Media Platforms",
        deprecated: "Google+ (Listed in syllabus item 13.4)",
        modern: "Google Workspace / Google Chat Spaces; X (Twitter), LinkedIn, Meta Platforms",
        reason: "Google officially shut down Google+ for consumers on April 2, 2019 due to low engagement and API vulnerabilities."
      },
      {
        domain: "Railway Personnel Administration",
        deprecated: "Paper Service Registers (SR), physical privilege passbooks with counterfoils, paper leave forms",
        modern: "CRIS HRMS: Electronic Service Register (e-SR), e-Pass with UPN and IRCTC direct integration, online Leave Module, SPARROW APAR",
        reason: "100% paperless administration, transparency, and instant all-India service portability."
      },
      {
        domain: "Railway Financial & Material Accounting",
        deprecated: "PRIME (Payroll) and AFRES (Financial Accounting) on decentralized local depot servers; paper measurement books",
        modern: "IPAS (Integrated Payroll & Accounting System), IREPS (e-Procurement), UDM (User Depot Module), electronic Measurement Book (e-MB)",
        reason: "Centralized cloud computing, real-time GST reconciliation, and direct RBI NEFT salary disbursement."
      },
      {
        domain: "IT Service Management Frameworks",
        deprecated: "ITIL v2 / v3 26 linear lifecycle processes",
        modern: "ITIL 4 Service Value System (SVS) & 34 Management Practices; DevSecOps CI/CD",
        reason: "Modern IT operations require agile, flexible value streams rather than rigid phase-gate handoffs."
      },
      {
        domain: "Web Accessibility Standards",
        deprecated: "GIGW 1.0 (2009) basic guidelines; non-responsive HTML4 frames and tables",
        modern: "GIGW 3.0 (2023) adhering strictly to W3C WCAG 2.1 Level AA, mobile-first design, bilingual compliance, and STQC certification",
        reason: "Mandatory compliance for all Government of India websites and portals."
      }
    ];

    let html = `
      <div style="margin-bottom: 2rem;">
        <h1 style="font-size: 1.75rem; font-weight: 800; color: var(--text-primary); margin-bottom: 0.5rem;">
          Deprecated vs Modern Technology &amp; Rules Matrix
        </h1>
        <p style="color: var(--text-secondary); font-size: 0.95rem;">
          Mandatory evaluation comparing outdated syllabus technologies with current Railway &amp; Industry benchmarks.
        </p>
      </div>

      <div style="display: flex; flex-direction: column; gap: 1.25rem;">
        ${comparisons.map(item => `
          <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 1.5rem;">
            <div style="font-weight: 700; color: var(--accent); font-size: 1.1rem; margin-bottom: 0.75rem;">
              ${item.domain}
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 0.75rem;">
              <div style="background: rgba(239, 68, 68, 0.1); border-left: 4px solid var(--danger); padding: 0.85rem; border-radius: 4px;">
                <strong style="color: var(--danger); font-size: 0.85rem; display: block; margin-bottom: 0.25rem;">DEPRECATED / OUTDATED:</strong>
                <span style="font-size: 0.9rem; color: var(--text-primary);">${item.deprecated}</span>
              </div>
              <div style="background: rgba(16, 185, 129, 0.1); border-left: 4px solid var(--success); padding: 0.85rem; border-radius: 4px;">
                <strong style="color: var(--success); font-size: 0.85rem; display: block; margin-bottom: 0.25rem;">CURRENT ENTERPRISE STANDARD:</strong>
                <span style="font-size: 0.9rem; color: var(--text-primary);">${item.modern}</span>
              </div>
            </div>
            <div style="font-size: 0.85rem; color: var(--text-secondary);">
              <strong>Exam Evaluation Note:</strong> ${item.reason}
            </div>
          </div>
        `).join('')}
      </div>
    `;

    el.mainContent.innerHTML = html;
  }

  // --- VIEW 6: FLASHCARDS RAPID RECALL ---
  function renderFlashcards() {
    const flashcards = [
      { q: "What is SF-5 under RS (D&A) Rules 1968?", a: "Charge-sheet for instituting Major Penalty disciplinary proceedings under Rule 9." },
      { q: "What is Rule 116 of IRFC Vol. I?", a: "Codifies the 4 cardinal Canons of Financial Propriety (Prudent man rule, no self-advantage, no personal benefit, allowance limits)." },
      { q: "What is the formula for Operating Ratio?", a: "Operating Ratio = (Total Working Expenses / Gross Traffic Receipts) * 100." },
      { q: "What is the benchmark ROR under DCF for railway capital works?", a: "Minimum 10% Rate of Return (reduced from 14%)." },
      { q: "What are Coffman's 4 Deadlock conditions?", a: "1. Mutual Exclusion, 2. Hold and Wait, 3. No Preemption, 4. Circular Wait." },
      { q: "What is Cyclomatic Complexity V(G)?", a: "V(G) = E - N + 2P = P_d + 1 (edges - nodes + 2*components)." },
      { q: "What does G01 code do in CNC machine?", a: "Linear interpolation cutting motion at controlled feed rate." },
      { q: "What is the 3-2-1 backup rule?", a: "3 copies of data, across 2 different storage media, with at least 1 copy offsite." },
      { q: "What is the maximum penalty under IT Act Section 66F (Cyber Terrorism)?", a: "Imprisonment for LIFE." },
      { q: "What are the 4 New Labour Codes 2020?", a: "1. Code on Wages 2019, 2. Industrial Relations Code 2020, 3. Social Security Code 2020, 4. OSH Code 2020." }
    ];

    const card = flashcards[state.flashcardIndex % flashcards.length];

    let html = `
      <div style="max-width: 650px; margin: 3rem auto; text-align: center;">
        <h1 style="color: var(--accent); font-size: 1.6rem; margin-bottom: 0.5rem;">
          Flashcards Rapid Revision Mode
        </h1>
        <p style="color: var(--text-secondary); margin-bottom: 2rem;">
          Card ${state.flashcardIndex + 1} of ${flashcards.length}
        </p>

        <div id="flashcard-box" style="background: var(--bg-card); border: 2px solid var(--accent); border-radius: 12px; min-height: 250px; display: flex; align-items: center; justify-content: center; padding: 2.5rem; cursor: pointer; transition: transform 0.2s; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3);">
          <div style="font-size: 1.25rem; font-weight: 600; color: ${state.flashcardFlipped ? 'var(--success)' : 'var(--text-primary)'};">
            ${state.flashcardFlipped ? card.a : card.q}
            <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 1rem; font-weight: normal;">
              ${state.flashcardFlipped ? '(Click to see Question)' : '(Click to reveal Answer)'}
            </div>
          </div>
        </div>

        <div style="display: flex; justify-content: center; gap: 1rem; margin-top: 2rem;">
          <button class="btn-secondary" id="btn-fc-prev">Previous Card</button>
          <button class="btn-primary" id="btn-fc-flip">Flip Card</button>
          <button class="btn-secondary" id="btn-fc-next">Next Card</button>
        </div>
      </div>
    `;

    el.mainContent.innerHTML = html;

    const box = document.getElementById('flashcard-box');
    box?.addEventListener('click', () => {
      state.flashcardFlipped = !state.flashcardFlipped;
      renderFlashcards();
    });

    document.getElementById('btn-fc-flip')?.addEventListener('click', () => {
      state.flashcardFlipped = !state.flashcardFlipped;
      renderFlashcards();
    });

    document.getElementById('btn-fc-prev')?.addEventListener('click', () => {
      state.flashcardIndex = (state.flashcardIndex - 1 + flashcards.length) % flashcards.length;
      state.flashcardFlipped = false;
      renderFlashcards();
    });

    document.getElementById('btn-fc-next')?.addEventListener('click', () => {
      state.flashcardIndex = (state.flashcardIndex + 1) % flashcards.length;
      state.flashcardFlipped = false;
      renderFlashcards();
    });
  }

  // --- ADVANCED MARKDOWN FORMATTER HELPER ---
  function formatMarkdown(md) {
    if (!md) return '';
    let res = md;
    
    // Code blocks
    res = res.replace(/```([a-z]*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>');
    // Inline code
    res = res.replace(/`([^`]+)`/g, '<code style="background:var(--bg-tertiary);padding:0.15rem 0.4rem;border-radius:4px;color:var(--accent);font-family:var(--mono);font-size:0.88em;">$1</code>');
    // Headers
    res = res.replace(/^#### (.*$)/gim, '<h4 style="color:var(--text-primary);margin:1.2rem 0 0.5rem;font-size:1rem;">$1</h4>');
    res = res.replace(/^### (.*$)/gim, '<h3 style="color:var(--accent);margin:1.5rem 0 0.6rem;font-size:1.15rem;border-bottom:1px solid var(--border);padding-bottom:0.3rem;">$1</h3>');
    res = res.replace(/^## (.*$)/gim, '<h2 style="color:var(--accent);margin:1.8rem 0 0.8rem;font-size:1.35rem;">$1</h2>');
    res = res.replace(/^# (.*$)/gim, '<h1 style="color:var(--accent);margin:2rem 0 1rem;font-size:1.5rem;">$1</h1>');
    // Bold
    res = res.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Links [text](url)
    res = res.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:var(--accent);text-decoration:underline;">$1 ↗</a>');
    // Lists
    res = res.replace(/^\s*-\s+(.*$)/gim, '<li>$1</li>');
    
    // Robust Table Processing
    const lines = res.split('\n');
    let inTable = false;
    let tableBuffer = [];
    let newLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('|') && line.endsWith('|')) {
        if (line.includes('---')) {
          continue;
        }
        if (!inTable) {
          inTable = true;
          tableBuffer = [];
        }
        const cells = line.split('|').slice(1, -1);
        const isHeader = tableBuffer.length === 0;
        const tag = isHeader ? 'th' : 'td';
        const cellStyle = isHeader 
          ? 'padding:0.6rem 0.8rem;border:1px solid var(--border);background:var(--bg-tertiary);color:var(--text-primary);font-weight:700;text-align:left;'
          : 'padding:0.6rem 0.8rem;border:1px solid var(--border);text-align:left;';
        const rowHtml = '<tr>' + cells.map(c => `<${tag} style="${cellStyle}">${c.trim()}</${tag}>`).join('') + '</tr>';
        tableBuffer.push(rowHtml);
      } else {
        if (inTable) {
          newLines.push('<div style="overflow-x:auto;margin:1.2rem 0;"><table style="width:100%;border-collapse:collapse;background:var(--bg-card);border:1px solid var(--border);border-radius:6px;font-size:0.88rem;">' + tableBuffer.join('') + '</table></div>');
          inTable = false;
          tableBuffer = [];
        }
        newLines.push(lines[i]);
      }
    }
    if (inTable) {
      newLines.push('<div style="overflow-x:auto;margin:1.2rem 0;"><table style="width:100%;border-collapse:collapse;background:var(--bg-card);border:1px solid var(--border);border-radius:6px;font-size:0.88rem;">' + tableBuffer.join('') + '</table></div>');
    }
    
    res = newLines.join('\n');
    // Paragraph breaks
    res = res.replace(/\n\n/g, '<br><br>');
    return res;
  }

  // Auto-init on load
  window.addEventListener('DOMContentLoaded', init);

})();
