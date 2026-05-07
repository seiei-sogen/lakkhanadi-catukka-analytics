# lakkhanadi-catukka-analytics-requirements データフロー図

**作成日**: 2026-05-05
**関連アーキテクチャ**: [architecture.md](architecture.md)
**関連要件定義**: [requirements.md](../../spec/lakkhanadi-catukka-analytics-requirements/requirements.md)

**【信頼性レベル凡例】**:
- 🔵 **青信号**: EARS要件定義書・設計文書・ユーザヒアリングを参考にした確実なフロー
- 🟡 **黄信号**: EARS要件定義書・設計文書・ユーザヒアリングから妥当な推測によるフロー
- 🔴 **赤信号**: EARS要件定義書・設計文書・ユーザヒアリングにない推測によるフロー

---

## システム全体のデータフロー 🔵

**信頼性**: 🔵 *requirements.md・user-stories.md・architecture.md より*

```mermaid
flowchart TD
    U[ユーザー入力<br/>テキスト] --> H{Skill ホスト<br/>Claude Code / Codex CLI}
    H -->|前処理フックあり| N1[Rust 補助<br/>scripts/normalize.rs]
    H -->|前処理フックなし| S
    N1 --> S[SKILL.md<br/>プロンプト]
    S --> A1{入力種別判定}

    A1 -->|空・空白のみ| E1[EDGE-001<br/>分析対象を促す]
    A1 -->|意味不明文字列| E2[EDGE-002<br/>言い換えを促す]
    A1 -->|超長文| E3[EDGE-003<br/>要点要約を促す]
    A1 -->|複数対象| E4[EDGE-004<br/>1 対象を選定]
    A1 -->|通常入力| L[長さモード判定]

    L -->|短くシグナル| LS[短縮モード]
    L -->|詳しくシグナル| LD[詳細モード]
    L -->|シグナルなし| LN[通常モード]

    LS & LD & LN --> NM[Pali 正規化<br/>テーブル適用]
    NM --> SF{安全性判定}

    SF -->|医療・法律・宗教<br/>他者評価| W[警告挿入 + 観察的捉え直し]
    SF -->|通常| C{古典 vs 応用判定<br/>LLM 自身の判断}

    W --> C
    C -->|古典明示| AN1[応用マーカーなし]
    C -->|非古典| AN2[応用マーカー付与]

    AN1 & AN2 --> G[四相生成<br/>lakkhaṇa/rasa/<br/>paccupaṭṭhāna/padaṭṭhāna]
    G --> F[整形<br/>言い換え→要約表→詳説→まとめ]
    F --> O[日本語出力]

    E1 & E2 & E3 & E4 --> O
    O --> U2[ユーザー]
```

## 主要機能のデータフロー

### フロー 1: 古典トピックの正統な四相分析（通常モード） 🔵

**信頼性**: 🔵 *user-stories.md ストーリー1.1・TC-CORE-01・TC-MARK-01 より*

**関連要件**: REQ-001〜010, REQ-103, REQ-104

```mermaid
sequenceDiagram
    participant U as ユーザー
    participant H as Skill ホスト
    participant N as Rust 正規化（任意）
    participant L as LLM (SKILL.md)

    U->>H: 「pathavī-dhātu の四相分析をして」
    H->>N: 入力転送（フックあり時）
    N-->>H: 入力（既に標準表記なので変更なし）
    H->>L: 正規化済み入力 + SKILL.md
    L->>L: 入力種別: 通常入力
    L->>L: 長さシグナル判定: なし → 通常モード
    L->>L: 安全性判定: 通常
    L->>L: 古典判定: 古典明示 → マーカーなし
    L->>L: 4 相生成（特相: 硬さ / 作用: 共生物質の基盤 /<br/>現れ方: 受け取り / 近因: 残り三大）
    L->>L: 整形（要約表 + 各 3〜5 文の詳説 + まとめ）
    L-->>H: 日本語出力
    H-->>U: 表示
```

**詳細ステップ**:
1. ユーザーが Skill を明示呼び出し（REQ-409）
2. Skill ホストが入力を SKILL.md に渡す（前処理フックがあれば Rust 正規化を経由）
3. SKILL.md は入力種別を判定（空 / 意味不明 / 超長文 / 複数 / 通常）→ 通常入力と判定
4. 長さシグナルを検出（「短く」「詳しく」「具体的に」「納得感」等のキーワード）→ なし → 通常モード
5. 安全性判定（医療診断・宗教断定・他者評価）→ 通常
6. 古典トピック判定（LLM の知識による）→ 古典明示 → 応用マーカーなし
7. 4 相生成 → 整形 → 日本語で出力

### フロー 2: 心理現象の応用的四相分析 🔵

**信頼性**: 🔵 *user-stories.md ストーリー1.2・TC-CORE-02・TC-MARK-02 より*

**関連要件**: REQ-001〜010, REQ-105, REQ-009, NFR-203

