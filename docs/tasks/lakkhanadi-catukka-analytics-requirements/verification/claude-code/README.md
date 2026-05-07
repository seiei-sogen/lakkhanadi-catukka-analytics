# Claude Code skills 動作検証ログ

TASK-0019 で実施する Claude Code skills 上での動作検証の結果を保存するディレクトリ。実機 LLM 推論を含むため、ユーザーが手動実行のうえログを追記する。

## 配置手順（事前準備）

ADR `docs/governance/adr_skill_platform.md` の「配置パスの取り扱い」を参照。MVP では以下のいずれか:

1. **手動コピー**:
   ```bash
   cp -r skills/lakkhanadi-catukka ~/.claude/skills/
   ```
2. **シンボリックリンク**:
   ```bash
   ln -s "$(pwd)/skills/lakkhanadi-catukka" ~/.claude/skills/lakkhanadi-catukka
   ```
3. **プロジェクトスコープ**:
   ```bash
   mkdir -p .claude/skills
   ln -s "$(pwd)/skills/lakkhanadi-catukka" .claude/skills/lakkhanadi-catukka
   ```

## 検証項目（TC-PLAT-01, TC-PLAT-03, TC-PLAT-04）

### 1. 起動テスト（明示呼び出し / TC-PLAT-04）

以下の入力で `lakkhanadi-catukka` skill が**起動する**ことを確認:

- 「lakkhanadi-catukka で pathavī-dhātu を分析して」
- 「四相分析を実行して: 嫉妬」
- 「lakkhaṇa rasa paccupaṭṭhāna padaṭṭhāna で焦りを分析」

以下の入力で skill が**起動しない**ことを確認:

- 「今日の天気は？」
- 「Rust で関数の引数チェックを書いて」
- 「Hello」

### 2. 日本語固定出力（TC-PLAT-03 / REQ-404）

英語入力に対しても出力が日本語であることを確認:

- 入力: `Please do a four-phase analysis (lakkhanadi-catukka) of TCP connection.`
- 期待: 出力本文・要約表ヘッダ・項目名すべて日本語

### 3. 7 サンプル動作確認

`skills/lakkhanadi-catukka/tests/samples/*.md` の 7 サンプルを順に実行し、各出力を `output-<sampleId>.md` として本ディレクトリに保存。出力品質は `tests/judge/SKILL_JUDGE.md`（TASK-0018）で評価。

### 4. 前処理フック動作（任意）

Claude Code が `scripts/normalize.rs` を前処理として呼び出す機構を持つ場合、`norm-iast.md` 入力で正規化が走ることを確認。持たない場合は SKILL.md 内テーブル（TASK-0010）でフォールバックすることを確認。

### 5. 検証ログの記録

各サンプルに対する入力・出力・判定結果を以下のテンプレートで記録:

```markdown
## <sampleId>

- 実行日時:
- 入力: <full text>
- 出力: <full text or link to output-<sampleId>.md>
- judge 結果: <link to judge-result-<sampleId>.json>
- 手動評価: pass / fail
- 備考:
```

実行ログのファイル名規約: `output-<sampleId>.md`、`judge-result-<sampleId>.json`、`run-<timestamp>.md`（メタログ）。

## 完了条件チェックリスト

ユーザー実機検証完了後、以下に [x] を付ける:

- [ ] skills/lakkhanadi-catukka/ が Claude Code から認識される
- [ ] 明示呼び出し 3 例で skill が起動する
- [ ] 雑談 3 例で skill が起動しない（または起動条件を求める応答が返る）
- [ ] 英語入力 1 例で日本語出力が得られる
- [ ] 7 サンプルすべての出力が本ディレクトリに保存されている
- [ ] judge 評価で全サンプル `overallPass: true` または許容違反のみ
- [ ] 前処理フックの有無と動作差を記録
