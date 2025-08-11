// ポップアップの制御スクリプト
document.addEventListener('DOMContentLoaded', function () {
  const languageSelect = document.getElementById('language');
  const fontSizeSelect = document.getElementById('fontSize');
  const themeSelect = document.getElementById('theme');
  const toggleButton = document.getElementById('toggleButton');
  const status = document.getElementById('status');
  const statusText = document.getElementById('statusText');
  const termsInfo = document.getElementById('termsInfo');
  const termsCount = document.getElementById('termsCount');
  const dataSize = document.getElementById('dataSize');
  
  // 検索機能の要素
  const termSearch = document.getElementById('termSearch');
  const searchSuggestions = document.getElementById('searchSuggestions');
  const searchResult = document.getElementById('searchResult');
  
  // AWS用語データを保存する変数
  let awsTermsData = {};
  let currentLanguage = 'ja';
  let selectedSuggestionIndex = -1;

  // Content scriptの準備状態をチェックする関数
  function checkContentScriptReady(callback) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (!tabs[0]) {
        callback(false);
        return;
      }

      chrome.tabs.sendMessage(tabs[0].id, { action: 'ping' }, function (response) {
        if (chrome.runtime.lastError) {
          callback(false);
        } else {
          callback(true);
        }
      });
    });
  }

  // Content scriptが準備できるまで待つ関数
  function waitForContentScript(callback, maxRetries = 5, delay = 500) {
    let retries = 0;

    function tryConnect() {
      checkContentScriptReady(function (ready) {
        if (ready) {
          callback(true);
        } else if (retries < maxRetries) {
          retries++;
          setTimeout(tryConnect, delay);
        } else {
          callback(false);
        }
      });
    }

    tryConnect();
  }

  // 保存された設定を読み込み
  chrome.storage.sync.get(['language', 'enabled', 'fontSize', 'theme'], function (result) {
    currentLanguage = result.language || 'ja'; // 現在の言語を設定
    languageSelect.value = currentLanguage;
    fontSizeSelect.value = result.fontSize || 'medium';
    themeSelect.value = result.theme || 'auto';
    updateButtonState(result.enabled || false);
  });

  // 言語変更時の処理
  languageSelect.addEventListener('change', function () {
    const selectedLanguage = languageSelect.value;
    currentLanguage = selectedLanguage; // 現在の言語を更新

    // 設定を保存
    chrome.storage.sync.set({ language: selectedLanguage });

    // アクティブなタブにメッセージを送信
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'changeLanguage',
          language: selectedLanguage
        }, function (response) {
          if (chrome.runtime.lastError) {
            return;
          }
          if (response && response.success && response.termsCount) {
            updateTermsCount(response.termsCount);
          }
        });
      }
    });

    updateStatusText(selectedLanguage);
    
    // 検索結果がある場合は再表示
    if (searchResult.classList.contains('show') && termSearch.value.trim()) {
      const results = searchTerms(termSearch.value);
      if (results.length > 0) {
        selectTerm(results[0].term, results[0].data);
      }
    }
  });

  // 文字サイズ変更時の処理
  fontSizeSelect.addEventListener('change', function () {
    const selectedFontSize = fontSizeSelect.value;

    // 設定を保存
    chrome.storage.sync.set({ fontSize: selectedFontSize });

    // アクティブなタブにメッセージを送信
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'changeFontSize',
          fontSize: selectedFontSize
        }, function (response) {
          if (chrome.runtime.lastError) {
            return;
          }
        });
      }
    });
  });

  // テーマ変更時の処理
  themeSelect.addEventListener('change', function () {
    const selectedTheme = themeSelect.value;

    // 設定を保存
    chrome.storage.sync.set({ theme: selectedTheme });

    // アクティブなタブにメッセージを送信
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'changeTheme',
          theme: selectedTheme
        }, function (response) {
          if (chrome.runtime.lastError) {
            return;
          }
        });
      }
    });
  });

  // 機能の有効/無効切り替え
  toggleButton.addEventListener('click', function () {
    chrome.storage.sync.get(['enabled'], function (result) {
      const newState = !result.enabled;

      chrome.storage.sync.set({ enabled: newState }, function () {
        updateButtonState(newState);

        if (newState) {
          // 機能を有効化する場合、content scriptの準備を待つ
          waitForContentScript(function (ready) {
            if (ready) {
              sendToggleMessage(newState);
            } else {
              statusText.textContent = 'ページを再読み込みしてください';
            }
          });
        } else {
          // 無効化の場合はすぐに送信
          sendToggleMessage(newState);
        }
      });
    });
  });

  // トグルメッセージを送信する関数
  function sendToggleMessage(enabled) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'toggle',
          enabled: enabled
        }, function (response) {
          if (chrome.runtime.lastError) {
            return;
          }
          
          // AWS関連サイトでない場合の処理
          if (response && !response.success && response.isAWSRelatedSite === false) {
            updateButtonState(false);
            statusText.textContent = 'AWS関連サイトではありません';
            status.style.display = 'block';
            status.style.backgroundColor = '#fff3cd';
            status.style.color = '#856404';
            status.style.border = '1px solid #ffeaa7';
            return;
          }
          
          if (response && response.success && response.termsCount) {
            updateTermsCount(response.termsCount);
          }
        });
      }
    });
  }

  function updateButtonState(enabled) {
    if (enabled) {
      toggleButton.textContent = '機能を無効化';
      toggleButton.classList.remove('disabled');
      status.style.display = 'block';
      termsInfo.style.display = 'block';
      chrome.storage.sync.get(['language'], function (result) {
        updateStatusText(result.language || 'ja');
      });
      // 用語数を取得
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, { action: 'getTermsCount' }, function (response) {
            if (chrome.runtime.lastError) {
              return;
            }
            if (response && response.success && response.termsCount) {
              updateTermsCount(response.termsCount);
            }
          });
        }
      });
    } else {
      toggleButton.textContent = '機能を有効化';
      toggleButton.classList.add('disabled');
      status.style.display = 'none';
      termsInfo.style.display = 'none';
    }
  }

  function updateStatusText(language) {
    if (language === 'ja') {
      statusText.textContent = '機能が有効になりました（日本語）';
    } else {
      statusText.textContent = 'Feature enabled (English)';
    }
  }

  function updateTermsCount(count) {
    termsCount.textContent = count;
  }

  function updateDataSize(sizeInBytes) {
    const sizeInKB = (sizeInBytes / 1024).toFixed(1);
    const sizeInMB = (sizeInBytes / 1024 / 1024).toFixed(2);
    
    if (sizeInBytes < 1024 * 1024) {
      dataSize.textContent = `${sizeInKB}KB`;
    } else {
      dataSize.textContent = `${sizeInMB}MB`;
    }
    
    // サイズに応じて色を変更
    if (sizeInBytes > 10 * 1024 * 1024) { // 10MB以上
      dataSize.style.color = '#dc3545'; // 赤
    } else if (sizeInBytes > 5 * 1024 * 1024) { // 5MB以上
      dataSize.style.color = '#ffc107'; // 黄
    } else {
      dataSize.style.color = '#28a745'; // 緑
    }
  }

  // AWS用語データを取得する関数（大容量ファイル対応）
  async function loadTermsData() {
    try {
      const [jaResponse, enResponse] = await Promise.all([
        fetchWithSizeCheck(chrome.runtime.getURL('data/aws-terms-ja.json')),
        fetchWithSizeCheck(chrome.runtime.getURL('data/aws-terms-en.json'))
      ]);

      if (!jaResponse.ok || !enResponse.ok) {
        throw new Error(`HTTP error! ja: ${jaResponse.status}, en: ${enResponse.status}`);
      }

      const [jaData, enData] = await Promise.all([
        parseJSONWithProgress(jaResponse, 'ja'),
        parseJSONWithProgress(enResponse, 'en')
      ]);

      awsTermsData = {};
      for (const term in jaData) {
        awsTermsData[term] = {
          ja: jaData[term],
          en: enData[term] || jaData[term]
        };
      }

      const dataString = JSON.stringify(awsTermsData);
      const dataSizeBytes = new Blob([dataString]).size;
      updateDataSize(dataSizeBytes);
      
    } catch (error) {
      console.error('用語データの読み込みに失敗しました:', error);
      // フォールバック用の基本データを設定
      awsTermsData = getFallbackTerms();
    }
  }

  // ファイルサイズチェック付きfetch
  async function fetchWithSizeCheck(url, maxSizeMB = 50) {
    try {
      const response = await fetch(url);
      
      const contentLength = response.headers.get('content-length');
      if (contentLength) {
        const sizeInMB = parseInt(contentLength) / (1024 * 1024);
        if (sizeInMB > maxSizeMB) {
          throw new Error(`ファイルサイズが制限を超えています: ${sizeInMB.toFixed(2)}MB > ${maxSizeMB}MB`);
        }
      }
      
      return response;
    } catch (error) {
      console.error(`ファイル読み込みエラー (${url}):`, error);
      throw error;
    }
  }

  // プログレス表示付きJSON解析
  async function parseJSONWithProgress(response, label) {
    const contentLength = response.headers.get('content-length');
    const totalSize = contentLength ? parseInt(contentLength) : 0;
    
    if (totalSize > 5 * 1024 * 1024) {
      const reader = response.body.getReader();
      const chunks = [];
      let receivedLength = 0;
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        receivedLength += value.length;
      }
      
      const chunksAll = new Uint8Array(receivedLength);
      let position = 0;
      for (let chunk of chunks) {
        chunksAll.set(chunk, position);
        position += chunk.length;
      }
      
      const text = new TextDecoder('utf-8').decode(chunksAll);
      return JSON.parse(text);
    } else {
      return await response.json();
    }
  }

  // フォールバック用の基本データ
  function getFallbackTerms() {
    return {
      'EC2': {
        ja: {
          name: 'Elastic Compute Cloud',
          description: 'AWSのクラウド上で仮想サーバー（インスタンス）を提供するサービス。'
        },
        en: {
          name: 'Elastic Compute Cloud',
          description: 'A web service that provides resizable compute capacity in the cloud.'
        }
      },
      'S3': {
        ja: {
          name: 'Simple Storage Service',
          description: 'AWSが提供するオブジェクトストレージサービス。'
        },
        en: {
          name: 'Simple Storage Service',
          description: 'Object storage service for web applications, backup, data archiving, and more.'
        }
      },
      'Lambda': {
        ja: {
          name: 'AWS Lambda',
          description: 'サーバーレスコンピューティングサービス。'
        },
        en: {
          name: 'AWS Lambda',
          description: 'Serverless computing service that lets you run code without provisioning servers.'
        }
      }
    };
  }

  // 用語検索機能（軽量化）
  function searchTerms(query) {
    if (!query.trim()) return [];

    const results = [];
    const queryLower = query.toLowerCase();
    let count = 0;
    const maxResults = 10; // 結果数を制限してパフォーマンス向上

    // 完全一致を最初にチェック
    if (awsTermsData[query] || awsTermsData[queryLower]) {
      const term = awsTermsData[query] ? query : queryLower;
      const termData = awsTermsData[term][currentLanguage];
      if (termData) {
        results.push({ term, data: termData, score: 100 });
        count++;
      }
    }

    // 部分一致検索（結果数制限付き）
    for (const [term, data] of Object.entries(awsTermsData)) {
      if (count >= maxResults) break;
      
      const termData = data[currentLanguage];
      if (!termData || term.toLowerCase() === queryLower) continue;

      const termLower = term.toLowerCase();
      if (termLower.startsWith(queryLower)) {
        results.push({ term, data: termData, score: 90 });
        count++;
      } else if (termLower.includes(queryLower)) {
        results.push({ term, data: termData, score: 80 });
        count++;
      }
    }

    return results.sort((a, b) => b.score - a.score);
  }

  // オートコンプリート候補を表示
  function showSuggestions(query) {
    const results = searchTerms(query);
    
    if (results.length === 0) {
      hideSuggestions();
      return;
    }

    searchSuggestions.innerHTML = '';
    results.forEach((result, index) => {
      const item = document.createElement('div');
      item.className = 'suggestion-item';
      // メリットとデメリットの最初の1つずつを取得
      let prosConsHTML = '';
      
      if (result.data.usability) {
        let prosText = '';
        let consText = '';
        
        if (result.data.usability.pros && result.data.usability.pros.length > 0) {
          const firstPro = result.data.usability.pros[0];
          prosText = `<div class="suggestion-pros">👍 ${firstPro}</div>`;
        }
        
        if (result.data.usability.cons && result.data.usability.cons.length > 0) {
          const firstCon = result.data.usability.cons[0];
          consText = `<div class="suggestion-cons">👎 ${firstCon}</div>`;
        }
        
        if (prosText || consText) {
          prosConsHTML = `<div class="suggestion-pros-cons">${prosText}${consText}</div>`;
        }
      }
      
      item.innerHTML = `
        <div class="term-name">${result.term}</div>
        <div class="term-description">${result.data.description.substring(0, 70)}${result.data.description.length > 70 ? '...' : ''}</div>
        ${prosConsHTML}
      `;
      
      item.addEventListener('click', () => {
        selectTerm(result.term, result.data);
        hideSuggestions();
      });

      searchSuggestions.appendChild(item);
    });

    searchSuggestions.style.display = 'block';
    selectedSuggestionIndex = -1;
  }

  // 候補を非表示
  function hideSuggestions() {
    searchSuggestions.style.display = 'none';
    selectedSuggestionIndex = -1;
  }

  // 用語を選択して詳細を表示
  function selectTerm(term, data) {
    termSearch.value = term;
    
    // 言語に応じたラベルを設定
    const labels = {
      ja: {
        pros: '👍 メリット:',
        cons: '👎 デメリット:',
        review: '💬 ユーザーの声:'
      },
      en: {
        pros: '👍 Pros:',
        cons: '👎 Cons:',
        review: '💬 User Review:'
      }
    };
    
    const currentLabels = labels[currentLanguage] || labels.ja;
    
    // メリット（pros）の表示を準備
    let prosHTML = '';
    if (data.usability && data.usability.pros && data.usability.pros.length > 0) {
      const prosItems = data.usability.pros.slice(0, 4).map(pro => `<li>${pro}</li>`).join('');
      prosHTML = `
        <div class="result-pros">
          <strong>${currentLabels.pros}</strong>
          <ul>${prosItems}</ul>
        </div>
      `;
    }
    
    // デメリット（cons）の表示を準備
    let consHTML = '';
    if (data.usability && data.usability.cons && data.usability.cons.length > 0) {
      const consItems = data.usability.cons.slice(0, 4).map(con => `<li>${con}</li>`).join('');
      consHTML = `
        <div class="result-cons">
          <strong>${currentLabels.cons}</strong>
          <ul>${consItems}</ul>
        </div>
      `;
    }
    
    // レビューの表示を準備
    let reviewHTML = '';
    if (data.usability && data.usability.reviews && data.usability.reviews.length > 0) {
      const firstReview = data.usability.reviews[0];
      reviewHTML = `
        <div class="result-review">
          <strong>${currentLabels.review}</strong>
          <div class="review-text">"${firstReview}"</div>
        </div>
      `;
    }
    
    searchResult.innerHTML = `
      <div class="result-term">${term}</div>
      <div class="result-name">${data.name}</div>
      <div class="result-description">${data.description}</div>
      ${prosHTML}
      ${consHTML}
      ${reviewHTML}
    `;
    
    searchResult.classList.add('show');
  }

  // キーボードナビゲーション
  function handleKeyNavigation(e) {
    const suggestions = searchSuggestions.querySelectorAll('.suggestion-item');
    
    if (suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        selectedSuggestionIndex = Math.min(selectedSuggestionIndex + 1, suggestions.length - 1);
        updateSuggestionSelection(suggestions);
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        selectedSuggestionIndex = Math.max(selectedSuggestionIndex - 1, -1);
        updateSuggestionSelection(suggestions);
        break;
        
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          suggestions[selectedSuggestionIndex].click();
        } else if (termSearch.value.trim()) {
          // 直接検索
          const results = searchTerms(termSearch.value);
          if (results.length > 0) {
            selectTerm(results[0].term, results[0].data);
            hideSuggestions();
          }
        }
        break;
        
      case 'Escape':
        hideSuggestions();
        break;
    }
  }

  // 候補の選択状態を更新
  function updateSuggestionSelection(suggestions) {
    suggestions.forEach((item, index) => {
      if (index === selectedSuggestionIndex) {
        item.classList.add('selected');
      } else {
        item.classList.remove('selected');
      }
    });
  }

  // 検索入力のイベントリスナー（デバウンス付き）
  let searchTimeout;
  termSearch.addEventListener('input', function(e) {
    const query = e.target.value.trim();
    
    // 前回のタイマーをクリア
    clearTimeout(searchTimeout);
    
    if (query.length >= 1) {
      // 200ms後に検索実行（デバウンス）
      searchTimeout = setTimeout(() => {
        showSuggestions(query);
      }, 200);
    } else {
      hideSuggestions();
      searchResult.classList.remove('show');
    }
  });

  // キーボードイベント
  termSearch.addEventListener('keydown', handleKeyNavigation);

  // 検索フィールド外をクリックしたら候補を非表示
  document.addEventListener('click', function(e) {
    if (!termSearch.contains(e.target) && !searchSuggestions.contains(e.target)) {
      hideSuggestions();
    }
  });



  // 初期化時に用語データを読み込み
  loadTermsData();
});