```mermaid
sequenceDiagram
    participant U as ユーザー
    participant L as LLM (SKILL.md)

    U->>L: 「最近の漠然とした焦りを四相分析して」
    L->>L: 通常入力 → 通常モード
    L->>L: 安全性: 通常（自己観察、診断要求でない）
    L->>L: 古典判定: 「焦り」は古典に明示なし → 応用マーカー付与
    L->>L: 4 相生成
    Note over L: paccupaṭṭhāna は<br/>身体感覚 / 思考・感情 / 世界の見え方<br/>を網羅
    Note over L: padaṭṭhāna は<br/>近接条件（締切・比較・身体疲労）<br/>を非難しないトーンで
    L-->>U: 「四相分析の枠組みを応用すると...」<br/>+ 4 相分析
```

### フロー 3: 短縮モード（要約表中心） 🔵

**信頼性**: 🔵 *user-stories.md ストーリー2.1・TC-LEN-01 より*

**関連要件**: REQ-101, EDGE-101

```mermaid
flowchart LR
    I[入力: 「忙しいので<br/>短く嫉妬を分析して」] --> D{シグナル検出}
    D -->|短く / 簡潔に| S[短縮モード]
    S --> A[要約表 4 行を必ず出力]
    A --> B[詳説は省略<br/>または 1〜2 文に圧縮]
    B --> M[一言まとめは 1 文]
    M --> O[出力]
```

**境界条件**: 詳説は最低 3 文ルール（EDGE-101）と短縮シグナルが競合する場合、要約表のみ完全 + 詳説省略をデフォルトとする（REQ-101 を優先）

### フロー 4: 詳細モード 🔵

**信頼性**: 🔵 *user-stories.md ストーリー2.2・TC-LEN-02 より*

**関連要件**: REQ-102, EDGE-101

```mermaid
flowchart LR
    I[入力: 「詳しく、<br/>納得感ある感じで分析」] --> D{シグナル検出}
    D -->|詳しく / 納得感 / 具体的| DT[詳細モード]
    DT --> A[各セクション 5〜8 文]
    A --> B[対比的観点を増やす]
    B --> C[具体例を複数]
    C --> O[出力]
```

### フロー 5: Pali 表記正規化 🔵

**信頼性**: 🔵 *user-stories.md ストーリー3.1, 3.2・TC-NORM-01〜03・設計ヒアリングQ3 より*

**関連要件**: REQ-107, REQ-108

```mermaid
flowchart TD
    I[入力テキスト] --> H{ホスト前処理<br/>フックあり?}
    H -->|あり| TS[Rust 正規化スクリプト実行]
    H -->|なし| MD[SKILL.md 内テーブルで正規化]

    TS --> R1[正規化規則:<br/>padahāna → padaṭṭhāna<br/>paccupahāna → paccupaṭṭhāna<br/>lakkhana → lakkhaṇa<br/>thana → ṭhāna<br/>... 既知異形 + IAST]
    MD --> R1

    R1 --> N{極端な崩れか?}
    N -->|軽微な崩れ| OK[標準表記に正規化]
    N -->|極端な崩れ<br/>例: padaaaaana| FB[「不明な表記」として扱う]

    OK --> S[SKILL.md 本体処理へ]
    FB --> S
```

**備考**:
- 二段冗長: Rust スクリプトが利用できない環境（Claude Code skill / Codex CLI で前処理フックを持たない場合）でも、SKILL.md 内テーブルにより同等の正規化が LLM 自身で行われる
- 「推測まで」（極端に崩れた表記の自動修正）は採用しない（ヒアリングRound 3）

### フロー 6: 警告 + 観察的捉え直し 🔵

**信頼性**: 🔵 *user-stories.md ストーリー4.1・TC-SAFE-01〜03・REQ-106 より*

**関連要件**: REQ-106, REQ-201, REQ-405, REQ-407

```mermaid
sequenceDiagram
    participant U as ユーザー
    participant L as LLM (SKILL.md)

    U->>L: 「私は鬱なのか四相分析して」
    L->>L: 安全性判定: 医療診断要求 → 警告フロー
    L-->>U: 冒頭警告: 「医療・法律・宗教の権威として<br/>断定はできません」
    L->>L: 対象捉え直し: 「鬱」→「いま感じている<br/>重さ・エネルギーの低下」
    L->>L: 観察可能な現象として 4 相生成
    Note over L: 4 セクションは観察的<br/>非難しない口調で記述
    L->>L: 末尾: 専門家への相談を促す<br/>（REQ-201）
    L-->>U: 警告 + 4 相分析 + 専門家相談促進
```

**他者評価の場合**: 「あの人の性格を分析して」→ 他者人格判定を避け、ユーザーが感じる「避けたさ」「怒り」等に対象を捉え直す（TC-SAFE-02）

### フロー 7: LLM-as-judge 品質評価 🔵

**信頼性**: 🔵 *NFR-302・user-stories.md ストーリー5.3・設計ヒアリングQ4 より*

