# lakkhanadi-catukka-analytics-requirements 設計ヒアリング記録

**作成日**: 2026-05-05
**追記日**: 2026-05-06（型定義設計ラウンド Q5〜Q8）
**ヒアリング実施**: step4 既存情報ベースの差分ヒアリング（2 ラウンド）

## ヒアリング目的

### Round A（2026-05-05）: 設計フェーズ初期の意思決定

要件定義（`docs/spec/lakkhanadi-catukka-analytics-requirements/`）とヒアリング記録（`interview-record.md` / 4 ラウンド計 15 問）から把握できる事項のうち、**設計フェーズで明示する必要がある以下の 4 領域**について、追加ヒアリングを実施した。

- Skill 用 YAML フロントマター戦略（Claude Code skills と Codex CLI skills の差分吸収）
- 「閾値ベースの応用的分析判定」の具体実装（古典 vs 応用の判定方式）
- LLM-as-judge の品質チェックリスト粒度（判定観点の確定）
- Pali 表記正規化の実装場所（プロンプト vs TS 補助スクリプト）

これらは元のヒアリング記録の「残課題」セクションで明示されていた項目であり、設計フェーズで決定する必要があった。

### Round B（2026-05-06）: 型定義設計の意思決定

Round A で決定した「TS 補助スクリプトで事前正規化」「judge 8 観点」の実装方針を `interfaces.ts` に落とし込むため、以下の 4 領域について追加ヒアリングを実施した。

- normalize.ts の公開関数シグネチャ（単純関数 vs レポート付き vs クラス）
- 極端に崩れた表記の振る舞い（TC-NORM-B01 への対応方針）
- LLM-as-judge の出力フォーマット（JSON / Markdown / ハイブリッド）
- 長さモードと出力型の付き合わせ方（Discriminated Union vs 単一型 + enum）

Round B の成果は `interfaces.ts` に直接反映されている。

---

## 質問と回答

### Q1: Skill フロントマター戦略

**質問日時**: 2026-05-05
**カテゴリ**: アーキテクチャ / 配布
**背景**: REQ-402 で Claude Code skills と Codex CLI skills の両プラットフォーム対応が確定しているが、両者の YAML フロントマター仕様が異なる可能性があり、SKILL.md を 1 ファイルでカバーするか、シンボリックリンクで分けるかが未決定だった。これは NFR-301（skills/ 下集約）の具体実装に直結する。

**選択肢**:
1. 単一 SKILL.md で両者をカバー（推奨）
2. 共通本体 + シンボリックリンクで差分吸収
3. 仕様は現状使えそうな読み取り項目のみ、詳細は出力テンプレートで調整

**回答**: **単一 SKILL.md で両者をカバー（推奨）**

**信頼性への影響**:
- アーキテクチャ設計のディレクトリ構造（`skills/lakkhanadi-catukka/SKILL.md` 単一）が 🔵 で確定
- NFR-301 の実装方式が 🔵 に向上
- 設計フェーズの分岐リスクが消滅（実装フェーズで両 CLI のフロントマター差分を確認する作業が必要だが、設計上の前提は固定）

---

### Q2: 古典トピック判定方式

**質問日時**: 2026-05-05
**カテゴリ**: アナライザー / 応用マーカー判定
**背景**: REQ-104, REQ-105 と元のヒアリングQ2-4 で「閾値ベース自動」が選択されていたが、その「閾値」をどう実装するかが未定義だった。具体的には：
- 内蔵ホワイトリストを持つか（地水火風・五感の透明色・心所など明示）
- LLM 自身の知識による判断のみとするか
- lakkhanadi-catukka-example.ncl をプロンプトにインライン参照させて判定根拠とするか
の選択が必要だった。

**選択肢**:
1. 内蔵ホワイトリスト + LLM フォールバック
2. LLM の判断のみ
3. lakkhanadi-catukka-example.ncl を参照させて動的判断

**回答**: **LLM の判断のみ**

**信頼性への影響**:
- analyzer モジュール仕様が簡潔化: ホワイトリスト保守・lakkhanadi-catukka-example.ncl 参照ロジックは設計から除外
- プロンプトには「Visuddhimagga / Atthasālinī 等の上座部アビダンマ古典に四相が明示されているトピックか否かを LLM の知識で判定する」旨の指示のみ記述
- TC-MARK-01〜B01 の判定主体が LLM 側に固定 → judge プロンプトでは「マーカー付与の妥当性」を観点として追加（Q4 と整合）
- 🔴 → 🔵: REQ-104, REQ-105 の実装方針が確定

