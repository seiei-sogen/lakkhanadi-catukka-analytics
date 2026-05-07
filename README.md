# lakkhanadi-catukka-analytics

上座部アビダンマの**四相分析**（lakkhaṇa／rasa／paccupaṭṭhāna／padaṭṭhāna）を行う Coding Agent 向け Skill。任意の対象（概念・経験・感情・現象・文章・技術概念）を 4 項目で観察的に整理し、日本語で出力します。

## 目的

GPTs として運用していた四相分析プロンプトを、Claude Code skills と Codex CLI skills の両プラットフォーム向けに移植・再設計したものです。Markdown プロンプト主体・ツール非依存（`--tools ""`）で動作します。

## 対応プラットフォーム

| プラットフォーム | 配置パス | 暗黙呼び出し抑止フラグ |
|---|---|---|
| Claude Code skills | `~/.claude/skills/lakkhanadi-catukka/` または `.claude/skills/lakkhanadi-catukka/` | `disable-model-invocation: true`（フロントマター） |
| Codex CLI skills | `~/.agents/skills/lakkhanadi-catukka/` または `.agents/skills/lakkhanadi-catukka/` | `agents/openai.yaml` の `policy.allow_implicit_invocation: false` |

詳細は [`docs/governance/adr_skill_platform.md`](docs/governance/adr_skill_platform.md) を参照。

## 配置方法（インストール）

リポジトリをクローンしたうえで、いずれかのプラットフォームに配置します。

### Claude Code skills の場合

```bash
# 個人スコープ
ln -s "$(pwd)/skills/lakkhanadi-catukka" ~/.claude/skills/lakkhanadi-catukka

# プロジェクトスコープ
mkdir -p .claude/skills
ln -s "$(pwd)/skills/lakkhanadi-catukka" .claude/skills/lakkhanadi-catukka
```

### Codex CLI skills の場合

```bash
# 個人スコープ
mkdir -p ~/.agents/skills
ln -s "$(pwd)/skills/lakkhanadi-catukka" ~/.agents/skills/lakkhanadi-catukka

# プロジェクトスコープ
mkdir -p .agents/skills
ln -s "$(pwd)/skills/lakkhanadi-catukka" .agents/skills/lakkhanadi-catukka
```

## 起動トリガー（明示呼び出し）

本 Skill は **明示呼び出しでのみ起動** します（REQ-409）。雑談・一般的なコーディング依頼では起動しません。

起動する例:

- 「lakkhanadi-catukka で pathavī-dhātu を分析して」
- 「四相分析を実行して: 嫉妬」
- 「lakkhaṇa rasa paccupaṭṭhāna padaṭṭhāna で焦りを分析」

起動しない例:

- 「今日の天気は？」
- 「Rust で関数の引数チェックを書いて」

## 出力フォーマット例

```markdown
pathavī-dhātu とは、ここでは「物質を受けとめる『硬さ・支え』として現れる側面」として扱います。

| 項目 | パーリ語 | 要約 |
| --- | --- | --- |
| 特相 | lakkhaṇa | 硬さ。受けとめる芯としての性質。 |
| 作用 | rasa | 共生する物質の基盤として支える働き。 |
| 現れ方 | paccupaṭṭhāna | 受けとめ・受け取りとして観察される。 |
| 近因 | padaṭṭhāna | 残り三大（水・火・風）の共在。 |

## 特相（lakkhaṇa）
…（3〜5 文の詳説）…

## 作用（rasa）
…

## 現れ方（paccupaṭṭhāna）
…

## 近因（padaṭṭhāna）
…

## 一言でまとめると
…
```

## 出力長モードの切替

入力に含まれる長さシグナルで自動切替されます（REQ-101〜103）。

| 入力例 | モード | 各詳説の文数 |
|---|---|---|
| 「忙しいので**短く**嫉妬を四相分析して」 | `short` | 1〜2 文（または省略） |
| 「嫉妬を四相分析して」 | `normal` | 3〜5 文 |
| 「**詳しく**、納得感ある感じで嫉妬を四相分析して」 | `detailed` | 5〜8 文 |

要約表（4 行 × 3 列）はすべてのモードで完全に維持されます。

## 安全性に関する注記

本 Skill は**医療・法律・宗教の権威としての断定は行いません**（REQ-405）。診断要求・法的是非・教義の真偽断定の入力に対しては、警告と観察的捉え直しを冒頭に挿入したうえで、観察可能な現象として四相分析を行います（REQ-106）。`medical / legal / religious` カテゴリでは末尾に専門家相談を促す一文が添えられます（REQ-201）。

## 補助スクリプト `normalize.rs`（任意・二段冗長）

`skills/lakkhanadi-catukka/scripts/normalize.rs` は、パーリ語表記の **既知異形**（padahāna→padaṭṭhāna 等）と **IAST／ダイアクリティカル揺れ**（lakkhana→lakkhaṇa 等）を標準表記に変換する Rust 補助スクリプトです。

- ホストが**前処理フック**を持つ環境では、本スクリプトが入力を SKILL.md に渡す前に正規化を行います。
- ホストが前処理フックを持たない環境では、SKILL.md 内テーブル（「2. Pali 表記正規化」セクション）が同等の正規化を LLM 自身に実行させます（**二段冗長設計**）。
- 単独テスト: `cargo test`

> 2026-05 時点では Claude Code・Codex CLI の双方とも公式に前処理フック機構を持たないため、実運用では SKILL.md 内テーブルが主経路となります。

## LLM-as-judge による品質評価（NFR-302）

`skills/lakkhanadi-catukka/tests/judge/SKILL_JUDGE.md` は、Skill 出力を 8 観点で構造化判定（pass / fail / n/a）する判定プロンプトです。`tests/samples/*.md` の 7 サンプルと組み合わせて Skill の品質を継続的に評価します。

実行手順は [`skills/lakkhanadi-catukka/tests/judge/run.md`](skills/lakkhanadi-catukka/tests/judge/run.md) を参照。

## ディレクトリ構造

```
.
├── skills/lakkhanadi-catukka/
│   ├── SKILL.md                     # Skill 本体プロンプト
│   ├── agents/openai.yaml           # Codex CLI 補助メタデータ
│   ├── scripts/
│   │   └── normalize.rs             # Pali 表記正規化（Rust 補助）
│   ├── tests/
│   │   ├── samples/*.md (× 7)       # 入力サンプル
│   │   └── judge/
│   │       ├── SKILL_JUDGE.md       # 判定プロンプト
│   │       ├── run.md               # 実行手順
│   │       ├── summary-template.md  # 集計テンプレート
│   │       └── fixtures-bad/        # 故意違反サンプル（自己テスト用）
│   └── reference/
│       └── lakkhanadi-catukka-example.ncl  # 構造化リファレンス
├── Cargo.toml                       # Rust crate 設定
├── docs/
│   ├── spec/                        # 要件定義
│   ├── design/                      # 設計（architecture/dataflow/interfaces）
│   ├── tasks/                       # タスク管理
│   ├── governance/adr_skill_platform.md  # プラットフォーム選定 ADR
│   ├── known-limitations.md         # 既知制限
│   └── release/v0.1.0-checklist.md  # リリース受け入れチェック
├── codd/codd.yaml                   # codd ワークフロー設定
└── lakkhanadi-catukka-example.ncl   # 構造化リファレンス（Nickel Lang）
```

## 既知制限

[docs/known-limitations.md](docs/known-limitations.md) を参照。

## ライセンス

[LICENSE](LICENSE) を参照。
