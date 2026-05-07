# ADR: Codex Skill Platform and Prompt Architecture

**ADR ID**: governance:adr-skill-platform
**ステータス**: Accepted（実装完了 — TASK-0004〜0021 で SKILL.md / agents/openai.yaml / 検証手順がすべて整備済。リリース前再確認は v0.1.0 タグ作成時）
**作成日**: 2026-05-05
**最終更新**: 2026-05-07（TASK-0003 で両プラットフォーム仕様を反映、TASK-0021 で実装完了ステータスに更新）
**関連要件**: REQ-401, REQ-402, REQ-403, REQ-409, NFR-301
**関連 codd ノード**: `governance:adr-skill-platform`（codd Wave 1）

---

## 文脈

`lakkhanadi-catukka-analytics` は Coding Agent 向けの Skill として配布する（GPTs 形式での再配布不可: REQ-401）。配布先は Claude Code skills と Codex CLI skills の両プラットフォーム（REQ-402）であり、明示呼び出しでのみ起動する設計が必要（REQ-409）。

両プラットフォームは "Open Agent Skills" 系の SKILL.md 仕様を共有しているが、フロントマター拡張・配置パス・暗黙呼び出しの抑止方法に差分がある。本 ADR は単一 SKILL.md で両プラットフォームをカバーするための戦略を確定する。

---

## 決定

1. **配布形態**: Coding Agent 向けの Skill として配布する。GPTs 形式は採用しない（REQ-401）。
2. **対応プラットフォーム**: Claude Code skills と Codex CLI skills の両方をサポートする（REQ-402）。
3. **集約方針**: 単一の `skills/lakkhanadi-catukka/SKILL.md` を正本とする（NFR-301、設計ヒアリングQ1）。プラットフォーム別の差分は補助メタデータファイル（`agents/openai.yaml` 等）で吸収し、SKILL.md 本体は分岐させない。
4. **明示呼び出し**: REQ-409 を満たすため、SKILL.md フロントマターと補助ファイルの両方で「明示呼び出しのみ起動」を有効化する。
5. **実装言語**: Skill 本体は Markdown プロンプト。補助スクリプト（Pali 表記正規化）は Rust で実装する（REQ-403）。

---

## 両プラットフォーム仕様サマリー（2026-05 時点）