---

### Q3: Pali 表記正規化の実装場所

**質問日時**: 2026-05-05
**カテゴリ**: Normalizer モジュール / 実装形態
**背景**: REQ-403 で「TypeScript は補助スクリプトに留める」「主体はプロンプト・markdown」と決まっているが、normalizer の具体的な配置が未定だった。一方 REQ-408 で AI コマンドが `--tools ""` で起動するため、TS スクリプトを LLM が自発的に呼び出すことができない。「プロンプト内テーブル」「TS 前処理」「両方」のいずれを採るか確認が必要だった。

**選択肢**:
1. プロンプト内テーブルのみ
2. TS 補助スクリプトで事前正規化
3. テーブル + judge で検証

**回答**: **TS 補助スクリプトで事前正規化**

**信頼性への影響**:
- アーキテクチャ設計に `skills/lakkhanadi-catukka/scripts/normalize.ts` の配置が追加（🔵）
- 設計上のリスクとして特記: REQ-408 の制約により、Skill ホストの前処理フックが利用できない場合に TS スクリプトが呼ばれない可能性がある
- そのため二段冗長戦略を設計に組み込み: SKILL.md 内にも正規化テーブルを記載することで、ホスト前処理フックの有無に依存せず正規化が保証される（dataflow フロー 5）
- 🟡: TS スクリプトの呼び出しタイミング（前処理フック方式）は実装フェーズで両 CLI の仕様を確認する必要あり

---

### Q4: LLM-as-judge 品質チェックリスト粒度

**質問日時**: 2026-05-05
**カテゴリ**: テスト戦略 / NFR-302
**背景**: NFR-302 で LLM-as-judge を MVP に含めることが確定していたが、判定プロンプトが評価する観点の粒度が未定義だった。codd Wave 1〜4 のリリースブロッカー条件と PRD「良い分析の基準」をすべて拾うか、最重要のみに絞るかの選択が必要だった。

**選択肢**（複数選択）:
1. 4 セクション網羅 / 詳説文数 / 具体例 / 現代語併記 / 観察トーン / 応用マーカー（コア 6 項目）
2. 要約表 4 行検証
3. Pali 表記の正規化検証
4. 警告・捕え直しの検証

**回答**: **コア 6 項目 + 要約表 4 行検証 + 警告・捕え直しの検証**（Pali 正規化検証は除外）

**信頼性への影響**:
- judge プロンプトの判定項目が 8 観点に確定（🔵）:
  1. 4 セクション網羅
  2. 詳説文数（モード別）
  3. 具体例の有無
  4. 現代語併記
  5. 観察トーン
  6. 応用マーカーの適否
  7. 要約表 4 行構造
  8. 警告 + 捕え直しの実施
- Pali 正規化は judge 対象外 → TS 補助スクリプトの単体テストで担保される設計に変更（normalize.ts のテストファイル `tests/scripts/normalize.test.ts` 等を実装フェーズで検討）
- アーキテクチャ設計のテスト構成セクションが 🔵 で固定

---

---

### Q5: normalize.ts の公開関数シグネチャ

**質問日時**: 2026-05-06
**カテゴリ**: Normalizer 実装 / 型定義
**背景**: Round A Q3 で「TS 補助スクリプトで事前正規化」が決まったが、関数の公開シグネチャ（戻り値が文字列のみか、置換レポート付きか、クラスベースか）が未確定だった。これは `interfaces.ts` の核となる型のため、設計フェーズで確定が必要だった。

**選択肢**:
1. 単純関数 `normalize(input: string): string`（推奨）
2. 詳細レポート付き `normalize(input: string): { normalized: string; replacements: Replacement[] }`
3. `PaliNormalizer` クラスベース（拡張性重視）

**回答**: **単純関数 (推奨)**

**信頼性への影響**:
- `interfaces.ts` の `Normalize = (input: string) => string` 型が 🔵 で確定
- 外部呼び出しの単純さ・テスト容易性を優先
- 置換トレースが必要になった場合は将来的に拡張可能（後方互換を保ったまま `normalizeWithReport` を追加する余地あり）

---

