# lakkhanadi-catukka-analytics-requirements タスク概要

**作成日**: 2026-05-07
**プロジェクト期間**: 約 20 営業日（1 ヶ月以内）
**推定工数**: 160 時間
**総タスク数**: 21 件

## 関連文書

- **要件定義書**: [📋 requirements.md](../../spec/lakkhanadi-catukka-analytics-requirements/requirements.md)
- **ヒアリング記録**: [💬 interview-record.md](../../spec/lakkhanadi-catukka-analytics-requirements/interview-record.md)
- **ユーザストーリー**: [📖 user-stories.md](../../spec/lakkhanadi-catukka-analytics-requirements/user-stories.md)
- **受け入れ基準**: [✅ acceptance-criteria.md](../../spec/lakkhanadi-catukka-analytics-requirements/acceptance-criteria.md)
- **コンテキストノート**: [📝 note.md](../../spec/lakkhanadi-catukka-analytics-requirements/note.md)
- **準備タスク**: [🔧 prep.md](../../spec/lakkhanadi-catukka-analytics-requirements/prep.md)
- **アーキテクチャ設計**: [📐 architecture.md](../../design/lakkhanadi-catukka-analytics-requirements/architecture.md)
- **データフロー図**: [🔄 dataflow.md](../../design/lakkhanadi-catukka-analytics-requirements/dataflow.md)
- **インターフェース定義**: [📝 interfaces.ts](../../design/lakkhanadi-catukka-analytics-requirements/interfaces.ts)
- **設計ヒアリング**: [💬 design-interview.md](../../design/lakkhanadi-catukka-analytics-requirements/design-interview.md)
- **PRD（移植元プロンプト）**: [📋 requirements.md](../../requirements/requirements.md)
- **構造化リファレンス**: [📚 lakkhanadi-catukka-example.ncl](../../../lakkhanadi-catukka-example.ncl)
- **codd 設定**: [⚙ codd.yaml](../../../codd/codd.yaml)

## フェーズ構成