**関連要件**: NFR-302, TC-NFR-302-01, TC-NFR-302-02

```mermaid
sequenceDiagram
    participant Dev as 開発者
    participant Sample as tests/samples/*.md
    participant Skill as SKILL.md
    participant Judge as SKILL_JUDGE.md
    participant LLM as LLM

    Dev->>Sample: 入力サンプルを選択
    Sample->>Skill: 入力としてセット
    Skill->>LLM: 推論実行
    LLM-->>Skill: 四相分析出力
    Skill->>Judge: 出力 + 入力をペアで渡す
    Judge->>LLM: 判定実行
    LLM-->>Judge: 8 観点判定結果<br/>（4 セクション網羅 / 文数 /<br/>具体例 / 現代語併記 /<br/>観察トーン / 応用マーカー /<br/>要約表 4 行 / 警告捕え直し）
    Judge-->>Dev: 違反レポート
```

## データ処理パターン

### 同期処理 🔵

**信頼性**: 🔵 *Skill 特性より*

- すべての主要処理は LLM の単一推論内で完結する同期処理
- 入力 → 推論 → 出力の単一パス（NFR-101 ステートレス）

### 非同期処理 🔵

**信頼性**: 🔵 *Skill 特性より*

- 該当なし。Skill 内に非同期処理は存在しない
- 並列・キューイングは Skill ホスト側の責務

### バッチ処理 🟡

**信頼性**: 🟡 *NFR-302 から妥当な推測*

- judge による品質評価は複数サンプルに対するバッチとして手動実行可能
- CI 自動実行は MVP スコープ外

## エラーハンドリングフロー 🔵

**信頼性**: 🔵 *EDGE-001〜004・受け入れ基準より*

```mermaid
flowchart TD
    I[ユーザー入力] --> CK{入力チェック}

    CK -->|空・空白のみ| E1[EDGE-001<br/>「分析対象を入力してください」]
    CK -->|意味不明文字列| E2[EDGE-002<br/>「対象として扱える事象がない」<br/>言い換えを促す]
    CK -->|context 上限超過| E3[EDGE-003<br/>「要点を要約してください」<br/>または最初の N 文字で打ち切り]
    CK -->|複数対象並列| E4[EDGE-004<br/>「中心的な 1 対象を選択」<br/>他は対象外と明示]
    CK -->|正常入力| OK[通常フローへ]

    E1 & E2 --> NoAnalysis[4 セクションを生成しない<br/>促しメッセージのみ]
    E3 & E4 --> Continue[選定後、通常フローへ]
```

**重要原則**: EDGE-001, EDGE-002 では「4 セクションの空虚な分析」を生成しない（受け入れ基準 TC-CORE-E01, TC-CORE-E02）

## 状態管理フロー

### Skill 内状態 🔵

**信頼性**: 🔵 *NFR-101・REQ-403・Skill 特性より*

```mermaid
stateDiagram-v2
    [*] --> 待機
    待機 --> 入力受付: ユーザー明示呼び出し
    入力受付 --> 入力検証
    入力検証 --> エラー応答: 不正入力（EDGE-001/002）
    入力検証 --> 処理中: 正常入力
    処理中 --> 出力生成
    出力生成 --> 完了
    エラー応答 --> 完了
    完了 --> [*]: ステートリセット
```

**特性**:
- ステートレス（NFR-101）: 各呼び出しは独立、前回入力の記憶なし
- セッション概念なし: ユーザーごとの設定保存なし

## データ整合性の保証 🔵

**信頼性**: 🔵 *REQ-001〜010・codd Wave 1 リリースブロッカーより*

- **構造的整合性**: 4 セクション欠落不可（formatter モジュールが固定テンプレートで担保）
- **教義的整合性**: 古典に明示されない内容には応用マーカー必須（REQ-105、analyzer モジュールが LLM 判断で担保）
- **トーン整合性**: 観察的・非難しない口調（NFR-203、prompt モジュールが指示で担保）
- **表記整合性**: パーリ語標準表記（normalizer モジュール、Rust スクリプト + プロンプト内テーブルの二段冗長）
- **judge 検証**: NFR-302 によりこれらすべての整合性をサンプル評価で確認

## 関連文書

- **アーキテクチャ**: [architecture.md](architecture.md)
- **型定義**: [interfaces.ts](interfaces.ts)
- **ヒアリング記録**: [design-interview.md](design-interview.md)
- **要件定義**: [requirements.md](../../spec/lakkhanadi-catukka-analytics-requirements/requirements.md)

## 信頼性レベルサマリー

- 🔵 青信号: 14 件 (93.3%)
- 🟡 黄信号: 1 件 (6.7%)
- 🔴 赤信号: 0 件 (0.0%)

**品質評価**: 高品質
- すべての主要フローが受け入れ基準（TC-XXX）に対応
- 🟡 はバッチ処理の MVP 範囲外推測のみ