### Q6: 極端に崩れた Pali 表記の振る舞い

**質問日時**: 2026-05-06
**カテゴリ**: Normalizer 実装 / Edge ケース対応
**背景**: 受け入れ基準 TC-NORM-B01「padaTthana」「padaaaaana」の扱いについて、Round A Q3 では「推測まで」を不採用としていたが、実際に検知した時のスクリプト側の振る舞いが具体化されていなかった（変換せず通すか、警告を返すか、エラーを投げるか）。

**選択肢**:
1. スルーして LLM に委ねる（推奨）— 既知異形・IAST 揺れのみ変換、それ以外はそのまま通し SKILL.md 側で `unknown_term` 扱い
2. 警告付きで返す — `warnings` 配列に記録して呼び出し側に伝える
3. エラーを投げる — ホスト側でハンドリングを強制

**回答**: **スルーして LLM に委ねる (推奨)**

**信頼性への影響**:
- `Normalize` 型の戻り値が `string` 単一で済むことが確定（Q5 と整合）
- 二段冗長戦略（dataflow.md フロー 5）が強化: TS スクリプトは「軽量変換器」、LLM は「文脈解釈者」と責務分離
- TC-NORM-B01 の期待結果「標準表記に近いものは正規化、極端な崩れは『不明な表記』として扱う」が SKILL.md 側で実現されることが 🔵 で確定
- normalize.ts の実装スコープが極小化（既知リストの map 適用のみ）

---

### Q7: LLM-as-judge の出力フォーマット

**質問日時**: 2026-05-06
**カテゴリ**: テスト戦略 / NFR-302 出力仕様
**背景**: Round A Q4 で「8 観点の品質チェックリスト」が決まったが、judge プロンプトが返すフォーマットが未確定だった。CI 集計可能性（JSON）と人間可読性（Markdown）のトレードオフがあり、`interfaces.ts` で型化するために選択が必要だった。

**選択肢**:
1. JSON 構造化出力（推奨）— 型定義が安定し、CI・スクリプト集計が可能
2. Markdown レポート — 人間可読だがスクリプト集計しにくい
3. ハイブリッド — 先頭に JSON サマリ、本文に Markdown 詳細

**回答**: **JSON 構造化出力 (推奨)**

**信頼性への影響**:
- `interfaces.ts` の `JudgeReport` / `JudgeAspectResult` 型が 🔵 で確定
- judge プロンプト本文（`SKILL_JUDGE.md`）には JSON スキーマと「JSON ブロックのみで返答すること」の指示を含める方針が固定
- 将来的な集計レポート（複数サンプルを跨いだ違反観点別統計）の実現が容易
- CI 自動化への移行（MVP 後）が型レベルで担保される

---

### Q8: 長さモードと出力型の付き合わせ方

**質問日時**: 2026-05-06
**カテゴリ**: 型設計 / モード切り替え
**背景**: REQ-101〜103 で「短縮 / 通常 / 詳細」の 3 モードがあり、各モードで詳説セクションの文数制約が異なる（short: 1〜2 / normal: 3〜5 / detailed: 5〜8）。これを TS 型でどこまで表現するかの方針が未定だった。

**選択肢**:
1. Discriminated Union（推奨）— `AnalysisOutput = ShortOutput | NormalOutput | DetailedOutput`、`mode` で判別
2. 単一型 + mode enum — 共通型に `mode: LengthMode` フィールドのみ持たせる
3. 型を作らない — Markdown 文字列のみ扱い、enum だけ定義

**回答**: **Discriminated Union (推奨)**

**信頼性への影響**:
- `interfaces.ts` の `AnalysisOutput` が 3 つのサブ型のユニオンとして 🔵 で確定
- 各モード固有の詳説制約（short: 0 件 or 4 件×1〜2 文 等）をコメントで明示し、judge 側でも `expectedMode` を検証可能
- LLM 出力 Markdown を直接型付けするわけではなく「概念モデル」として共有する位置づけが明確化
- `LENGTH_MODE_SENTENCE_RANGE` 定数と組み合わせて、モード境界（EDGE-101: 3〜8 文）の検証ロジックの基盤になる

---

## ヒアリング結果サマリー

### 確認できた事項（Round A + B 統合）

