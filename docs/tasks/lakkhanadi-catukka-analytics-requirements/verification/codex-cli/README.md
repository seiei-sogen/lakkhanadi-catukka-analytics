# Codex CLI skills 動作検証ログ

TASK-0020 で実施する Codex CLI skills 上での動作検証の結果を保存するディレクトリ。実機 LLM 推論を含むため、ユーザーが手動実行のうえログを追記する。

## 配置手順（事前準備）

ADR `docs/governance/adr_skill_platform.md` の「配置パスの取り扱い」を参照。Codex CLI は以下のパスを bottom-up に探索する（2026-05 時点）:

- `$CWD/.agents/skills/`
- 親ディレクトリの `.agents/skills/`
- `$REPO_ROOT/.agents/skills/`
- `$HOME/.agents/skills/`
- `/etc/codex/skills/`

MVP では以下のいずれか:

1. **手動コピー**:
   ```bash
   mkdir -p ~/.agents/skills
   cp -r skills/lakkhanadi-catukka ~/.agents/skills/
   ```
2. **シンボリックリンク**:
   ```bash
   mkdir -p ~/.agents/skills
   ln -s "$(pwd)/skills/lakkhanadi-catukka" ~/.agents/skills/lakkhanadi-catukka
   ```
3. **プロジェクトスコープ**:
   ```bash
   mkdir -p .agents/skills
   ln -s "$(pwd)/skills/lakkhanadi-catukka" .agents/skills/lakkhanadi-catukka
   ```

skill ディレクトリには `agents/openai.yaml`（`allow_implicit_invocation: false`）が同梱されており、暗黙呼び出しは抑止される。

## 検証項目（TC-PLAT-02）

### 1. 認識・起動テスト

Codex CLI から `lakkhanadi-catukka` skill が認識・起動できることを確認。

### 2. 7 サンプル動作確認

`skills/lakkhanadi-catukka/tests/samples/*.md` の 7 サンプルを順に実行し、各出力を `output-<sampleId>.md` として本ディレクトリに保存。Claude Code（TASK-0019）の出力と並べて比較し、以下の観点で**実用同等性**を確認:

- 4 セクション網羅
- 詳説文数（モード別）
- 応用マーカー有無
- 警告 + 観察的捉え直し（safety-medical サンプル）
- 正規化結果（norm-iast サンプル）

### 3. 前処理フック対応環境での normalize.rs 動作

Codex CLI が前処理フックを提供する場合は、Rust スクリプト経由で `norm-iast` 入力が正規化されることを確認。TC-NORM-01 〜 TC-NORM-03 相当の入力で、SKILL.md に渡る前に標準表記化されているかを検証。

### 4. 前処理フック非対応環境でのフォールバック

前処理フックを持たない環境（または手動で Rust スクリプトをスキップ）で、SKILL.md 内テーブル（TASK-0010）が単独で正規化を実行できることを確認:

- 入力「padahāna について教えて」が出力で「padaṭṭhāna」として扱われる

### 5. `--tools ""` 制約下での動作

```bash
claude --print --model claude-opus-4-6 --tools "" \
  --skill <配置パス>/lakkhanadi-catukka < input.md
```

または同等の Codex CLI コマンド形式で動作することを確認。skill 自身が外部 API・ファイル読み込みを試みていないことを観察する（REQ-408）。

### 6. 差分レポート（Claude Code との比較）

Claude Code 出力（TASK-0019 / `verification/claude-code/output-*.md`）と Codex CLI 出力（本ディレクトリ）を並べた差分レポートを `diff-vs-claude-code.md` として作成。

- 軽微な文言差（語彙選択・文長）は許容
- 構造的差分（4 相のうち 1 つが欠落、応用マーカーの有無逆転、トーンが大きく異なる）は要修正 → SKILL.md / scripts/normalize.rs にフィードバック

## 検証ログの記録

各サンプルに対する入力・出力・判定結果を以下のテンプレートで記録:

```markdown
## <sampleId>

- 実行日時:
- 入力: <full text>
- 出力: <full text or link to output-<sampleId>.md>
- judge 結果: <link to judge-result-<sampleId>.json>
- 前処理フック: あり / なし
- 手動評価: pass / fail
- 備考:
```

## 完了条件チェックリスト

ユーザー実機検証完了後、以下に [x] を付ける:

- [ ] Codex CLI が skills/lakkhanadi-catukka/ を認識・起動できる
- [ ] 7 サンプルすべての出力が本ディレクトリに保存されている
- [ ] Claude Code 出力との差分レポートが作成されている
- [ ] 前処理フック対応環境で `scripts/normalize.rs` が動作する（または非対応として記録）
- [ ] 前処理フック非対応環境で SKILL.md 内テーブルがフォールバック動作する
- [ ] `--tools ""` 制約下で動作する
- [ ] judge 評価で全サンプル `overallPass: true` または許容違反のみ