> Codex CLI 仕様は流動性があるため、リリース直前に再確認すること（[残された不確実性](#残された不確実性)参照）。

### Claude Code skills

| 項目 | 内容 |
|---|---|
| 必須キー | `name`, `description` |
| 推奨キー | `disable-model-invocation`（`true` で明示呼び出し限定）、`allowed-tools`、`model`、`when_to_use` |
| 配置パス | `~/.claude/skills/<name>/SKILL.md`（個人）、`.claude/skills/<name>/SKILL.md`（プロジェクト）、`<plugin>/skills/<name>/SKILL.md`（プラグイン） |
| 補助スクリプト | `${CLAUDE_SKILL_DIR}` で参照可能。**前処理フック自動起動の機構は無し** — Skill 内から明示的に呼び出すパターンのみ |
| 明示呼び出し限定 | フロントマターで `disable-model-invocation: true` |

### Codex CLI skills

| 項目 | 内容 |
|---|---|
| 必須キー | `name`, `description` |
| 推奨キー | （SKILL.md 側は最小）。UI メタデータ・ポリシーは `agents/openai.yaml` で別管理 |
| 配置パス（bottom-up 探索） | `$CWD/.agents/skills/`、リポジトリ祖先の `.agents/skills/`、`$REPO_ROOT/.agents/skills/`、`$HOME/.agents/skills/`、`/etc/codex/skills/`、ビルトイン |
| 補助スクリプト | `scripts/`、`references/`、`assets/` を skill ディレクトリ内に配置可。**前処理フック自動起動の機構は公式仕様に明記なし** |
| 明示呼び出し限定 | `agents/openai.yaml` に `policy: allow_implicit_invocation: false` |

### 差分のまとめ

| 観点 | Claude Code | Codex CLI |
|---|---|---|
| 配置パス | `.claude/skills/<name>/` | `.agents/skills/<name>/` |
| 暗黙呼び出し抑止 | フロントマター `disable-model-invocation: true` | 補助ファイル `agents/openai.yaml` の `policy.allow_implicit_invocation: false` |
| 補助スクリプトの自動起動 | なし | なし |

---

## 共通フロントマター戦略

### 採用する SKILL.md フロントマター（単一ファイルで両対応）

```yaml
---
name: lakkhanadi-catukka
description: |
  上座部アビダンマの四相分析（lakkhaṇa／rasa／paccupaṭṭhāna／padaṭṭhāna）を
  日本語で実行する Skill。ユーザーが「四相分析」「lakkhanadi-catukka」
  「lakkhaṇa の分析」等を明示的に指定したときのみ起動する。一般的な
  コーディング・雑談・自動補完では起動しない。
disable-model-invocation: true
---
```

- `name`、`description` は両プラットフォーム共通の必須キーを満たす。
- `disable-model-invocation: true` は Claude Code 側の暗黙呼び出し抑止を発火する。Codex CLI 側はこのキーを無視する想定（仕様外キーは不正にならない）。
- description 本文に「明示的に指定したときのみ」「雑談では起動しない」を含めることで、両プラットフォームの description ベース起動判定でも REQ-409 を満たす（フェイルセーフ）。

### Codex CLI 用補助メタデータ

`skills/lakkhanadi-catukka/agents/openai.yaml`:

```yaml
policy:
  allow_implicit_invocation: false
```

- このファイルは Claude Code には影響せず、Codex CLI のみ参照する。
- 単一 SKILL.md を維持しつつ、Codex CLI 側の暗黙呼び出し抑止フラグを明示する。

### 配置パスの取り扱い

リポジトリ正本は `skills/lakkhanadi-catukka/` 配下に集約（NFR-301）。各プラットフォーム配置パスへは以下のいずれかで対応する（実装フェーズで確定）：

1. **ユーザーが手動コピー**（README で手順を案内、MVP の既定）
2. **シンボリックリンク**: `ln -s $REPO/skills/lakkhanadi-catukka ~/.claude/skills/lakkhanadi-catukka` ／ `ln -s $REPO/skills/lakkhanadi-catukka ~/.agents/skills/lakkhanadi-catukka`
3. **ホスト側設定**: Claude Code は CLAUDE.md などで参照、Codex CLI は `.agents/skills/` 探索パス内に配置

MVP は手動コピー＋シンボリックリンクの 2 経路を README に記載する方針（TASK-0021）。

---

## 補助スクリプト（normalize.rs）の位置づけ

両プラットフォームとも「前処理フック自動起動」の公式仕様は無いことが判明した（2026-05 時点）。したがって：

- `scripts/normalize.rs` は **LLM 経路で自動実行されない**。
- 実運用での Pali 表記正規化は **SKILL.md 内テーブル（TASK-0010）が主経路** となる。
- Rust 側の `normalize.rs` は (a) ルール表の単体テストハーネス（TASK-0015）、(b) 将来ホストが前処理フックを提供したときの実装、として残す。

二段冗長設計の意義は維持されるが、現状は SKILL.md 内テーブル単独に重みが移る。`architecture.md` / `dataflow.md` の「前処理フックあり / なし」分岐記述はそのまま維持し、本 ADR の発見事項を補足とする。

---

## 代替案と却下理由

| 代替案 | 却下理由 |
|---|---|
| プラットフォーム別 SKILL.md を 2 本維持 | 同期コストと差分起因のバグリスク。設計ヒアリングQ1 で却下済み |
| GPTs 形式で配布 | REQ-401 で明確に禁止 |
| 補助スクリプトを LLM ツール呼び出しで実行 | REQ-408（`--tools ""` 制約）で不可 |
| description を簡素にして起動を全自動化 | REQ-409（明示呼び出しのみ）に違反 |

---

## 結果と影響

- **正の影響**:
  - 単一 SKILL.md で両プラットフォームをカバー（メンテコスト低減）。
  - `disable-model-invocation` ＋ description 文言 ＋ Codex `agents/openai.yaml` の三段構えで明示呼び出し限定を担保（REQ-409）。
  - 補助スクリプトの位置づけが明確化され、二段冗長設計の重み配分が確定。
- **負の影響 / 受容するリスク**:
  - 配置パス差を吸収するためにユーザー側でコピー or シンボリックリンクが必要（MVP の運用負担）。
  - Codex CLI 仕様の流動性により、リリース直前に再確認が必要（後述）。

---

## 残された不確実性

- **Codex CLI 仕様の流動性**: 2026-05 時点の `developers.openai.com/codex/skills` 公式ドキュメントを根拠としているが、仕様変更の可能性がある。
  - **更新責任者**: 本リポジトリのメンテナ（コミッタ）
  - **確認サイクル**: (a) MVP リリース直前（TASK-0021）、(b) v0.2.0 以降のマイナーリリース毎、(c) Codex CLI 公式の changelog で skills 関連変更が告知されたとき。
  - **検出された変更点**: 本 ADR を更新し、SKILL.md / `agents/openai.yaml` / README を整合させる。
- **前処理フックの将来追加**: いずれかのプラットフォームが将来的に前処理フックを追加した場合、`scripts/normalize.rs` を経由した自動正規化が可能になる。その時点で本 ADR と `architecture.md`「補助構成」を再評価する。
- **配置パスの自動化**: ホスト側が `skills/<name>` の集約配置を直接読めるようになれば、シンボリックリンク運用は不要になる。

---

## 関連文書

- 要件定義: [requirements.md](../spec/lakkhanadi-catukka-analytics-requirements/requirements.md) REQ-401, REQ-402, REQ-403, REQ-409, NFR-301
- アーキテクチャ: [architecture.md](../design/lakkhanadi-catukka-analytics-requirements/architecture.md)
- 設計ヒアリング: [design-interview.md](../design/lakkhanadi-catukka-analytics-requirements/design-interview.md) Q1
- タスク: [TASK-0003](../tasks/lakkhanadi-catukka-analytics-requirements/TASK-0003.md)
- 公式参照: Claude Code custom skills (`https://code.claude.com/docs/en/custom-skills.md`)、Codex skills (`https://developers.openai.com/codex/skills`)