**Round A**:
- SKILL.md は単一ファイルで両プラットフォームをカバーする
- 古典 vs 応用の判定はホワイトリスト不保有・LLM の知識のみで判定する
- Pali 正規化は TS 補助スクリプトで事前正規化、SKILL.md 内テーブルで二段冗長を確保する
- judge は 8 観点を MVP に含む（Pali 正規化検証は対象外）

**Round B**:
- normalize.ts は単純関数 `(input: string) => string` で公開する
- 極端に崩れた Pali 表記は変換せず素通しし、SKILL.md 側で `unknown_term` として扱う
- judge は JSON 構造化出力で返却する（`JudgeReport` 型）
- 長さモードは Discriminated Union（`ShortAnalysisOutput` / `NormalAnalysisOutput` / `DetailedAnalysisOutput`）で表現する

### 設計方針の決定事項

- **アーキテクチャ**: Prompt-Driven Skill Architecture（プロンプト主体・TS 補助）
- **配置**: `skills/lakkhanadi-catukka/` に集約、`SKILL.md` / `scripts/` / `tests/` / `reference/` のサブ構造
- **古典判定**: LLM 判断、プロンプトには判定基準のみ記述
- **正規化二段冗長**: ホスト前処理フックがある環境では TS スクリプト（軽量変換器）、無い環境では SKILL.md 内テーブル（文脈解釈フォールバック）
- **判定プロンプト構成**: 8 観点の品質チェックリスト + JSON 構造化出力
- **型定義方針**: 主要型を Discriminated Union で表現し、LLM 出力 Markdown を概念モデルとして共有

### 残課題

- TS 補助スクリプト（normalize.ts）の Skill ホストからの呼び出し方法 — 実装フェーズで Claude Code skills と Codex CLI skills の前処理フック仕様を確認する必要あり
- judge プロンプトの実行方法（手動 / CI） — MVP 範囲では手動実行で開始、CI 化はリリース後の改善事項
- TS スクリプトの単体テスト方針 — 実装フェーズで決定（Vitest / 標準テスト等）
- judge プロンプトでの JSON コードブロック慣例 — 実装フェーズで具体的なフェンスとパース方針を確定

### 信頼性レベル分布

**Round A 前**（要件定義 + interview-record.md のみ）:
- 🔵 青信号: 27 件
- 🟡 黄信号: 6 件
- 🔴 赤信号: 0 件
- 設計フェーズで未確定だった領域: 4 領域（フロントマター戦略 / 古典判定 / 正規化実装 / judge 粒度）

**Round A 後**（architecture.md / dataflow.md ベース）:
- 🔵 青信号: 約 35 件 (+8)
- 🟡 黄信号: 約 4 件 (-2)
- 🔴 赤信号: 0 件 (±0)

**Round B 後**（4 設計文書統合 = architecture.md + dataflow.md + design-interview.md + interfaces.ts）:
- 🔵 青信号: 約 54 件 (+19、interfaces.ts 19 件分を加算)
- 🟡 黄信号: 約 7 件 (+3、メタ情報フィールドの妥当な推測)
- 🔴 赤信号: 0 件 (±0)
- 統合の信頼性割合: 🔵 約 89% / 🟡 約 11% / 🔴 0%

**品質評価**: 高品質。設計に必要な意思決定はすべて要件定義・既存ヒアリング・本設計ヒアリング Round A/B のいずれかに直接根拠を持つ。残った 🟡 は (1) スケーラビリティ・可用性の Skill 一般特性推測、(2) TS スクリプト呼び出し方式の実装フェーズ確認事項、(3) judge / 型定義のメタ情報フィールド（category, exampleCount, judgedAt 等）のみ。

## 関連文書

- **アーキテクチャ設計**: [architecture.md](architecture.md)
- **データフロー**: [dataflow.md](dataflow.md)
- **型定義**: [interfaces.ts](interfaces.ts)
- **要件定義**: [requirements.md](../../spec/lakkhanadi-catukka-analytics-requirements/requirements.md)
- **元のヒアリング記録**: [interview-record.md](../../spec/lakkhanadi-catukka-analytics-requirements/interview-record.md)
- **ユーザストーリー**: [user-stories.md](../../spec/lakkhanadi-catukka-analytics-requirements/user-stories.md)
- **受け入れ基準**: [acceptance-criteria.md](../../spec/lakkhanadi-catukka-analytics-requirements/acceptance-criteria.md)
