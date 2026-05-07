# lakkhanadi-catukka-analytics-requirements 準備タスク（ユーザー作業）

> **仕様**: [requirements.md](requirements.md)
> **生成日**: 2026-05-05
>
> **2026-05-07 注記**: 「codd の language: typescript の取り扱い」項は、その後の決定で `language: rust` に変更されたため解消済み。詳細は `codd/codd.yaml` と REQ-403 を参照。

**【信頼性レベル凡例】**:
- 🔵 **青信号**: 要件定義書・ヒアリングで明確に必要と判明したタスク
- 🟡 **黄信号**: 要件定義書・設計文書から妥当に推測されるタスク
- 🔴 **赤信号**: 推測による予防的タスク

## 必須（実装開始前に完了が必要）

実装フェーズに入る前に決定・準備が必要な項目です。

- [ ] **Codex CLI の skills 形式仕様の最新確認** 🟡 *ヒアリング Round 1 / Round 4 より*
  - Codex CLI が採用する skill のディレクトリ規約・YAML フロントマター仕様（特に Claude Code skills と異なる箇所）を最新ドキュメントで確認する
  - Claude Code skills は `~/.claude/skills/<name>/SKILL.md`、Codex 側は仕様が変わり続けているため公式リポジトリの最新を参照する
  - 関連要件: REQ-402, NFR-301

- [ ] **LLM-as-judge 実行用の API キー / 認証** 🔵 *NFR-302 より*
  - `tests/judge/` で使用する LLM の API キー（Anthropic API キー、もしくは Claude Code 経由の判定でローカル実行する場合は不要）の準備
  - 認証方式は環境変数 `ANTHROPIC_API_KEY` を想定
  - 関連要件: NFR-302

## 推奨（実装中に用意できればOK）

実装は開始できますが、対応モジュールに着手するまでに準備すべき項目です。

- [ ] **応用的分析マーカーの「閾値」具体化** 🟡 *REQ-104, REQ-105 より*
  - 「古典に明示されているか」を判定する基準の具体的なリスト（例: 五蘊・四大・五感・心所・三相など）を docs/detailed_design/analysis_quality_model.md に列挙
  - 該当しないものは応用扱いとする境界を明文化
  - 必要になるフェーズ: codd Wave 4
  - 関連要件: REQ-104, REQ-105

- [ ] **正規化対象パーリ語異形リストの整備** 🔵 *REQ-107, REQ-108 より*
  - 既知異形（PRD 明示の 2 件）+ IAST 揺れの一般パターンを列挙したリスト
  - 「lakkhana ↔ lakkhaṇa」「thana ↔ ṭhāna」「nibbana ↔ nibbāna」など想定パターン
  - 必要になるフェーズ: codd Wave 3 normalizer-rules
  - 関連要件: REQ-107, REQ-108

- [ ] **LLM-as-judge 品質チェックリストの粒度確定** 🔵 *NFR-302 より*
  - 「4 セクション網羅 / 各 3〜5 文 / 具体例の有無 / 現代語併記 / 観察トーン / 応用マーカー」など、judge が判定する各観点の合否基準を明文化
  - 必要になるフェーズ: codd Wave 5 test-strategy
  - 関連要件: NFR-302

- [ ] **「短く」「詳しく」シグナル語の辞書整備** 🟡 *REQ-101, REQ-102 より*
  - 検出対象シグナルの和英バリエーション（短く / 簡潔に / briefly / 詳しく / 具体的に / 納得感ある感じで など）を列挙
  - 必要になるフェーズ: codd Wave 3 prompt-structure
  - 関連要件: REQ-101, REQ-102, REQ-103

## 確認事項（判断が必要）

実装方針に影響する判断項目です。設計フェーズ開始前に決定すると後戻りが減ります。

- [ ] **codd の language: typescript の取り扱い** 🟡 *Round 1 ヒアリング結果と codd 設定の整合*
  - skill 本体は markdown 中心にする方針が確定したが、codd `codd.yaml` の `language: typescript` は維持してよいか
  - 補助スクリプト（judge ランナー、正規化辞書ローダーなど）を TypeScript で書く前提なら維持、純 markdown のみなら他言語への変更も検討
  - 関連要件: REQ-403

- [ ] **medical/legal/religious の警告文テンプレートの定型化** 🔵 *REQ-106, REQ-405 より*
  - 警告文（例: 「医療・法律・宗教の権威としての断定はせず、観察対象として整理します」）を SKILL.md に固定文として埋め込むか、状況依存で生成するか
  - 関連要件: REQ-106, REQ-405

- [ ] **複数対象入力時の選択ロジックの方針確認** 🔵 *EDGE-004 より*
  - 「中心的と思われる 1 対象を選ぶ」の選択基準（最初に出現したもの / もっとも詳述されているもの / ユーザーへ確認を返す）の方針確定
  - 関連要件: EDGE-004

- [ ] **codd Wave 1 ADR（Codex skill platform）の更新** 🟡 *Round 1「両方対応」より*
  - codd.yaml では governance:adr-skill-platform が「Codex skill（GPTs ではない）」とだけ記述されている
  - 「Claude Code skills との両対応」という追加方針を ADR に反映するか確認
  - 関連要件: REQ-401, REQ-402

---

## サマリー

| 優先度 | 件数 | 🔵 | 🟡 | 🔴 |
|--------|------|-----|-----|-----|
| 必須 | 2 | 1 | 1 | 0 |
| 推奨 | 4 | 2 | 2 | 0 |
| 確認事項 | 4 | 2 | 2 | 0 |
| **合計** | **10** | **5** | **5** | **0** |

## 関連文書

- **要件定義書**: [requirements.md](requirements.md)
- **ヒアリング記録**: [interview-record.md](interview-record.md)
- **ユーザストーリー**: [user-stories.md](user-stories.md)
- **受け入れ基準**: [acceptance-criteria.md](acceptance-criteria.md)
