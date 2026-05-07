# lakkhanadi-catukka-analytics-requirements コンテキストノート

**作成日**: 2026-05-05
**情報源**: README.md, spec.md, docs/requirements/requirements.md, codd/codd.yaml, lakkhanadi-catukka-example.ncl

## プロジェクト概要

- **名称**: lakkhanadi-catukka-analytics
- **目的**: 上座部アビダンマの四相分析（lakkhaṇa / rasa / paccupaṭṭhāna / padaṭṭhāna）を行う **Coding Agent 向けの Codex skill** を開発する
- **現状**: 既存の ChatGPT GPTs プロンプトを移植元として保有。codd によるドキュメント駆動開発が初期化済み

## 技術スタック

- **言語**: TypeScript（codd/codd.yaml 宣言）
- **ターゲット**: Codex skill（Coding Agent skill 形式での配布）
- **AI 実行**: `claude --print --model claude-opus-4-6 --tools ""`
- **フレームワーク**: なし（codd で `frameworks: []`）

## モジュール構成（codd 由来）

| モジュール | 責務 |
|---|---|
| `prompt` | Skill 全体の指示 / 役割 / 方針を保持 |
| `analyzer` | 四相分析の中核。各項目の生成ロジック |
| `formatter` | 出力テンプレート（要約表 + 詳説 + まとめ）への整形 |
| `normalizer` | パーリ語表記の正規化（padahāna→padaṭṭhāna 等） |

## 既存ドキュメント

- `README.md`: プロジェクト 1 行説明
- `spec.md`: PRD（GPTs 設定の写し）。`docs/requirements/requirements.md` と同内容
- `docs/requirements/requirements.md`: Codd ノード `req:lakkhanadi-catukka-analytics-requirements`（status: approved, confidence: 0.95）
- `lakkhanadi-catukka-example.ncl`: 四相分析の構造化リファレンス（Nickel Lang）。Visuddhimagga / Atthasālinī の四相記述を Skill 機械的参照向けに再構造化したもの。代表 5 例を収録。逐語転写ではないため license 上クリーン
- `codd/codd.yaml`: 設計文書のウェーブ構成と各モジュールの規約（リリースブロッカー条件）

## 開発ルール / 規約（codd 由来 リリースブロッカー）

1. 出力は「対象言い換え + 要約表 + 詳説 4 セクション + まとめ」を必ず含む
2. 各詳説は最低 3〜5 文、具体例と対比的観点を含む
3. パーリ語表記の既知の異形は正規化してから分析する
4. 仏教教義として確認できない応用は「応用的分析」と明示する
5. 医療・法律・宗教の権威として断定しない
6. 接続語（つまり、たとえば、ここで重要なのは）で読みやすさを担保する
7. paccupaṭṭhāna と padaṭṭhāna は身体感覚 / 思考・感情 / 世界の見え方の多面で記述する
8. padaṭṭhāna は近接条件（根本原因ではない）を非難しない観察的トーンで記述する
9. 長さ適応（短/通常/詳細）の切替えロジックを実装する
10. **Codex skill として実装する**（GPTs 形式ではない）

## 注意事項 / 既知の論点

- Skill のホスト（ローカル / Codex CLI / Claude Code skills など）は未確定
- 配布形態（npm / リポジトリ / 単独 markdown）も未確定
- テスト戦略（プロンプト出力の評価方法）は要設計
- 入力長 / 多言語対応 / 出力言語の方針は未明示
- lakkhanadi-catukka-example.ncl の参照を Skill 実行時に行うか否かは未決定

## 関連ファイル

- 移植元プロンプト: `docs/requirements/requirements.md`, `spec.md`
- 構造化リファレンス: `lakkhanadi-catukka-example.ncl`
- 開発ワークフロー設定: `codd/codd.yaml`
