# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v0.1.0] — MVP リリース候補（タグ作成はユーザー判断）

### 提案タグメッセージ

```
v0.1.0 — lakkhanadi-catukka-analytics MVP

Coding Agent 向け四相分析 Skill の最初のリリース。
Claude Code skills と Codex CLI skills の両プラットフォームで動作する単一 SKILL.md と、
パーリ語表記の Rust 補助スクリプト（normalize.rs）、LLM-as-judge 評価プロンプト、
7 サンプルを同梱。
```

### Added

- `skills/lakkhanadi-catukka/SKILL.md` — 単一 Skill 本体プロンプト（フロントマター + 役割方針 + 入力種別判定 + Pali 正規化 + 長さモード + 安全性判定 + 古典/応用判定 + 四相生成チェックリスト + 出力テンプレート）
- `skills/lakkhanadi-catukka/agents/openai.yaml` — Codex CLI 用補助メタデータ（暗黙呼び出し抑止）
- `skills/lakkhanadi-catukka/scripts/normalize.rs` — パーリ語表記の Rust 補助スクリプト（既知異形 + IAST 揺れ吸収）
- `skills/lakkhanadi-catukka/tests/samples/*.md` × 7 — 評価用入力サンプル
- `skills/lakkhanadi-catukka/tests/judge/SKILL_JUDGE.md` — LLM-as-judge 8 観点判定プロンプト
- `skills/lakkhanadi-catukka/tests/judge/run.md` — judge 実行手順
- `skills/lakkhanadi-catukka/tests/judge/summary-template.md` — 集計テンプレート
- `skills/lakkhanadi-catukka/tests/judge/fixtures-bad/` — 故意違反サンプル群（自己テスト用）
- `Cargo.toml` — Rust crate 設定（標準ライブラリのみ）
- `docs/governance/adr_skill_platform.md` — プラットフォーム選定 ADR
- `docs/known-limitations.md` — 既知制限
- `docs/release/v0.1.0-checklist.md` — 全 31 TC リリース受け入れチェック
- `docs/tasks/.../verification/{claude-code,codex-cli}/README.md` — 実機検証手順テンプレート

### Changed

- 補助スクリプトの実装言語を **TypeScript → Rust** に変更（REQ-403 改訂）。`codd/codd.yaml` の `language` も `rust` へ更新。
- `docs/governance/adr_skill_platform.md` を新設し、配置パス差・暗黙呼び出し抑止フラグ・前処理フック非存在の調査結果を反映。

### Fixed

- 部分一致衝突回避のため `padatthana → padaṭṭhāna` ルールを `NORMALIZATION_RULES` に追加し、SKILL.md 内テーブルとも同期（TC-NORM-B01 対応）。

### Quality

- `cargo test`: 17 tests passed（整合性 7 + normalize 動作 10）
- `cargo fmt --check`: clean
- `cargo clippy --all-targets -- -D warnings`: clean

### Pending（リリース前にユーザー手動実行）

- TASK-0019: Claude Code skills 動作検証（実機）
- TASK-0020: Codex CLI skills 動作検証（実機）
- judge による 7 サンプル × 8 観点 = 56 判定（実機 LLM 推論）
- `docs/release/v0.1.0-checklist.md` の Must Have 25 件すべての ✅ 化