| フェーズ | 期間 | 成果物 | タスク数 | 工数 | ファイル |
|---------|------|--------|----------|------|----------|
| Phase 1 | 〜3 日 | リポジトリ整備・Rust 環境・ADR 更新 | 3 | 16h | [TASK-0001〜0003](#phase-1-基盤構築) |
| Phase 2 | 〜9 日 | SKILL.md 本体（フロントマター〜出力テンプレート） | 9 | 72h | [TASK-0004〜0012](#phase-2-skill-本体プロンプト) |
| Phase 3 | 〜4 日 | normalize.rs + テスト入力サンプル | 4 | 32h | [TASK-0013〜0016](#phase-3-補助スクリプトとテストデータ) |
| Phase 4 | 〜5 日 | LLM-as-judge + プラットフォーム検証 + リリース準備 | 5 | 40h | [TASK-0017〜0021](#phase-4-llm-as-judge-と検証) |

## タスク番号管理

**使用済みタスク番号**: TASK-0001 〜 TASK-0021
**次回開始番号**: TASK-0022

## 全体進捗

- [ ] Phase 1: 基盤構築
- [x] Phase 2: Skill 本体プロンプト
- [ ] Phase 3: 補助スクリプトとテストデータ
- [ ] Phase 4: LLM-as-judge と検証

## マイルストーン

- **M1: 基盤完成**: ディレクトリ構造・Rust 環境・ADR 更新完了（TASK-0001〜0003）
- **M2: SKILL.md 完成**: 統合済み SKILL.md が確定し judge 評価で全 7 サンプルが pass（TASK-0004〜0012）
- **M3: 補助スクリプト完成**: normalize.rs と単体テスト・テスト入力サンプル一式（TASK-0013〜0016）
- **M4: MVP リリース準備完了**: 両プラットフォーム動作確認・受け入れ基準 Must Have 25 件 pass・README 整備（TASK-0017〜0021）

---

## Phase 1: 基盤構築

**期間**: 約 3 日（16h）
**目標**: skill ディレクトリ構造・Rust 開発環境・両プラットフォーム ADR の確定
**成果物**: `skills/lakkhanadi-catukka/` 下のディレクトリ・Cargo.toml・更新された ADR

### タスク一覧

- [x] [TASK-0001: プロジェクトディレクトリ構造とリポジトリ整備](TASK-0001.md) - 4h (DIRECT) 🔵
- [x] [TASK-0002: Rust ビルド/テスト環境セットアップ](TASK-0002.md) - 4h (DIRECT) 🔵
- [x] [TASK-0003: Skill フロントマター仕様調査と ADR 更新](TASK-0003.md) - 8h (DIRECT) 🟡

### 依存関係

```
TASK-0001 → TASK-0002
TASK-0001 → TASK-0003
```

---

## Phase 2: Skill 本体プロンプト

**期間**: 約 9 日（72h）
**目標**: SKILL.md の各セクションを TDD で構築し統合する
**成果物**: 統合済み `skills/lakkhanadi-catukka/SKILL.md`

### タスク一覧

- [x] [TASK-0004: SKILL.md フロントマター + 役割・方針セクション](TASK-0004.md) - 8h (TDD) 🔵
- [x] [TASK-0005: SKILL.md 出力テンプレート定義](TASK-0005.md) - 8h (TDD) 🔵
- [x] [TASK-0006: SKILL.md 入力種別判定 + Edge ケース処理](TASK-0006.md) - 8h (TDD) 🟡
- [x] [TASK-0007: SKILL.md 長さモード自動判定](TASK-0007.md) - 8h (TDD) 🔵
- [x] [TASK-0008: SKILL.md 安全性判定 + 警告 + 観察的捉え直し](TASK-0008.md) - 8h (TDD) 🔵
- [x] [TASK-0009: SKILL.md 古典 vs 応用判定](TASK-0009.md) - 8h (TDD) 🔵
- [x] [TASK-0010: SKILL.md Pali 正規化テーブル（フォールバック）](TASK-0010.md) - 8h (TDD) 🔵
- [x] [TASK-0011: SKILL.md 四相生成チェックリスト + 観点網羅指示](TASK-0011.md) - 8h (TDD) 🔵
- [x] [TASK-0012: SKILL.md 統合と整合性レビュー](TASK-0012.md) - 8h (TDD) 🟡

### 依存関係

```
TASK-0001 ──→ TASK-0004 ──→ TASK-0005 ──┐
                ↓                       │
              TASK-0006 ─→ TASK-0007 ───┤
                ↓                       │
              TASK-0006 ─→ TASK-0008 ───┤
                ↓                       │
              TASK-0006 ─→ TASK-0009 ───┤
                ↓                       │
              TASK-0006 ─→ TASK-0010 ───┤
                                        ↓
                                   TASK-0011 ─→ TASK-0012
```

---

## Phase 3: 補助スクリプトとテストデータ

**期間**: 約 4 日（32h）
**目標**: 前処理用 Rust スクリプトと judge 評価用入力サンプルを揃える
**成果物**: `scripts/normalize.rs` + 単体テスト + `tests/samples/*.md` × 7

### タスク一覧

- [ ] [TASK-0013: normalize.rs ルール定義（既知異形 + IAST 揺れ）](TASK-0013.md) - 8h (TDD) 🔵
- [ ] [TASK-0014: normalize.rs 関数実装](TASK-0014.md) - 8h (TDD) 🔵
- [ ] [TASK-0015: normalize.rs 単体テスト実装](TASK-0015.md) - 8h (TDD) 🔵
- [ ] [TASK-0016: テスト入力サンプル作成](TASK-0016.md) - 8h (DIRECT) 🔵

### 依存関係

```
TASK-0002 → TASK-0013 → TASK-0014 → TASK-0015
TASK-0001 → TASK-0016
```

---

## Phase 4: LLM-as-judge と検証

**期間**: 約 5 日（40h）
**目標**: judge プロンプト + 両プラットフォーム動作検証 + 受け入れ基準全テスト + README 最終整備
**成果物**: `tests/judge/SKILL_JUDGE.md` + 検証ログ + 整備済み README + MVP リリース準備

### タスク一覧

- [ ] [TASK-0017: SKILL_JUDGE.md 8 観点判定プロンプト作成](TASK-0017.md) - 8h (TDD) 🔵
- [ ] [TASK-0018: judge 統合テスト・サンプル評価実施](TASK-0018.md) - 8h (TDD) 🔵
- [ ] [TASK-0019: Claude Code skills 動作検証](TASK-0019.md) - 8h (DIRECT) 🔵
- [ ] [TASK-0020: Codex CLI skills 動作検証](TASK-0020.md) - 8h (DIRECT) 🔵
- [ ] [TASK-0021: 受け入れ基準全テスト + README + リリース準備](TASK-0021.md) - 8h (DIRECT) 🔵

### 依存関係

```
TASK-0012 ──→ TASK-0017 ──→ TASK-0018 ──┐
                                        │
TASK-0012 ──→ TASK-0019 ────────────────┤
                                        ↓
TASK-0012 ──→ TASK-0020 ──────────→ TASK-0021
TASK-0015 ──→ TASK-0019/TASK-0020       ↑
TASK-0016 ──→ TASK-0018 ────────────────┘
```

---

## 信頼性レベルサマリー

### 全タスク統計（Phase 1〜4 合計）

- **総項目数**: 約 175 項目（21 タスク × 平均 8 項目）
- 🔵 **青信号**: 約 142 項目 (約 81%)
- 🟡 **黄信号**: 約 33 項目 (約 19%)
- 🔴 **赤信号**: 0 項目 (0%)

### フェーズ別信頼性（タスク数ベース）

| フェーズ | 🔵 主体 | 🟡 を含む | 合計 |
|---------|--------|----------|------|
| Phase 1 | 2 | 1 (TASK-0003 仕様流動性) | 3 |
| Phase 2 | 7 | 2 (TASK-0006, 0012) | 9 |
| Phase 3 | 4 | 0 | 4 |
| Phase 4 | 5 | 0 | 5 |

**品質評価**: 高品質
- 全タスクが requirements.md / acceptance-criteria.md / architecture.md / dataflow.md / interfaces.ts / lakkhanadi-catukka-example.ncl / codd.yaml のいずれかに直接根拠を持つ
- 🟡 は Codex CLI 仕様の流動性、ホスト前処理フックの実装裁量、統合段階で発生する競合解消、運用ログの保存方針など、要件定義側でも 🟡 とされている項目に集中

## クリティカルパス

```
TASK-0001 → TASK-0002 → TASK-0013 → TASK-0014 → TASK-0015 → TASK-0019/0020 → TASK-0021
TASK-0001 → TASK-0003 → TASK-0004 → TASK-0006 → TASK-0010 → TASK-0011 → TASK-0012 → TASK-0017 → TASK-0018 → TASK-0021
```

**クリティカルパス工数**: 約 80 時間（10 営業日）
**並行作業可能工数**: 約 80 時間（並行実行で短縮可能）

## 次のステップ

タスクを実装するには:
- 全タスク順番に実装: `/tsumiki:kairo-implement`
- 特定タスクを実装: `/tsumiki:kairo-implement TASK-0005` のように指定
- 推奨開始: TASK-0001（前提タスクなし、4h、DIRECT）
